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
  stable var owners: [Principal] = [init.owner];
  // Default policy is null - any owner has complete authority
  stable var policy: ?T.Policy = null;
  stable var neurons: ?GT.ListNeuronsResponse = null;
  stable var allActions: [T.AxonAction] = [];
  stable var pendingActions: [T.AxonAction] = [];
  stable var lastId: Nat = 0;

  // Default voting period for pending actions, 1 day
  let DEFAULT_DURATION_SEC = 24 * 60 * 60;
  // Minimum voting period for pending actions, 4 hours
  let MINIMUM_DURATION_SEC = 4 * 60 * 60;

  public query func info() : async T.Info {
    {
      visibility = visibility;
      owners = owners;
      policy = policy;
    }
  };

  public query func getNeuronIds() : async [Nat64] {
    neuronIds()
  };

  // Get all full neurons. If private, only owners can call
  public query({ caller }) func getNeurons() : async T.ListNeuronsResult {
    if (visibility == #Private and not isAuthed(caller)) {
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
    if (visibility == #Private and not isAuthed(caller)) {
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

  // Get all pending actions. If private, only owners can call
  public query({ caller }) func getPendingActions() : async T.ActionResult {
    if (visibility == #Private and not isAuthed(caller)) {
      return #err(#Unauthorized)
    };

    #ok(pendingActions)
  };

  // Get last 100 actions, optionally before the specified id. If private, only owners can call
  public query({ caller }) func getAllActions(before: ?Nat) : async T.ActionResult {
    if (visibility == #Private and not isAuthed(caller)) {
      return #err(#Unauthorized)
    };

    let filtered = switch(before) {
      case (?before_) {
        Array.filter<T.AxonAction>(allActions, func(p) {
          p.id < before_
        });
      };
      case null { allActions }
    };
    let size = filtered.size();
    if (size == 0) {
      return #ok([]);
    };

    #ok(Prim.Array_tabulate<T.AxonAction>(Nat.min(100, size), func (i) {
      filtered.get(size - i - 1);
    }));
  };

  // Submit a new Command action
  public shared({ caller }) func initiate(request: T.InitiateAction) : async T.Result<()> {
    if (not isAuthed(caller)) {
      return #err(#Unauthorized);
    };

    switch (request.action) {
      case (#NeuronCommand((command,_))) {
        if (neuronIds().size() == 0) {
          return #err(#NoNeurons);
        };
      };
      case (#AxonCommand((command,_))) {
        // Can add other ACL logic for axon commands here
      };
    };

    // Snapshot the voters at creation
    let ballots = Array.map<Principal, T.Ballot>(owners, func(p) {
      {
        principal = p;
        // Auto approve for caller
        vote = if (p == caller) { ?(#Yes) } else { null };
      }
    });
    let now = Time.now();
    let timeStart = Option.get(request.timeStart, now);
    let actionType: T.ActionType = switch (request.action) {
      case (#AxonCommand((command,_))) {
        switch (command) {
          case (#SetPolicy({ needed })) {
            #AxonCommand((#SetPolicy({ needed; total = ?(owners.size()) }), null))
          };
          case (#AddOwner({ principal; needed })) {
            #AxonCommand((#AddOwner({ principal; needed; total = ?(owners.size() + 1) }), null))
          };
          case (#RemoveOwner({ principal; needed })) {
            #AxonCommand((#RemoveOwner({ principal; needed; total = ?(owners.size() - 1) }), null))
          };
          case _ request.action;
        }
      };
      case _ request.action;
    };
    let newAction = {
      id = lastId;
      timeStart = timeStart;
      timeEnd = timeStart + secsToNanos(Nat.min(MINIMUM_DURATION_SEC, Option.get(request.durationSeconds, DEFAULT_DURATION_SEC)));
      ballots = ballots;
      creator = caller;
      action = actionType;
      status = Option.get(statusFromPolicy(policy, ballots), #Pending);
      policy = policy;
    };
    pendingActions := Array.append(pendingActions, [newAction]);
    lastId += 1;

    switch (newAction.status, request.execute) {
      case (#Accepted(_), ?true) {
        if (timeStart == now) {
          ignore execute(newAction.id);
        };
      };
      case _ {};
    };

    #ok
  };

  // Vote on an pending action
  public shared({ caller }) func vote(request: T.VoteRequest) : async T.Result<()> {
    if (not isAuthed(caller)) {
      return #err(#Unauthorized)
    };

    let now = Time.now();
    var result: T.Result<()> = #err(#NotFound);
    var action: ?T.AxonAction = null;
    pendingActions := Array.map<T.AxonAction, T.AxonAction>(pendingActions, func(p) {
      if (p.id != request.id) {
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
              vote = ?request.vote;
            }
          }
        } else {
          return b;
        }
      });
      action := ?{
        id = p.id;
        ballots = ballots;
        timeStart = p.timeStart;
        timeEnd = p.timeEnd;
        creator = p.creator;
        action = p.action;
        status = Option.get(statusFromPolicy(p.policy, ballots), p.status);
        policy = p.policy;
      };
      Option.unwrap(action)
    });

    if (Result.isOk(result)) {
      let action_ = Option.unwrap(action);
      switch (action_.status) {
        // Execute if accepted
        case (#Accepted(_)) {
          if (request.execute) {
            ignore execute(request.id);
          }
        };
        // Remove from pending list if rejected
        case (#Rejected(_)) {
          allActions := Array.append(allActions, [action_]);
          pendingActions := Array.filter<T.AxonAction>(pendingActions, func(p) {
            p.id != action_.id
          });
        };
        case _ {};
      };
    };

    result
  };

  // Execute accepted action
  public shared({ caller }) func execute(id: Nat) : async T.Result<T.AxonAction> {
    if (not isAuthed(caller)) {
      return #err(#Unauthorized)
    };

    // Set to Executing state
    var found: ?T.AxonAction = null;
    pendingActions := Array.map<T.AxonAction, T.AxonAction>(pendingActions, func(p) {
      if (p.id != id) {
        return p;
      };

      switch (p.status) {
        case (#Accepted(_)) {
          found := ?{
            id = p.id;
            ballots = p.ballots;
            timeStart = p.timeStart;
            timeEnd = p.timeEnd;
            creator = p.creator;
            action = p.action;
            status = #Executing(Time.now());
            policy = p.policy;
          };
        };
        // Trap and revert if not accepted
        case _ { assert(false) }
      };
      Option.unwrap(found)
    });

    switch (found) {
      case (?action) {
        let actionType = switch (action.action) {
          case (#NeuronCommand((command,_))) {
            // Forward command to specified neurons, or all
            let neuronIds_ = neuronIds();
            let actionResponses = Buffer.Buffer<T.NeuronCommandResponse>(neuronIds_.size());
            let specifiedNeuronIds = Option.get(command.neuronIds, neuronIds_);
            for (id in specifiedNeuronIds.vals()) {
              try {
                let response = await Governance.manage_neuron({id = ?{id = id}; command = ?command.command});
                actionResponses.add((id, #ok(response)));
              } catch (error) {
                // TODO: Command failed to deliver, retry if possible?
                actionResponses.add((id, #err(makeError(error))));
              };
            };
            #NeuronCommand((command, ?actionResponses.toArray()))
          };
          case (#AxonCommand((command,_))) {
            let response = _executeAxonCommand(command);
            #AxonCommand((command, ?response))
          };
        };

        // Save responses for this action
        let newAction: T.AxonAction = {
          id = action.id;
          ballots = action.ballots;
          timeStart = action.timeStart;
          timeEnd = action.timeEnd;
          creator = action.creator;
          action = actionType;
          status = #Executed(Time.now());
          policy = action.policy;
        };
        // Move executed action from pending to all
        allActions := Array.append(allActions, [newAction]);
        pendingActions := Array.filter<T.AxonAction>(pendingActions, func(p) { p.id != id });
        #ok(newAction);
      };
      case _ {
        #err(#NotFound);
      };
    }
  };

  // Remove expired actions. Called by sync
  public shared({ caller }) func cleanup() : async T.Result<()> {
    if (not isAuthed(caller)) {
      return #err(#Unauthorized)
    };

    let expired = Buffer.Buffer<T.AxonAction>(pendingActions.size());
    let now = Time.now();
    pendingActions := Array.filter<T.AxonAction>(pendingActions, func(action) {
      let shouldKeep = now < action.timeEnd;
      if (not shouldKeep) {
        expired.add({
          id = action.id;
          ballots = action.ballots;
          timeStart = action.timeStart;
          timeEnd = action.timeEnd;
          creator = action.creator;
          action = action.action;
          status = #Expired(now);
          policy = action.policy;
        });
      };
      shouldKeep
    });

    // Move expired actions from pending to all
    let expiredArr = expired.toArray();
    allActions := Array.append(allActions, expiredArr);

    #ok();
  };

  func statusFromPolicy(policy: ?T.Policy, ballots: [T.Ballot]): ?T.Status {
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

  // Returns true if the principal is in the owners array OR if it's this canister
  func isAuthed(principal: Principal): Bool {
    principal == Principal.fromActor(this) or
    Arr.contains<Principal>(owners, principal, Principal.equal)
  };

  func secsToNanos(s: Nat): Nat { 1_000_000_000 * s };

  func makeError(e: Error): T.Error {
    #Error({
      error_message = Error.message(e);
      error_type = Error.code(e);
    })
  };

  // Return neuron IDs from stored neuron_infos
  func neuronIds() : [Nat64] {
    switch (neurons) {
      case (?data) {
        Array.map<(Nat64, GT.NeuronInfo), Nat64>(data.neuron_infos, func(i) { i.0 })
      };
      case _ { [] }
    }
  };

  func _executeAxonCommand(request: T.AxonCommandRequest) : T.AxonCommandResponse {
    switch(request) {
      case (#SetPolicy({ needed })) {
        if (needed > owners.size() or needed == 0) {
          return #err(#InvalidAction);
        };
        policy := ?{ needed = needed; total = owners.size() };
      };
      case (#AddOwner({ principal; needed })) {
        if (not isAuthed(principal)) {
          if (needed > owners.size() + 1 or needed == 0) {
            return #err(#InvalidAction);
          };
          owners := Array.append(owners, [principal]);
          policy := ?{ needed = needed; total = owners.size() };
        } else {
          return #err(#InvalidAction)
        }
      };
      case (#RemoveOwner({ principal; needed })) {
        if (owners.size() == 1) {
          return #err(#CannotRemoveOwner);
        };
        if (needed >= owners.size() or needed == 0) {
          return #err(#InvalidAction);
        };
        owners := Array.filter<Principal>(owners, func(p) { p != principal });
        policy := ?{ needed = needed; total = owners.size() };
      };
      case (#UpdateVisibility(visibility_)) {
        visibility := visibility_;
      };
    };
    #ok
  };
};
