import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import TrieSet "mo:base/TrieSet";

import Arr "./Array";
import GT "./GovernanceTypes";
import T "./Types";
import Proxy "./Proxy";

shared actor class AxonService() = this {
  // ---- State

  stable var axonEntries: [T.AxonEntries] = [];
  stable var lastAxonId: Nat = 0;
  var axons: [var T.AxonFull] = [var];

  // ---- Constants

  // Default voting period for pending actions, 1 day
  let DEFAULT_DURATION_SEC = 24 * 60 * 60;
  // Minimum voting period for pending actions, 4 hours
  let MINIMUM_DURATION_SEC = 4 * 60 * 60;


  //---- Public queries

  public query func count() : async Nat {
    lastAxonId
  };

  public query func axonById(id: Nat) : async T.Axon {
    axons[id]
  };

  public query func getNeuronIds(id: Nat) : async [Nat64] {
    neuronIdsFromInfos(id)
  };

  public query({ caller }) func balanceOf(id: Nat) : async Nat {
    let {ledger} = axons[id];
    Option.get(ledger.get(caller), 0)
  };


  //---- Permissioned queries

  // Get all full neurons. If private, only owners can call
  public query({ caller }) func getNeurons(id: Nat) : async T.ListNeuronsResult {
    let { visibility; ledger; neurons } = axons[id];
    if (visibility == #Private and not isAuthed(caller, ledger)) {
      return #err(#Unauthorized)
    };

    switch (neurons) {
      case (?data) {
        #ok(data)
      };
      case _ { #err(#NotFound) }
    }
  };

  // Get all pending actions. If private, only owners can call
  public query({ caller }) func getPendingProposals(id: Nat) : async T.ProposalResult {
    let { visibility; ledger; pendingProposals } = axons[id];
    if (visibility == #Private and not isAuthed(caller, ledger)) {
      return #err(#Unauthorized)
    };

    #ok(pendingProposals)
  };

  // Get last 100 proposals, optionally before the specified id. If private, only owners can call
  public query({ caller }) func getAllProposals(id: Nat, before: ?Nat) : async T.ProposalResult {
    let { visibility; ledger; allProposals } = axons[id];
    if (visibility == #Private and not isAuthed(caller, ledger)) {
      return #err(#Unauthorized)
    };

    let filtered = switch(before) {
      case (?before_) {
        Array.filter<T.AxonProposal>(allProposals, func(p) {
          p.id < before_
        });
      };
      case null { allProposals }
    };
    let size = filtered.size();
    if (size == 0) {
      return #ok([]);
    };

    #ok(Prim.Array_tabulate<T.AxonProposal>(Nat.min(100, size), func (i) {
      filtered.get(size - i - 1);
    }));
  };


  //---- Updates


  // Transfer tokens
  public shared({ caller }) func transfer(id: Nat, dest: Principal, amount: Nat) : async T.Result<()> {
    let {ledger} = axons[id];
    let balance = Option.get(ledger.get(caller), 0);
    if (amount > balance) {
      #err(#InsufficientBalance)
    } else {
      ledger.put(caller, balance - amount);
      ledger.put(dest, Option.get(ledger.get(dest), 0) + amount);
      #ok
    }
  };

  // Create a new Axon
  public shared({ caller }) func create(init: T.Initialization) : async T.Axon {
    // Verify at least one ledger entry
    assert(init.ledgerEntries.size() > 0);
    let supply = Array.foldLeft<(Principal,Nat), Nat>(init.ledgerEntries, 0, func(sum, c) { sum + c.1 });

    let axon: T.AxonFull = {
      id = lastAxonId;
      proxy = await Proxy.Proxy(Principal.fromActor(this));
      name = init.name;
      visibility = init.visibility;
      policy = init.policy;
      supply = supply;
      ledger = HashMap.fromIter<Principal, Nat>(init.ledgerEntries.vals(), init.ledgerEntries.size(), Principal.equal, Principal.hash);
      neurons = null;
      allProposals = [];
      pendingProposals = [];
      lastProposalId = 0;
    };
    axons := Array.thaw(Array.append(Array.freeze(axons), [axon]));
    lastAxonId += 1;
    axon
  };

  // Submit a new Axon proposal
  public shared({ caller }) func propose(request: T.NewProposal) : async T.Result<()> {
    let axon = axons[request.axonId];
    if (not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized);
    };

    switch (axon.policy.proposers) {
      case (#Closed(owners)) {
        if (not Arr.contains(owners, caller, Principal.equal)) {
          return #err(#NotProposer);
        }
      };
      case _ {};
    };

    if (Option.get(axon.ledger.get(caller), 0) < axon.policy.proposeThreshold) {
      return #err(#InsufficientBalanceToPropose);
    };

    switch (request.proposal) {
      case (#NeuronCommand((command,_))) {
        if (neuronIdsFromInfos(axon.id).size() == 0) {
          return #err(#NoNeurons);
        };
      };
      case (#AxonCommand((command,_))) {
        // Can add other ACL logic for axon commands here
      };
    };

    // Snapshot the ledger at creation
    let ballots = Array.map<T.LedgerEntry, T.Ballot>(Iter.toArray(axon.ledger.entries()), func((p,n)) {
      {
        principal = p;
        votingPower = n;
        // Auto vote for caller
        vote = if (p == caller) { ?(#Yes) } else { null };
      }
    });
    let now = Time.now();
    let timeStart = Option.get(request.timeStart, now);
    // Create the proposal, count ballots, then execute if conditions are met
    let newProposal: T.AxonProposal = _applyExecutingStatus(_applyNewStatus({
      id = axon.lastProposalId;
      timeStart = timeStart;
      timeEnd = timeStart + secsToNanos(Nat.min(MINIMUM_DURATION_SEC, Option.get(request.durationSeconds, DEFAULT_DURATION_SEC)));
      ballots = ballots;
      totalVotes = Array.foldLeft<T.Ballot, T.Votes>(
        ballots, {yes = 0; no = 0; notVoted = 0}, func({yes; no; notVoted}, {vote; votingPower}) {
          {
            yes = if (vote == ?#Yes) { yes + votingPower } else { yes };
            no = no;
            notVoted = if (Option.isNull(vote)) { notVoted + votingPower } else { notVoted }
          }
        });
      creator = caller;
      proposal = request.proposal;
      status = #Pending;
      policy = axon.policy;
    }), request.execute == ?true and timeStart == now);

    axons[axon.id] := {
      id = axon.id;
      proxy = axon.proxy;
      name = axon.name;
      visibility = axon.visibility;
      supply = axon.supply;
      ledger = axon.ledger;
      policy = axon.policy;
      neurons = axon.neurons;
      allProposals = axon.allProposals;
      pendingProposals = Array.append(axon.pendingProposals, [newProposal]);
      lastProposalId = axon.lastProposalId + 1;
    };

    // Start the execution
    switch (newProposal.status) {
      case (#Executing(_)) {
        ignore _doExecute(axons[axon.id], newProposal);
      };
      case _ {}
    };

    #ok
  };

  // Vote on an pending proposal
  public shared({ caller }) func vote(request: T.VoteRequest) : async T.Result<()> {
    let axon = axons[request.axonId];
    if (not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized)
    };

    let now = Time.now();
    var result: T.Result<()> = #err(#NotFound);
    var proposal: ?T.AxonProposal = null;
    let pendingProposals = Array.map<T.AxonProposal, T.AxonProposal>(axon.pendingProposals, func(p) {
      if (p.id != request.proposalId) {
        return p;
      };

      let ballots = Array.map<T.Ballot, T.Ballot>(p.ballots, func(b) {
        if (b.principal == caller) {
          if (Option.isSome(b.vote)) {
            result := #err(#AlreadyVoted);
            return b
          } else {
            result := #ok();
            return {
              principal = caller;
              votingPower = b.votingPower;
              vote = ?request.vote;
            }
          }
        } else {
          return b;
        }
      });
      proposal := ?_applyNewStatus({
        id = p.id;
        ballots = ballots;
        totalVotes = _countVotes(ballots);
        timeStart = p.timeStart;
        timeEnd = p.timeEnd;
        creator = p.creator;
        proposal = p.proposal;
        status = p.status;
        policy = p.policy;
      });
      Option.unwrap(proposal)
    });

    if (Result.isOk(result)) {
      let updatedProposal = Option.unwrap(proposal);
      Debug.print("updatedProposal " # debug_show(updatedProposal));

      let proposals = switch (updatedProposal.status) {
        // Remove from pending list if rejected
        case (#Rejected(_)) {
          (Array.append(axon.allProposals, [updatedProposal]),
          Array.filter<T.AxonProposal>(pendingProposals, func(p) {
            p.id != updatedProposal.id
          }))
        };
        case _ { (axon.allProposals, pendingProposals) };
      };
      axons[axon.id] := {
        id = axon.id;
        proxy = axon.proxy;
        name = axon.name;
        visibility = axon.visibility;
        supply = axon.supply;
        ledger = axon.ledger;
        policy = axon.policy;
        neurons = axon.neurons;
        allProposals = proposals.0;
        pendingProposals = proposals.1;
        lastProposalId = axon.lastProposalId;
      };

      // Execute if accepted
      switch (updatedProposal.status) {
        case (#Accepted(_)) {
          ignore execute(axon.id, updatedProposal.id);
        };
        case _ {}
      }
    };

    result
  };

  // Set status to Executing and perform execution
  public shared({ caller }) func execute(axonId: Nat, proposalId: Nat) : async T.Result<T.AxonProposal> {
    let axon = axons[axonId];
    if (not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized)
    };

    var found: ?T.AxonProposal = null;
    let pendingProposals = Array.map<T.AxonProposal, T.AxonProposal>(axon.pendingProposals, func(p) {
      if (p.id != proposalId) {
        return p;
      };

      switch (p.status) {
        case (#Accepted(_)) {
          found := ?{
            id = p.id;
            totalVotes = p.totalVotes;
            ballots = p.ballots;
            timeStart = p.timeStart;
            timeEnd = p.timeEnd;
            creator = p.creator;
            proposal = p.proposal;
            status = #Executing(Time.now());
            policy = p.policy;
          };
        };
        // Trap and revert if not accepted
        case _ { assert(false) }
      };
      Option.unwrap(found)
    });

    axons[axon.id] := {
      id = axon.id;
      proxy = axon.proxy;
      name = axon.name;
      visibility = axon.visibility;
      supply = axon.supply;
      ledger = axon.ledger;
      policy = axon.policy;
      neurons = axon.neurons;
      allProposals = axon.allProposals;
      pendingProposals = pendingProposals;
      lastProposalId = axon.lastProposalId;
    };

    let proposal = Option.unwrap(found);

    #ok(await _doExecute(axons[axon.id], proposal));
  };

  // Call list_neurons() and save the list of neurons that this axon's proxy controls
  public shared({ caller }) func sync(id: Nat) : async T.ListNeuronsResult {
    let axon = axons[id];
    if (axon.visibility == #Private and not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized)
    };

    let response = await axon.proxy.list_neurons();
    axons[id] := {
      id = axon.id;
      proxy = axon.proxy;
      name = axon.name;
      visibility = axon.visibility;
      supply = axon.supply;
      ledger = axon.ledger;
      policy = axon.policy;
      neurons = ?response;
      allProposals = axon.allProposals;
      pendingProposals = axon.pendingProposals;
      lastProposalId = axon.lastProposalId;
    };

    // Since this will be called from the client periodically, call cleanup
    ignore cleanup(axon.id);

    #ok(response)
  };

  // Remove expired proposals. Called by sync
  public shared({ caller }) func cleanup(id: Nat) : async T.Result<()> {
    let axon = axons[id];
    if (not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized)
    };

    let expired = Buffer.Buffer<T.AxonProposal>(0);
    let now = Time.now();
    let pendingProposals = Array.filter<T.AxonProposal>(axon.pendingProposals, func(proposal) {
      let updatedProposal = _applyNewStatus(proposal);
      let shouldKeep = switch (updatedProposal.status) {
        case (#Expired(_)) { false };
        case _ { true }
      };
      if (not shouldKeep) {
        expired.add(updatedProposal);
      };
      shouldKeep
    });

    // Move expired actions from pending to all
    if (expired.size() > 0) {
      let expiredArr = expired.toArray();
      axons[axon.id] := {
        id = axon.id;
        proxy = axon.proxy;
        name = axon.name;
        visibility = axon.visibility;
        supply = axon.supply;
        ledger = axon.ledger;
        policy = axon.policy;
        neurons = axon.neurons;
        allProposals = Array.append(axon.allProposals, expiredArr);
        pendingProposals = pendingProposals;
        lastProposalId = axon.lastProposalId;
      };
    };

    #ok();
  };


  // ---- System functions

  system func preupgrade() {
    // Persist ledger hashmap entries
    axonEntries := Array.map<T.AxonFull, T.AxonEntries>(Array.freeze(axons), func(axon) {
      {
        id = axon.id;
        proxy = axon.proxy;
        name = axon.name;
        visibility = axon.visibility;
        supply = axon.supply;
        ledgerEntries = Iter.toArray(axon.ledger.entries());
        policy = axon.policy;
        neurons = axon.neurons;
        allProposals = axon.allProposals;
        pendingProposals = axon.pendingProposals;
        lastProposalId = axon.lastProposalId;
      }
    });
  };

  system func postupgrade() {
    // Restore ledger hashmap from entries
    axons := Array.thaw(Array.map<T.AxonEntries, T.AxonFull>(axonEntries, func(axon) {
      {
        id = axon.id;
        proxy = axon.proxy;
        name = axon.name;
        visibility = axon.visibility;
        supply = axon.supply;
        ledger = HashMap.fromIter<Principal, Nat>(axon.ledgerEntries.vals(), axon.ledgerEntries.size(), Principal.equal, Principal.hash);
        policy = axon.policy;
        neurons = axon.neurons;
        allProposals = axon.allProposals;
        pendingProposals = axon.pendingProposals;
        lastProposalId = axon.lastProposalId;
      }
    }));
    axonEntries := [];
  };


  // ---- Internal functions

  func _countVotes(ballots: [T.Ballot]): T.Votes {
    Array.foldLeft<T.Ballot, T.Votes>(
      ballots, { yes = 0; no = 0; notVoted = 0}, func(sums, {vote; votingPower}) {
        if (vote == ?#Yes) {
          { yes = sums.yes + votingPower; no = sums.no; notVoted = sums.notVoted }
        } else if (vote == ?#No) {
          { yes = sums.yes; no = sums.no + votingPower; notVoted = sums.notVoted }
        } else {
          { yes = sums.yes; no = sums.no; notVoted = sums.notVoted + votingPower }
        }
      }
    );
  };

  // Applies a status like Accepted, Rejected or Expired based on current conditions
  func _applyNewStatus(proposal: T.AxonProposal): T.AxonProposal {
    let { yes; no; notVoted } = proposal.totalVotes;
    let totalVotingPower = yes + no + notVoted;

    // First, calculate quorum if required, and the absolute threshold
    let (quorumVotes, absoluteThresholdVotes) = switch (proposal.policy.acceptanceThreshold) {
      case (#Percent({ percent; quorum })) {
        switch (quorum) {
          case (?quorum_) {
            let quorumVotes = percentOf(quorum_, totalVotingPower);
            (?quorumVotes, percentOf(percent, quorumVotes))
          };
          case _ { (null, percentOf(percent, totalVotingPower)) };
        }
      };
      case (#Absolute(amount)) { (null, amount) };
    };
    Debug.print("totalVotes: " # debug_show(proposal.totalVotes) # " quorumVotes: " # debug_show(quorumVotes) # " absoluteThresholdVotes: " # debug_show(absoluteThresholdVotes));
    let now = Time.now();
    let maybeNewStatus = if (yes >= absoluteThresholdVotes) {
      // Accept if we have exceeded the absolute threshold
      ?(#Accepted(now));
    } else {
      switch (proposal.policy.acceptanceThreshold) {
        case (#Percent({ percent; quorum })) {
          if (now >= proposal.timeEnd) {
            // Voting has ended, accept if yes votes exceed the required threshold
            let totalVotes = no + yes;
            let quorumVotes_ = Option.get(quorumVotes, 0);
            let thresholdOfVoted = percentOf(percent, totalVotes);
            if (totalVotes >= quorumVotes_ and yes >= thresholdOfVoted) {
              ?(#Accepted(now));
            } else {
              ?(#Expired(now));
            }
          } else if (absoluteThresholdVotes > yes + notVoted) {
            // Reject if we cannot reach the absolute threshold
            ?(#Rejected(now));
          } else {
            null
          }
        };
        case _ {
          if (absoluteThresholdVotes > yes + notVoted) {
            // Reject if we cannot reach the absolute threshold
            ?(#Rejected(now));
          } else if (now >= proposal.timeEnd) {
            ?(#Expired(now));
          } else {
            null
          }
        }
      }
    };
    {
      id = proposal.id;
      totalVotes = proposal.totalVotes;
      ballots = proposal.ballots;
      timeStart = proposal.timeStart;
      timeEnd = proposal.timeEnd;
      creator = proposal.creator;
      proposal = proposal.proposal;
      status = Option.get(maybeNewStatus, proposal.status);
      policy = proposal.policy;
    }
  };

  func _applyAxonCommand(axon: T.AxonFull, request: T.AxonCommandRequest) : T.Result<T.AxonFull> {
    switch(request) {
      case (#SetPolicy(policy)) {
        switch (policy.proposers) {
          case (#Closed(current)) {
            assert(current.size() > 0);
          };
          case _ {}
        };
        #ok({
          id = axon.id;
          proxy = axon.proxy;
          name = axon.name;
          visibility = axon.visibility;
          supply = axon.supply;
          ledger = axon.ledger;
          policy = policy;
          neurons = axon.neurons;
          allProposals = axon.allProposals;
          pendingProposals = axon.pendingProposals;
          lastProposalId = axon.lastProposalId;
        })
      };
      case (#SetVisibility(visibility)) {
        #ok({
          id = axon.id;
          proxy = axon.proxy;
          name = axon.name;
          visibility = visibility;
          supply = axon.supply;
          ledger = axon.ledger;
          policy = axon.policy;
          neurons = axon.neurons;
          allProposals = axon.allProposals;
          pendingProposals = axon.pendingProposals;
          lastProposalId = axon.lastProposalId;
        })
      };
      case (#AddMembers(principals)) {
        switch (axon.policy.proposers) {
          case (#Closed(current)) {
            let curr = TrieSet.fromArray<Principal>(current, Principal.hash, Principal.equal);
            let new = TrieSet.fromArray<Principal>(principals, Principal.hash, Principal.equal);
            // diff = new - curr
            let diff = TrieSet.toArray(TrieSet.diff(new, curr, Principal.equal));
            #ok({
              id = axon.id;
              proxy = axon.proxy;
              name = axon.name;
              visibility = axon.visibility;
              supply = axon.supply;
              ledger = axon.ledger;
              policy = {
                // current += diff
                proposers = #Closed(Array.append(current, diff));
                proposeThreshold = axon.policy.proposeThreshold;
                acceptanceThreshold = axon.policy.acceptanceThreshold;
              };
              neurons = axon.neurons;
              allProposals = axon.allProposals;
              pendingProposals = axon.pendingProposals;
              lastProposalId = axon.lastProposalId;
            })

          };
          case _ {
            #err(#InvalidProposal);
          }
        }
      };
      case (#RemoveMembers(principals)) {
        switch (axon.policy.proposers) {
          case (#Closed(current)) {
            let curr = TrieSet.fromArray<Principal>(current, Principal.hash, Principal.equal);
            let new = TrieSet.fromArray<Principal>(principals, Principal.hash, Principal.equal);
            let diff = TrieSet.toArray(TrieSet.diff(curr, new, Principal.equal));
            assert(diff.size() > 0);
            #ok({
              id = axon.id;
              proxy = axon.proxy;
              name = axon.name;
              visibility = axon.visibility;
              supply = axon.supply;
              ledger = axon.ledger;
              policy = {
                proposers = #Closed(diff);
                proposeThreshold = axon.policy.proposeThreshold;
                acceptanceThreshold = axon.policy.acceptanceThreshold;
              };
              neurons = axon.neurons;
              allProposals = axon.allProposals;
              pendingProposals = axon.pendingProposals;
              lastProposalId = axon.lastProposalId;
            })

          };
          case _ {
            #err(#InvalidProposal);
          }
        }
      };
      case (#Redenominate(params)) {
        Prelude.nyi()
      }
    };
  };

  // Execute accepted proposal
  func _doExecute(axon: T.AxonFull, proposal: T.AxonProposal) : async T.AxonProposal {
    var maybeNewAxon: ?T.AxonFull = null;
    let proposalType = switch (proposal.proposal) {
      case (#NeuronCommand((command,_))) {
        // Forward command to specified neurons, or all
        let neuronIds = neuronIdsFromInfos(axon.id);
        let proposalResponses = Buffer.Buffer<T.NeuronCommandResponse>(neuronIds.size());
        let specifiedNeuronIds = Option.get(command.neuronIds, neuronIds);
        for (id in specifiedNeuronIds.vals()) {
          try {
            let response = await axon.proxy.manage_neuron({id = ?{id = id}; command = ?command.command});
            proposalResponses.add((id, #ok(response)));
          } catch (error) {
            // TODO: Command failed to deliver, retry if possible?
            proposalResponses.add((id, #err(makeError(error))));
          };
        };
        #NeuronCommand((command, ?proposalResponses.toArray()))
      };
      case (#AxonCommand((command,_))) {
        let response = _applyAxonCommand(axon, command);
        switch (response) {
          case (#ok(axon)) {
            maybeNewAxon := ?axon;
            axons[axon.id] := axon;
          };
          case _ {}
        };
        #AxonCommand((command, ?Result.mapOk<T.AxonFull, (), T.Error>(response, func(_) { })))
      };
    };
    let newAxon = Option.get(maybeNewAxon, axon);

    // Save responses for this proposal
    let executedProposal: T.AxonProposal = {
      id = proposal.id;
      totalVotes = proposal.totalVotes;
      ballots = proposal.ballots;
      timeStart = proposal.timeStart;
      timeEnd = proposal.timeEnd;
      creator = proposal.creator;
      proposal = proposalType;
      status = #Executed(Time.now());
      policy = proposal.policy;
    };

    // Move executed proposal from pending to all
    axons[newAxon.id] := {
      id = newAxon.id;
      proxy = newAxon.proxy;
      name = newAxon.name;
      visibility = newAxon.visibility;
      supply = newAxon.supply;
      ledger = newAxon.ledger;
      policy = newAxon.policy;
      neurons = newAxon.neurons;
      allProposals = Array.append(newAxon.allProposals, [executedProposal]);
      pendingProposals = Array.filter<T.AxonProposal>(newAxon.pendingProposals, func(p) { p.id != proposal.id });
      lastProposalId = newAxon.lastProposalId;
    };

    executedProposal
  };

  // If proposal is accepted and conditions are met, return it with status Executing
  func _applyExecutingStatus(proposal: T.AxonProposal, conditions: Bool) : T.AxonProposal {
    switch (proposal.status, conditions) {
      case (#Accepted(_), true) {
        {
          id = proposal.id;
          totalVotes = proposal.totalVotes;
          ballots = proposal.ballots;
          timeStart = proposal.timeStart;
          timeEnd = proposal.timeEnd;
          creator = proposal.creator;
          proposal = proposal.proposal;
          status = #Executing(Time.now());
          policy = proposal.policy;
        };
      };
      case _ { proposal }
    };
  };

  // ---- Helpers

  // Returns true if the principal holds a balance in ledger, OR if it's this canister
  func isAuthed(principal: Principal, ledger: T.Ledger): Bool {
    principal == Principal.fromActor(this) or
    Option.isSome(ledger.get(principal))
  };

  // Return neuron IDs from stored neuron_infos
  func neuronIdsFromInfos(id: Nat) : [Nat64] {
    switch (axons[id].neurons) {
      case (?data) {
        Array.map<(Nat64, GT.NeuronInfo), Nat64>(data.neuron_infos, func(i) { i.0 })
      };
      case _ { [] }
    }
  };

  func percentOf(percent: Nat, n: Nat): Nat { (percent * n) / 100_000_000 };

  func secsToNanos(s: Nat): Nat { 1_000_000_000 * s };

  func makeError(e: Error): T.Error {
    #Error({
      error_message = Error.message(e);
      error_type = Error.code(e);
    })
  };
};
