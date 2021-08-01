import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
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
import A "./AxonHelpers";

shared actor class AxonService() = this {
  // ---- State

  stable var axonEntries: [T.AxonEntries] = [];
  stable var lastAxonId: Nat = 0;
  var axons: [var T.AxonFull] = [var];

  // ---- Constants

  // Default voting period for active proposals, 1 day
  let DEFAULT_DURATION_SEC = 24 * 60 * 60;
  // Minimum voting period for active proposals, 4 hours
  let MINIMUM_DURATION_SEC = 4 * 60 * 60;
  // Maximum voting period for active proposals, 7 days
  let MAXIMUM_DURATION_SEC = 7 * 24 * 60 * 60;
  // Maximum time in the future that proposals can be created before voting, 7 days
  let MAXIMUM_FUTURE_START = 7 * 24 * 60 * 60;


  //---- Public queries

  public query func count() : async Nat {
    lastAxonId
  };

  public query func axonById(id: Nat) : async T.Axon {
    let axon = axons[id];
    axonFromFull(axon)
  };

  public query func getNeuronIds(id: Nat) : async [Nat64] {
    neuronIdsFromInfos(id)
  };

  public query({ caller }) func balanceOf(id: Nat, principal: ?Principal) : async Nat {
    let {ledger} = axons[id];
    Option.get(ledger.get(Option.get(principal, caller)), 0)
  };

  public query({ caller }) func ledger(id: Nat) : async [T.LedgerEntry] {
    let {ledger} = axons[id];
    // sort descending
    Array.sort<T.LedgerEntry>(Iter.toArray(ledger.entries()), func (a, b) {
      if (b.1 > a.1) { #greater } else { #less }
    });
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
      case _ { #err(#NoNeurons) }
    }
  };

  // Get all active proposals. If private, only owners can call
  public query({ caller }) func getActiveProposals(id: Nat) : async T.ProposalResult {
    let { visibility; ledger; activeProposals } = axons[id];
    if (visibility == #Private and not isAuthed(caller, ledger)) {
      return #err(#Unauthorized)
    };

    #ok(activeProposals)
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
  public shared({ caller }) func create(init: T.Initialization) : async T.Result<T.Axon> {
    // Verify at least one ledger entry
    assert(init.ledgerEntries.size() > 0);

    // TODO: Axon creation costs

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
      activeProposals = [];
      lastProposalId = 0;
    };
    axons := Array.thaw(Array.append(Array.freeze(axons), [axon]));
    lastAxonId += 1;
    #ok(axonFromFull(axon))
  };

  // Submit a new Axon proposal
  public shared({ caller }) func propose(request: T.NewProposal) : async T.Result<()> {
    let axon = axons[request.axonId];
    if (not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized);
    };

    // If closed set of proposers, check that caller is eligible
    switch (axon.policy.proposers) {
      case (#Closed(owners)) {
        if (not Arr.contains(owners, caller, Principal.equal)) {
          return #err(#NotProposer);
        }
      };
      case _ {};
    };

    // Check that caller has enough balance to propose
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
    let timeStart = clamp(
      Option.get(Option.map(request.timeStart, secsToNanos), now),
      now, now + secsToNanos(MAXIMUM_FUTURE_START)
    );
    // Create the proposal, count ballots, then execute if conditions are met
    let newProposal: T.AxonProposal = A._applyExecutingStatusConditionally(A._applyNewStatus({
      id = axon.lastProposalId;
      timeStart = timeStart;
      timeEnd = timeStart + secsToNanos(clamp(
        Option.get(request.durationSeconds, DEFAULT_DURATION_SEC),
        MINIMUM_DURATION_SEC, MAXIMUM_DURATION_SEC
      ));
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
      status = [#Created(now)];
      policy = axon.policy;
    }), request.execute == ?true and timeStart <= now);

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
      activeProposals = Array.append(axon.activeProposals, [newProposal]);
      lastProposalId = axon.lastProposalId + 1;
    };

    // Start the execution
    switch (A.currentStatus(newProposal.status)) {
      case (#ExecutionQueued(_)) {
        ignore _doExecute(axon.id, newProposal);
      };
      case _ {}
    };

    #ok
  };

  // Vote on an active proposal
  public shared({ caller }) func vote(request: T.VoteRequest) : async T.Result<()> {
    let axon = axons[request.axonId];
    if (not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized)
    };

    let now = Time.now();
    var result: T.Result<()> = #err(#NotFound);
    var proposal: ?T.AxonProposal = null;
    let activeProposals = Array.map<T.AxonProposal, T.AxonProposal>(axon.activeProposals, func(p) {
      if (p.id != request.proposalId) {
        return p;
      };

      /* Allow voting under these statuses:
        - Created, if time has passed timeStart
        - Active
        - Accepted
      */
      let canVote = switch (A.currentStatus(p.status), now >= p.timeStart) {
        case (#Created(_), true) { true };
        case (#Active(_), _) { true };
        case (#Accepted(_), _) { true };
        case _ { false };
      };

      if (not canVote) {
        result := #err(#CannotVote);
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
      proposal := ?A._applyExecutingStatusConditionally(A._applyNewStatus({
        id = p.id;
        ballots = ballots;
        totalVotes = A._countVotes(ballots);
        timeStart = p.timeStart;
        timeEnd = p.timeEnd;
        creator = p.creator;
        proposal = p.proposal;
        status = p.status;
        policy = p.policy;
      }), true);
      Option.unwrap(proposal)
    });

    if (Result.isOk(result)) {
      let updatedProposal = Option.unwrap(proposal);
      Debug.print("updatedProposal " # debug_show(updatedProposal));

      let proposals = switch (A.currentStatus(updatedProposal.status)) {
        // Remove from active list if rejected
        case (#Rejected(_)) {
          (Array.append(axon.allProposals, [updatedProposal]),
          Array.filter<T.AxonProposal>(activeProposals, func(p) {
            p.id != updatedProposal.id
          }))
        };
        case _ { (axon.allProposals, activeProposals) };
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
        activeProposals = proposals.1;
        lastProposalId = axon.lastProposalId;
      };

      // Start the execution
      switch (A.currentStatus(updatedProposal.status)) {
        case (#ExecutionQueued(_)) {
          ignore _doExecute(axon.id, updatedProposal);
        };
        case _ {}
      }
    };

    result
  };

  // Cancel an active proposal created by caller
  public shared({ caller }) func cancel(axonId: Nat, proposalId: Nat) : async T.Result<T.AxonProposal> {
    let axon = axons[axonId];
    if (not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized)
    };

    let now = Time.now();
    var maybeProposal: ?T.AxonProposal = null;
    let updatedActiveProposals = Array.map<T.AxonProposal, T.AxonProposal>(axon.activeProposals, func(proposal) {
      if (proposal.id == proposalId) {
        switch (A.isCancellable(A.currentStatus(proposal.status)), proposal.creator) {
          case (true, caller) {
            let newProposal = A.withNewStatus(proposal, #Cancelled(now));
            maybeProposal := ?newProposal;
            return newProposal;
          };
          // Trap if status is not Active or Created
          case _ { assert(false) };
        };
      };

      proposal
    });

    // Update proposals arrays
    let proposal = Option.unwrap(maybeProposal);
    axons[axon.id] := {
      id = axon.id;
      proxy = axon.proxy;
      name = axon.name;
      visibility = axon.visibility;
      supply = axon.supply;
      ledger = axon.ledger;
      policy = axon.policy;
      neurons = axon.neurons;
      allProposals = Array.append(axon.allProposals, [proposal]);
      activeProposals = Array.filter<T.AxonProposal>(updatedActiveProposals, func(p) {
        p.id != proposal.id
      });
      lastProposalId = axon.lastProposalId;
    };

    #ok(proposal);
  };

  // Queue proposal for execution
  public shared({ caller }) func execute(axonId: Nat, proposalId: Nat) : async T.Result<T.AxonProposal> {
    let axon = axons[axonId];
    if (not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized)
    };

    var found: ?T.AxonProposal = null;
    let activeProposals = Array.map<T.AxonProposal, T.AxonProposal>(axon.activeProposals, func(p) {
      if (p.id != proposalId) {
        return p;
      };

      let updatedProposal = A._applyExecutingStatusConditionally(p, true);
      switch (A.currentStatus(updatedProposal.status)) {
        case (#ExecutionQueued(_)) {};
        // Trap if status is not ExecutionQueued
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
      activeProposals = activeProposals;
      lastProposalId = axon.lastProposalId;
    };

    let proposal = Option.unwrap(found);

    #ok(await _doExecute(axon.id, proposal));
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
      activeProposals = axon.activeProposals;
      lastProposalId = axon.lastProposalId;
    };

    // Since this will be called from the client periodically, call cleanup
    ignore cleanup(axon.id);

    #ok(response)
  };

  // Update proposal statuses and move from active to all if needed. Called by sync
  public shared({ caller }) func cleanup(axonId: Nat) : async T.Result<()> {
    let axon = axons[axonId];
    if (not isAuthed(caller, axon.ledger)) {
      return #err(#Unauthorized)
    };

    let finished = Buffer.Buffer<T.AxonProposal>(0);
    let toExecute = Buffer.Buffer<T.AxonProposal>(0);
    let now = Time.now();
    var hasChanges = false;
    let updatedActiveProposals = Array.map<T.AxonProposal, T.AxonProposal>(axon.activeProposals, func(proposal) {
      let after = A._applyExecutingStatusConditionally(A._applyNewStatus(proposal), true);
      if (after.status != proposal.status) {
        hasChanges := true
      };
      after
    });
    let filteredActiveProposals = Array.filter<T.AxonProposal>(updatedActiveProposals, func(proposal) {
      let shouldKeep = switch (A.currentStatus(proposal.status)) {
        case (#Expired(_)) { false };
        case (#ExecutionQueued(_)) {
          toExecute.add(proposal);
          true
        };
        case _ { true }
      };
      if (not shouldKeep) {
        finished.add(proposal);
      };
      shouldKeep
    });

    // Move finished proposals from active to all
    if (hasChanges or finished.size() > 0) {
      let finishedArr = finished.toArray();
      axons[axon.id] := {
        id = axon.id;
        proxy = axon.proxy;
        name = axon.name;
        visibility = axon.visibility;
        supply = axon.supply;
        ledger = axon.ledger;
        policy = axon.policy;
        neurons = axon.neurons;
        allProposals = Array.append(axon.allProposals, finishedArr);
        activeProposals = filteredActiveProposals;
        lastProposalId = axon.lastProposalId;
      };
    };

    // Start execution
    for (proposal in toExecute.vals()) {
      ignore _doExecute(axonId, proposal);
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
        activeProposals = axon.activeProposals;
        lastProposalId = axon.lastProposalId;
      }
    });
  };

  system func postupgrade() {
    // Restore ledger hashmap from entries
    axons := Array.thaw(Array.map<T.AxonEntries, T.AxonFull>(axonEntries, func(axon) {
      // Remove 0-balance entries
      let filteredEntries = Array.filter<T.LedgerEntry>(axon.ledgerEntries, func((_, balance)) { balance > 0 });
      {
        id = axon.id;
        proxy = axon.proxy;
        name = axon.name;
        visibility = axon.visibility;
        // supply = Array.foldLeft<(Principal,Nat), Nat>(axon.ledgerEntries, 0, func(sum, c) { sum + c.1 });
        supply = axon.supply;
        ledger = HashMap.fromIter<Principal, Nat>(filteredEntries.vals(), filteredEntries.size(), Principal.equal, Principal.hash);
        policy = axon.policy;
        neurons = axon.neurons;
        allProposals = axon.allProposals;
        activeProposals = axon.activeProposals;
        lastProposalId = axon.lastProposalId;
      }
    }));
    axonEntries := [];
  };


  // ---- Internal functions

  // Execute accepted proposal
  func _doExecute(axonId: Nat, proposal: T.AxonProposal) : async T.AxonProposal {
    switch (A.currentStatus(proposal.status)) {
      case (#ExecutionQueued(_)) {};
      // Trap if status is not ExecutionQueued
      case _ { assert(false) }
    };

    let axon = axons[axonId];

    // Set proposal status to ExecutionStarted. Proposal state is cached during execution
    let startedProposal = A.withNewStatus(proposal, #ExecutionStarted(Time.now()));
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
      activeProposals = Array.map<T.AxonProposal, T.AxonProposal>(axon.activeProposals, func(p) {
        if (p.id == proposal.id ) { startedProposal }
        else p
      });
      lastProposalId = axon.lastProposalId;
    };

    var maybeNewAxon: ?T.AxonFull = null;
    let proposalType = switch (startedProposal.proposal) {
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
          case (#ok((newAxon,_))) {
            maybeNewAxon := ?newAxon;
            axons[newAxon.id] := newAxon;
          };
          case _ {}
        };
        #AxonCommand((command, ?Result.mapOk<(T.AxonFull, T.AxonCommandExecution), T.AxonCommandExecution, T.Error>(response, func(t) { t.1 })))
      };
    };
    // Re-select axon
    let newAxon = Option.get(maybeNewAxon, axons[axonId]);

    // Save responses and set status to ExecutionFinished
    let finishedProposal: T.AxonProposal = {
      id = startedProposal.id;
      totalVotes = startedProposal.totalVotes;
      ballots = startedProposal.ballots;
      timeStart = startedProposal.timeStart;
      timeEnd = startedProposal.timeEnd;
      creator = startedProposal.creator;
      proposal = proposalType;
      status = Array.append(startedProposal.status, [#ExecutionFinished(Time.now())]);
      policy = startedProposal.policy;
    };

    // Move executed proposal from active to all
    axons[newAxon.id] := {
      id = newAxon.id;
      proxy = newAxon.proxy;
      name = newAxon.name;
      visibility = newAxon.visibility;
      supply = newAxon.supply;
      ledger = newAxon.ledger;
      policy = newAxon.policy;
      neurons = newAxon.neurons;
      allProposals = Array.append(newAxon.allProposals, [finishedProposal]);
      activeProposals = Array.filter<T.AxonProposal>(newAxon.activeProposals, func(p) { p.id != finishedProposal.id });
      lastProposalId = newAxon.lastProposalId;
    };

    finishedProposal
  };

  func _applyAxonCommand(axon: T.AxonFull, request: T.AxonCommandRequest) : T.Result<(T.AxonFull, T.AxonCommandExecution)> {
    switch(request) {
      case (#SetPolicy(policy)) {
        switch (policy.proposers) {
          case (#Closed(current)) {
            if (current.size() == 0) {
              return #err(#CannotExecute);
            };
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
          activeProposals = axon.activeProposals;
          lastProposalId = axon.lastProposalId;
        }, #Ok)
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
          activeProposals = axon.activeProposals;
          lastProposalId = axon.lastProposalId;
        }, #Ok)
      };
      case (#AddMembers(principals)) {
        switch (axon.policy.proposers) {
          case (#Closed(current)) {
            let diff = Array.filter<Principal>(principals, func(p) {
              not Arr.contains<Principal>(current, p, Principal.equal)
            });
            Debug.print(" diff " # debug_show(diff));
            #ok({
              id = axon.id;
              proxy = axon.proxy;
              name = axon.name;
              visibility = axon.visibility;
              supply = axon.supply;
              ledger = axon.ledger;
              policy = {
                // set to current + diff
                proposers = #Closed(Array.append(current, diff));
                proposeThreshold = axon.policy.proposeThreshold;
                acceptanceThreshold = axon.policy.acceptanceThreshold;
              };
              neurons = axon.neurons;
              allProposals = axon.allProposals;
              activeProposals = axon.activeProposals;
              lastProposalId = axon.lastProposalId;
            }, #Ok)

          };
          case _ {
            #err(#InvalidProposal);
          }
        }
      };
      case (#RemoveMembers(principals)) {
        switch (axon.policy.proposers) {
          case (#Closed(current)) {
            let diff = Array.filter<Principal>(current, func(c) {
              not Arr.contains<Principal>(principals, c, Principal.equal)
            });
            if (diff.size() == 0) {
              return #err(#CannotExecute)
            };

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
              activeProposals = axon.activeProposals;
              lastProposalId = axon.lastProposalId;
            }, #Ok)

          };
          case _ {
            #err(#InvalidProposal);
          }
        }
      };
      case (#Redenominate({from; to})) {
        let newLedgerEntries = Array.map<T.LedgerEntry, T.LedgerEntry>(Iter.toArray(axon.ledger.entries()), func (a) {
          (a.0, A.scaleByFraction(a.1, to, from))
        });
        let newSupply = Array.foldLeft<(Principal,Nat), Nat>(newLedgerEntries, 0, func(sum, c) { sum + c.1 });
        let newLedger = HashMap.fromIter<Principal, Nat>(newLedgerEntries.vals(), newLedgerEntries.size(), Principal.equal, Principal.hash);
        #ok({
          id = axon.id;
          proxy = axon.proxy;
          name = axon.name;
          visibility = axon.visibility;
          supply = newSupply;
          ledger = newLedger;
          policy = {
            proposers = axon.policy.proposers;
            proposeThreshold = A.scaleByFraction(axon.policy.proposeThreshold, to, from);
            acceptanceThreshold = switch (axon.policy.acceptanceThreshold) {
              case (#Absolute(n)) { #Absolute(A.scaleByFraction(n, to, from)) };
              case (p) { p };
            };
          };
          neurons = axon.neurons;
          allProposals = axon.allProposals;
          activeProposals = axon.activeProposals;
          lastProposalId = axon.lastProposalId;
        }, #SupplyChanged({ from = axon.supply; to = newSupply }))
      };
      case (#Mint({amount; recipient})) {
        let dest = Option.get(recipient, Principal.fromActor(this));
        axon.ledger.put(dest, Option.get(axon.ledger.get(dest), 0) + amount);
        let newSupply = axon.supply + amount;
        #ok({
          id = axon.id;
          proxy = axon.proxy;
          name = axon.name;
          visibility = axon.visibility;
          supply = newSupply;
          ledger = axon.ledger;
          policy = axon.policy;
          neurons = axon.neurons;
          allProposals = axon.allProposals;
          activeProposals = axon.activeProposals;
          lastProposalId = axon.lastProposalId;
        }, #SupplyChanged({ from = axon.supply; to = newSupply }))
      };
      case (#Transfer({amount; recipient})) {
        let senderBalance = Option.get(axon.ledger.get(Principal.fromActor(this)), 0);
        if (senderBalance < amount) {
          return #err(#CannotExecute);
        };

        axon.ledger.put(Principal.fromActor(this), senderBalance - amount);
        axon.ledger.put(recipient, Option.get(axon.ledger.get(recipient), 0) + amount);
        #ok(axon, #Transfer({
          senderBalanceAfter = senderBalance - amount;
          amount = amount;
          receiver = recipient;
        }))
      };
    };
  };

  // ---- Helpers

  // Returns true if the principal holds a balance in ledger, OR if it's this canister
  func isAuthed(principal: Principal, ledger: T.Ledger): Bool {
    principal == Principal.fromActor(this) or
    (switch (ledger.get(principal)) {
      case (?balance) { balance > 0 };
      case _ { false };
    })
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

  // Return Axon with own balance
  func axonFromFull(axon: T.AxonFull): T.Axon {
    {
      id = axon.id;
      proxy = axon.proxy;
      name = axon.name;
      visibility = axon.visibility;
      supply = axon.supply;
      policy = axon.policy;
      balance = Option.get(axon.ledger.get(Principal.fromActor(this)), 0)
    }
  };

  func secsToNanos(s: Int): Int { 1_000_000_000 * s };

  func clamp(n: Int, lower: Int, upper: Int): Int { Int.min(Int.max(n, lower), upper) };

  func makeError(e: Error): T.Error {
    #Error({
      error_message = Error.message(e);
      error_type = Error.code(e);
    })
  };
};
