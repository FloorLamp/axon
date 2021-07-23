import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";

import Arr "./Array";
import GT "./GovernanceTypes";
import T "./Types";

shared actor class Axon(init: T.Initialization) = this {
  let Governance = actor "rrkah-fqaaa-aaaaa-aaaaq-cai" : GT.Service;
  stable var visibility = init.visibility;
  stable var operators: [Principal] = [init.owner];
  // Default policy is null, so the owner has complete authority
  stable var policy: ?T.Policy = null;
  stable var neuronIds: [Nat64] = [];
  stable var neurons: ?GT.ListNeuronsResponse = null;
  stable var allProposals: [T.NeuronCommandProposal] = [];
  stable var activeProposals: [T.NeuronCommandProposal] = [];
  stable var lastId: Nat = 0;

  // Default voting period for active proposals, 1 day
  let DEFAULT_DURATION_SEC = 24 * 60 * 60;
  // Minimum voting period for active proposals, 4 hours
  let MINIMUM_DURATION_SEC = 4 * 60 * 60;

  // Any operator can manage axon
  public shared({ caller }) func manage(request: T.ManageAxon) : async T.Result<()> {
    if (not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    switch(request.action) {
      case (#SetPolicy({ needed })) {
        if (needed > operators.size() or needed == 0) {
          return #err(#InvalidAction);
        };
        policy := ?{ needed = needed; total = operators.size() };
      };
      case (#AddOperator({ principal; needed })) {
        if (not isOperator(principal)) {
          if (needed > operators.size() + 1 or needed == 0) {
            return #err(#InvalidAction);
          };
          operators := Array.append(operators, [principal]);
          policy := ?{ needed = needed; total = operators.size() };
        };
      };
      case (#RemoveOperator({ principal; needed })) {
        if (operators.size() == 1) {
          return #err(#CannotRemoveOperator);
        };
        if (needed >= operators.size() or needed == 0) {
          return #err(#InvalidAction);
        };
        operators := Array.filter<Principal>(operators, func(p) { p != principal });
        policy := ?{ needed = needed; total = operators.size() };
      };
      case (#UpdateVisibility(visibility_)) {
        visibility := visibility_;
      };
    };
    #ok
  };

  public query func info() : async T.Info {
    {
      visibility = visibility;
      operators = operators;
      policy = policy;
    }
  };

  public query func getNeuronIds() : async [Nat64] {
    switch (neurons) {
      case (?data) {
        Array.map<(Nat64, GT.NeuronInfo), Nat64>(data.neuron_infos, func(i) { i.0 })
      };
      case _ { [] }
    }
  };

  // Get all full neurons. If private, only operators can call
  public query({ caller }) func getNeurons() : async T.ListNeuronsResult {
    if (visibility == #Private and not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    switch (neurons) {
      case (?data) {
        #ok(data)
      };
      case _ { #err(#NotFound) }
    }
  };

  // Call list_neurons() and save the list of neurons that this canister controls
  public shared({ caller }) func sync() : async T.ListNeuronsResult {
    if (visibility == #Private and not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    let response = await Governance.list_neurons({
      neuron_ids = [];
      include_neurons_readable_by_caller = true;
    });
    neurons := ?response;

    // Since this will be called from the client periodically, call cleanup
    ignore cleanup();

    #ok(response)
  };

  // Get all active proposals. If private, only operators can call
  public query({ caller }) func getActiveProposals() : async T.NeuronCommandProposalResult {
    if (visibility == #Private and not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    #ok(activeProposals)
  };

  // Get last 100 proposals, optionally before the specified id. If private, only operators can call
  public query({ caller }) func getAllProposals(before: ?Nat) : async T.NeuronCommandProposalResult {
    if (visibility == #Private and not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    let filtered = switch(before) {
      case (?before_) {
        Array.filter<T.NeuronCommandProposal>(allProposals, func(p) {
          p.id < before_
        });
      };
      case null { allProposals }
    };
    let size = filtered.size();
    if (size == 0) {
      return #ok([]);
    };

    #ok(Prim.Array_tabulate<T.NeuronCommandProposal>(Nat.min(100, size), func (i) {
      filtered.get(size - i - 1);
    }));
  };

  // Submit a new Command proposal
  public shared({ caller }) func proposeCommand(request: T.NewProposal<T.NeuronCommand>) : async T.Result<()> {
    if (not isOperator(caller)) {
      return #err(#Unauthorized);
    };

    if (neuronIds.size() == 0) {
      return #err(#CannotPropose);
    };

    // Snapshot the voters at creation
    let ballots = Array.map<Principal, T.Ballot>(operators, func(p) {
      {
        principal = p;
        // Auto approve for caller
        vote = if (p == caller) { ?(#Yes) } else { null };
      }
    });
    let now = Time.now();
    let timeStart = Option.get(request.timeStart, now);
    let newProposal = {
      id = lastId;
      timeStart = timeStart;
      timeEnd = timeStart + secsToNanos(Nat.min(MINIMUM_DURATION_SEC, Option.get(request.durationSeconds, DEFAULT_DURATION_SEC)));
      ballots = ballots;
      creator = caller;
      proposal = request.proposal;
      status = Option.get(statusFromPolicy(policy, ballots), #Active);
      policy = policy;
    };
    activeProposals := Array.append(activeProposals, [newProposal]);
    lastId += 1;

    switch (newProposal.status, request.execute) {
      case (#Accepted(_), ?true) {
        if (timeStart == now) {
          ignore await execute(newProposal.id);
        };
      };
      case _ {};
    };

    #ok
  };

  // Vote on an active proposal
  public shared({ caller }) func vote(request: T.VoteRequest) : async T.Result<?T.NeuronCommandProposal> {
    if (not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    let now = Time.now();
    var result: T.Result<?T.NeuronCommandProposal> = #err(#NotFound);
    var proposal: ?T.NeuronCommandProposal = null;
    activeProposals := Array.map<T.NeuronCommandProposal, T.NeuronCommandProposal>(activeProposals, func(p) {
      if (p.id != request.id) {
        return p;
      };

      let ballots = Array.map<T.Ballot, T.Ballot>(p.ballots, func(b) {
        if (b.principal == caller) {
          if (Option.isSome(b.vote)) {
            result := #err(#AlreadyVoted);
            return b
          } else {
            result := #ok(null);
            return {
              principal = caller;
              vote = ?request.vote;
            }
          }
        } else {
          return b;
        }
      });
      proposal := ?{
        id = p.id;
        ballots = ballots;
        timeStart = p.timeStart;
        timeEnd = p.timeEnd;
        creator = p.creator;
        proposal = p.proposal;
        status = Option.get(statusFromPolicy(p.policy, ballots), p.status);
        policy = p.policy;
      };
      Option.unwrap(proposal)
    });

    if (Result.isOk(result)) {
      let proposal_ = Option.unwrap(proposal);
      switch (proposal_.status) {
        // Execute if accepted
        case (#Accepted(_)) {
          if (request.execute) {
            let execution = await execute(request.id);
            return Result.mapOk<T.NeuronCommandProposal, ?T.NeuronCommandProposal, T.Error>(execution, func(r) { ?r })
          }
        };
        // Remove from active list if rejected
        case (#Rejected(_)) {
          allProposals := Array.append(allProposals, [proposal_]);
          activeProposals := Array.filter<T.NeuronCommandProposal>(activeProposals, func(p) {
            p.id != proposal_.id
          });
        };
        case _ {};
      };
    };

    result
  };

  // Execute accepted proposal
  public shared({ caller }) func execute(id: Nat) : async T.Result<T.NeuronCommandProposal> {
    if (not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    let found = Array.find<T.NeuronCommandProposal>(activeProposals, func(p) { p.id == id });
    if (Option.isNull(found)) {
      return #err(#NotFound);
    };

    let proposal = Option.unwrap(found);
    switch (proposal.status) {
      case (#Accepted(_)) {
        // Forward command to specified neurons, or all
        let proposalResponses = Buffer.Buffer<T.ManageNeuronCall>(neuronIds.size());
        let specifiedNeuronIds = Option.get(proposal.proposal.neuronIds, neuronIds);
        for (id in specifiedNeuronIds.vals()) {
          try {
            let response = await Governance.manage_neuron({id = ?{id = id}; command = ?proposal.proposal.command});
            proposalResponses.add((id, #ok(response)));
          } catch (error) {
            // TODO: Command failed to deliver, retry if possible?
            proposalResponses.add((id, #err(makeError(error))));
          };
        };

        // Save responses for this proposal
        let newProposal = {
          id = proposal.id;
          ballots = proposal.ballots;
          timeStart = proposal.timeStart;
          timeEnd = proposal.timeEnd;
          creator = proposal.creator;
          proposal = proposal.proposal;
          status = #Executed({
            time = Time.now();
            responses = proposalResponses.toArray();
          });
          policy = proposal.policy;
        };
        // Move executed proposal from active to all
        allProposals := Array.append(allProposals, [newProposal]);
        activeProposals := Array.filter<T.NeuronCommandProposal>(activeProposals, func(p) { p.id != id });
        #ok(newProposal);
      };
      case _ {
        #err(#CannotExecute);
      };
    }
  };

  // Remove expired proposals. Called by sync
  public shared({ caller }) func cleanup() : async T.Result<()> {
    if (not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    let expired = Buffer.Buffer<T.NeuronCommandProposal>(activeProposals.size());
    let now = Time.now();
    for (proposal in activeProposals.vals()) {
      if (now >= proposal.timeEnd) {
        expired.add({
          id = proposal.id;
          ballots = proposal.ballots;
          timeStart = proposal.timeStart;
          timeEnd = proposal.timeEnd;
          creator = proposal.creator;
          proposal = proposal.proposal;
          status = #Expired(now);
          policy = proposal.policy;
        });
      }
    };

    // Move expired proposals from active to all
    let expiredArr = expired.toArray();
    allProposals := Array.append(allProposals, expiredArr);
    activeProposals := Array.filter<T.NeuronCommandProposal>(activeProposals, func(r) {
      not Arr.contains<T.NeuronCommandProposal>(expiredArr, r, func(a, b) { a.id == b.id })
    });

    #ok();
  };

  func statusFromPolicy<R>(policy: ?T.Policy, ballots: [T.Ballot]): ?T.Status<R> {
    let now = Time.now();
    switch(policy) {
      case (?{ needed; total }) {
        let approves = Array.filter<T.Ballot>(ballots, func(b) { b.vote == ?#Yes }).size();
        let rejects = Array.filter<T.Ballot>(ballots, func(b) { b.vote == ?#No }).size();
        if (approves >= needed) {
          ?(#Accepted(now));
        } else if (rejects > total - needed) {
          // Rejections has exceeded threshold, accept is not possible
          ?(#Rejected(now));
        } else { null };
      };
      // No policy, auto accept
      case _ { ?(#Accepted(now)) };
    };
  };

  // Returns true if the principal is in the operators array OR if it's this canister
  func isOperator(principal: Principal): Bool {
    principal == Principal.fromActor(this) or
    Arr.contains<Principal>(operators, principal, Principal.equal)
  };

  func secsToNanos(s: Nat): Nat { 1_000_000_000 * s };

  func makeError(e: Error): T.Error {
    #Error({
      error_message = Error.message(e);
      error_type = Error.code(e);
    })
  };
};
