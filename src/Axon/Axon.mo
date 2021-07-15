import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import GT "./GovernanceTypes";
import T "./Types";

shared actor class Axon(owner: Principal) {
  let Governance = actor "rrkah-fqaaa-aaaaa-aaaaq-cai" : GT.Service;
  stable var operators: [Principal] = [owner];
  stable var neuronIds: [Nat64] = [];
  stable var activeRequests: [T.Request<GT.ManageNeuron>] = [];

  public shared({ caller }) func manageOperator(request: T.ManageOperator) : async Result.Result<(), T.Error> {
    if (not isOperator(caller)) {
      return #err(#Unauthorized)
    };
    switch(request.action) {
      case (#Add) {
        if (not isOperator(request.principal)) {
          operators := Array.append(operators, [request.principal])
        };
      };
      case (#Remove) {
        if (operators.size() == 1) {
          return #err(#Other("Cannot remove last operator"));
        };
        operators := Array.filter<Principal>(operators, func(p) { p != request.principal });
      }
    };
    #ok
  };

  public query func getOperators() : async [Principal] {
    operators
  };

  public func registerNeuron(id: Nat64): async GT.NeuronResult {
    let res = await Governance.get_full_neuron(id);
    switch(res) {
      case (#Ok(_)) {
        neuronIds := Array.append(neuronIds, [id])
      };
      case _ {}
    };
    res
  };

  public func neurons() : async [?GT.NeuronResult] {
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
    Array.freeze(results)
  };

  public shared({ caller }) func manage(request: GT.ManageNeuron) : async Result.Result<(), T.Error> {
    if (not isOperator(caller)) {
      return #err(#Unauthorized)
    };

    switch (request.id) {
      case (?id) {
        if (Array.find<Nat64>(neuronIds, func(_id: Nat64) { _id == id.id }) == null) {
          return #err(#NotFound)
        }
      };
      case (_) {}
    };
    activeRequests := Array.append(activeRequests, [{
      timestamp = Time.now();
      creator = caller;
      request = request
    }]);
    #ok
  };

  func isOperator(principal: Principal): Bool {
    Array.find<Principal>(operators, func(p) { p == principal }) != null
  };


};
