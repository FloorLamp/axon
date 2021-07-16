import Error "mo:base/Error";
import Result "mo:base/Result";
import GT "./GovernanceTypes";

module {
  public type Visibility = { #Private; #Public };

  public type Initialization = {
    owner: Principal;
    visibility: Visibility;
  };

  public type ManageAxon = {
    action: {
      #AddOperator: Principal;
      #RemoveOperator: Principal;
      #UpdateVisibility: Visibility;
    };
  };

  public type Error = {
    #Unauthorized;
    #NotFound;
    #CannotRemoveOperator;
    #CannotPropose;
    #AlreadyVoted;
    #GovernanceError: GT.GovernanceError;
    #Error: { error_message : Text; error_type : Error.ErrorCode };
  };

  public type NewProposal<T> = {
    durationSeconds: ?Nat;
    timeStart: ?Int;
    proposal: T;
  };

  public type Vote = {
    #Yes;
    #No;
  };

  public type Ballot = {
    principal: Principal;
    vote: ?Vote;
  };

  public type Proposal<T, R> = {
    id: Nat;
    ballots: [Ballot];
    timeStart: Int;
    timeEnd: Int;
    creator: Principal;
    proposal: T;
    responses: [R];
  };

  public type ManageNeuronCall = Result<GT.ManageNeuronResponse>;
  public type CommandProposal = Proposal<GT.Command, ManageNeuronCall>;

  public type Result<T> = Result.Result<T, Error>;
}
