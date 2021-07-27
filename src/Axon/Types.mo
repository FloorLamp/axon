import HashMap "mo:base/HashMap";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import GT "./GovernanceTypes";

module {
  public type Proxy = actor {
    list_neurons : shared () -> async GT.ListNeuronsResponse;
    manage_neuron : shared GT.ManageNeuron -> async GT.ManageNeuronResponse;
  };

  public type Axon = {
    id: Nat;
    proxy: Proxy;
    name: Text;
    visibility: Visibility;
    supply: Nat;
    policy: Policy;
  };

  public type AxonFull = {
    id: Nat;
    proxy: Proxy;
    name: Text;
    visibility: Visibility;
    supply: Nat;
    ledger: Ledger;
    policy: Policy;
    neurons: ?GT.ListNeuronsResponse;
    allProposals: [AxonProposal];
    activeProposals: [AxonProposal];
    lastProposalId: Nat;
  };

  public type AxonEntries = {
    id: Nat;
    proxy: Proxy;
    name: Text;
    visibility: Visibility;
    supply: Nat;
    ledgerEntries: [LedgerEntry];
    policy: Policy;
    neurons: ?GT.ListNeuronsResponse;
    allProposals: [AxonProposal];
    activeProposals: [AxonProposal];
    lastProposalId: Nat;
  };

  public type Initialization = {
    name: Text;
    ledgerEntries: [LedgerEntry];
    visibility: Visibility;
    policy: Policy;
  };

  public type Visibility = { #Private; #Public };

  public type LedgerEntry = (Principal, Nat);
  public type Ledger = HashMap.HashMap<Principal, Nat>;

  // Minimum threshold of votes required
  public type Threshold = {
    #Percent: { percent: Nat; quorum: ?Nat }; // proportion times 1e8, ie. 100% = 1e8
    #Absolute: Nat;
  };

  public type Policy = {
    proposers: { #Open; #Closed: [Principal] };
    proposeThreshold: Nat;
    acceptanceThreshold: Threshold;
  };

  public type AxonCommandRequest = {
    #SetPolicy: Policy;
    #AddMembers: [Principal];
    #RemoveMembers: [Principal];
    #SetVisibility: Visibility;
    #Redenominate: { #from: Nat; #to: Nat };
  };
  public type AxonCommandResponse = Result<()>;

  public type VoteRequest = {
    axonId: Nat;
    proposalId: Nat;
    vote: Vote;
  };

  public type Error = {
    #Unauthorized;
    #InvalidProposal;
    #NotFound;
    #NoNeurons;
    #CannotExecute;
    #NotProposer;
    #InsufficientBalanceToPropose;
    #CannotVote;
    #AlreadyVoted;
    #InsufficientBalance;
    #GovernanceError: GT.GovernanceError;
    #Error: { error_message : Text; error_type : Error.ErrorCode };
  };

  public type NewProposal = {
    axonId: Nat;
    durationSeconds: ?Nat;
    timeStart: ?Int;
    proposal: ProposalType;
    execute: ?Bool;
  };

  public type Vote = {
    #Yes;
    #No;
  };

  public type Ballot = {
    principal: Principal;
    votingPower: Nat;
    vote: ?Vote;
  };

  public type Votes = {
    notVoted: Nat;
    yes: Nat;
    no: Nat;
  };

  public type Status = {
    #Created: Int;
    #Active: Int;
    #Accepted: Int;
    #Executing: Int;
    #Executed: Int;
    #Rejected: Int;
    #Expired: Int;
  };

  public type AxonProposal = {
    id: Nat;
    ballots: [Ballot];
    totalVotes: Votes;
    timeStart: Int;
    timeEnd: Int;
    creator: Principal;
    proposal: ProposalType;
    status: [Status];
    policy: Policy;
  };

  public type AxonCommand = (AxonCommandRequest, ?AxonCommandResponse);
  public type NeuronCommand = (NeuronCommandRequest, ?[NeuronCommandResponse]);

  public type ProposalType = {
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
  public type ProposalResult = Result<[AxonProposal]>;
  public type SyncResult = Result<[Nat64]>;
}
