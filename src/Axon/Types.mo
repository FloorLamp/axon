import Error "mo:base/Error";
import Result "mo:base/Result";
import GT "./GovernanceTypes";

module {
  public type Info = {
    visibility: Visibility;
    owners: [Principal];
    policy: ?Policy;
  };

  public type Visibility = { #Private; #Public };

  public type Initialization = {
    owner: Principal;
    visibility: Visibility;
  };

  public type Policy = {
    needed: Nat;
    total: Nat;
  };

  public type AxonCommandRequest = {
    #SetPolicy: {needed: Nat; total: ?Nat};
    #AddOwner: {principal: Principal; needed: Nat; total: ?Nat};
    #RemoveOwner: {principal: Principal; needed: Nat; total: ?Nat};
    #UpdateVisibility: Visibility;
  };
  public type AxonCommandResponse = Result<()>;

  public type VoteRequest = {
    id: Nat;
    vote: Vote;
    execute: Bool;
  };

  public type Error = {
    #Unauthorized;
    #InvalidAction;
    #NotFound;
    #CannotRemoveOwner;
    #NoNeurons;
    #CannotExecute;
    #AlreadyVoted;
    #GovernanceError: GT.GovernanceError;
    #Error: { error_message : Text; error_type : Error.ErrorCode };
  };

  public type InitiateAction = {
    durationSeconds: ?Nat;
    timeStart: ?Int;
    action: ActionType;
    execute: ?Bool;
  };

  public type Vote = {
    #Yes;
    #No;
  };

  public type Ballot = {
    principal: Principal;
    vote: ?Vote;
  };

  public type Status = {
    #Pending;
    #Accepted: Int;
    #Executing: Int;
    #Executed: Int;
    #Rejected: Int;
    #Expired: Int;
  };

  public type AxonAction = {
    id: Nat;
    ballots: [Ballot];
    timeStart: Int;
    timeEnd: Int;
    creator: Principal;
    action: ActionType;
    status: Status;
    policy: ?Policy;
  };

  public type AxonCommand = (AxonCommandRequest, ?AxonCommandResponse);
  public type NeuronCommand = (NeuronCommandRequest, ?[NeuronCommandResponse]);

  public type ActionType = {
    #AxonCommand: AxonCommand;
    #NeuronCommand: NeuronCommand;
  };

  public type NeuronCommandRequest = {
    neuronIds: ?[Nat64];
    command: GT.Command;
  };
  public type NeuronCommandResponse = (Nat64, Result<GT.ManageNeuronResponse>);

  public type Result<T> = Result.Result<T, Error>;
  public type ListNeuronsResult = Result<GT.ListNeuronsResponse>;
  public type ActionResult = Result<[AxonAction]>;
  public type SyncResult = Result<[Nat64]>;
}
