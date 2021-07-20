import Error "mo:base/Error";
import Result "mo:base/Result";
import GT "./GovernanceTypes";

module {
  public type Info = {
    visibility: Visibility;
    operators: [Principal];
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

  public type ManageAxon = {
    action: {
      #SetPolicy: {needed: Nat};
      #AddOperator: {principal: Principal; needed: Nat};
      #RemoveOperator: {principal: Principal; needed: Nat};
      #UpdateVisibility: Visibility;
    };
  };

  public type VoteRequest = {
    id: Nat;
    vote: Vote;
    execute: Bool;
  };

  public type Error = {
    #Unauthorized;
    #InvalidAction;
    #NotFound;
    #CannotRemoveOperator;
    #CannotPropose;
    #CannotExecute;
    #AlreadyVoted;
    #GovernanceError: GT.GovernanceError;
    #Error: { error_message : Text; error_type : Error.ErrorCode };
  };

  public type NewProposal<P> = {
    durationSeconds: ?Nat;
    timeStart: ?Int;
    proposal: P;
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

  public type Execute<R> = {
    time: Int;
    responses: [R];
  };

  public type Status<R> = {
    #Active;
    #Accepted: Int;
    #Executed: Execute<R>;
    #Rejected: Int;
    #Expired: Int;
  };

  public type Proposal<P, R> = {
    id: Nat;
    ballots: [Ballot];
    timeStart: Int;
    timeEnd: Int;
    creator: Principal;
    proposal: P;
    status: Status<R>;
    policy: ?Policy;
  };

  public type ManageNeuronCall = (Nat64, Result<GT.ManageNeuronResponse>);

  public type NeuronCommand = {
    neuronIds: ?[Nat64];
    command: GT.Command;
  };
  public type NeuronCommandProposal = Proposal<NeuronCommand, ManageNeuronCall>;

  public type Result<T> = Result.Result<T, Error>;
  public type ListNeuronsResult = Result<GT.ListNeuronsResponse>;
  public type NeuronCommandProposalResult = Result<[NeuronCommandProposal]>;
  public type SyncResult = Result<[Nat64]>;
}
