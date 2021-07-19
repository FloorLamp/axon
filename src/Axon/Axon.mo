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

shared actor class Axon(init: T.Initialization) {
  let Governance = actor "rrkah-fqaaa-aaaaa-aaaaq-cai" : GT.Service;
  stable var visibility = init.visibility;
  stable var operators: [Principal] = [init.owner];
  stable var neuronIds: [Nat64] = [];
  stable var allProposals: [T.CommandProposal] = [];
  stable var activeProposals: [T.CommandProposal] = [];
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
      case (#AddOperator(principal)) {
        if (not isOperator(principal)) {
          operators := Array.append(operators, [principal])
        };
      };
      case (#RemoveOperator(principal)) {
        if (operators.size() == 1) {
          return #err(#CannotRemoveOperator);
        };
        operators := Array.filter<Principal>(operators, func(p) { p != principal });
      };
      case (#UpdateVisibility(visibility_)) {
        visibility := visibility_;
      };
    };
    #ok
  };

  public query func getOperators() : async [Principal] {
    operators
  };

  // Call get_neuron_ids() and save the list of neurons that this canister controls
  public shared({ caller }) func sync(): async T.SyncResult {
    if (visibility == #Private and not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    try {
      neuronIds := await Governance.get_neuron_ids();
      #ok(neuronIds);
    } catch (err) {
      #err(makeError(err))
    }
  };

  public query func getNeuronIds() : async [Nat64] {
    neuronIds
  };

  // Get all full neurons. If private, only operators can call
  public shared({ caller }) func neurons() : async T.NeuronResult {
    if (visibility == #Private and not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    let results: [var ?GT.NeuronResult] = Array.init(neuronIds.size(), null);
    var i = 0;
    for (id in neuronIds.vals()) {
      var result: ?GT.NeuronResult = null;
      try {
        result := ?(await Governance.get_full_neuron(id));
      } catch err {};
      results[i] := result;
      i += 1;
    };
    #ok(Array.freeze(results))
  };

  // Get all active proposals. If private, only operators can call
  public query({ caller }) func getActiveProposals() : async T.ProposalResult {
    if (visibility == #Private and not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    #ok(activeProposals)
  };

  // Get last 100 proposals, optionally before the specified id. If private, only operators can call
  public query({ caller }) func getAllProposals(before: ?Nat) : async T.ProposalResult {
    if (visibility == #Private and not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    let filtered = switch(before) {
      case (?before_) {
        Array.filter<T.CommandProposal>(allProposals, func(p) {
          p.id < before_
        });
      };
      case null { allProposals }
    };
    let size = filtered.size();
    if (size == 0) {
      return #ok([]);
    };

    #ok(Prim.Array_tabulate<T.CommandProposal>(Nat.min(100, size), func (i) {
      filtered.get(size - i - 1);
    }));
  };

  // Submit a new Command proposal
  public shared({ caller }) func proposeCommand(request: T.NewProposal<GT.Command>) : async T.Result<()> {
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
        vote = null;
      }
    });
    let timeStart = Option.get(request.timeStart, Time.now());
    activeProposals := Array.append(activeProposals, [{
      id = lastId;
      timeStart = timeStart;
      timeEnd = timeStart + secsToNanos(Nat.min(MINIMUM_DURATION_SEC, Option.get(request.durationSeconds, DEFAULT_DURATION_SEC)));
      ballots = ballots;
      creator = caller;
      proposal = request.proposal;
      responses = [];
    }]);
    lastId += 1;

    #ok
  };

  // Vote on an active proposal
  public shared({ caller }) func vote(id: Nat, vote: T.Vote) : async T.Result<()> {
    if (not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    var result: T.Result<()> = #err(#NotFound);
    activeProposals := Array.map<T.CommandProposal, T.CommandProposal>(activeProposals, func(p) {
      if (p.id != id) {
        return p;
      };

      let ballot = {
        principal = caller;
        vote = ?vote;
      };
      if (Arr.contains<T.Ballot>(p.ballots, ballot, func(a, b) { a.principal == b.principal })) {
        result := #err(#AlreadyVoted);
        return p
      };

      result := #ok();
      let ballots = Array.append(p.ballots, [ballot]);
      {
        id = p.id;
        ballots = ballots;
        timeStart = p.timeStart;
        timeEnd = p.timeEnd;
        creator = p.creator;
        proposal = p.proposal;
        responses = p.responses;
      }
    });

    // Execute if ok
    if (Result.isOk(result)) {
      ignore await execute();
    };
    result
  };

  // Execute all proposals that have passed, and remove expired proposals
  public shared({ caller }) func execute() : async T.Result<()> {
    if (not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    let inactive = Buffer.Buffer<T.CommandProposal>(activeProposals.size());
    let now = Time.now();
    for (proposal in activeProposals.vals()) {
      let yes = Array.filter<T.Ballot>(proposal.ballots, func(b) { Option.get(b.vote, #No) == #Yes }).size();
      let total = proposal.ballots.size();
      // >50% yes votes required
      if (yes > total / 2) {
        // Forward command to all neurons
        let proposalResponses = Buffer.Buffer<T.ManageNeuronCall>(neuronIds.size());
        for (id in neuronIds.vals()) {
          try {
            let response = await Governance.manage_neuron({id = ?{id = id}; command = ?proposal.proposal});
            proposalResponses.add(#ok(response));
          } catch (error) {
            // TODO: Command failed to deliver, retry if possible?
            proposalResponses.add((#err(makeError(error))));
          };
        };

        // Save responses for this proposal
        inactive.add({
          id = proposal.id;
          ballots = proposal.ballots;
          timeStart = proposal.timeStart;
          timeEnd = proposal.timeEnd;
          creator = proposal.creator;
          proposal = proposal.proposal;
          responses = proposalResponses.toArray();
        });
      } else if (now >= proposal.timeEnd) {
        // Remove expired proposals
        inactive.add(proposal);
      }
    };

    // Move executed and expired proposals from active to all
    let inactiveArr = inactive.toArray();
    allProposals := Array.append(allProposals, inactiveArr);
    activeProposals := Array.filter<T.CommandProposal>(activeProposals, func(r) {
      not Arr.contains<T.CommandProposal>(inactiveArr, r, func(a, b) { a.id == b.id })
    });

    #ok();
  };

  func isOperator(principal: Principal): Bool {
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
