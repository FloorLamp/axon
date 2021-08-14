import HashMap "mo:base/HashMap";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

import IC "./IcManagementTypes";
import GT "./GovernanceTypes";

module {
  public type Proxy = actor {
    list_neurons : shared () -> async GT.ListNeuronsResponse;
    manage_neuron : shared GT.ManageNeuron -> async GT.ManageNeuronResponse;
  };

  public type Neurons = {
    response: GT.ListNeuronsResponse;
    timestamp: Int;
  };

  // Publicly exposed Axon that includes treasury balance, total neuron stake, and token holders
  public type AxonPublic = {
    id: Nat;
    proxy: Proxy;
    name: Text;
    visibility: Visibility;
    supply: Nat;
    policy: Policy;
    balance: Nat;
    totalStake: Nat;
    tokenHolders: Nat;
  };

  public type AxonFull = {
    id: Nat;
    proxy: Proxy;
    name: Text;
    visibility: Visibility;
    supply: Nat;
    ledger: Ledger;
    policy: Policy;
    neurons: ?Neurons;
    totalStake: Nat;
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
    neurons: ?Neurons;
    totalStake: Nat;
    allProposals: [AxonProposal];
    activeProposals: [AxonProposal];
    lastProposalId: Nat;
  };

  public type AxonEntries_pre = {
    id: Nat;
    proxy: Proxy;
    name: Text;
    visibility: Visibility;
    supply: Nat;
    ledgerEntries: [LedgerEntry];
    policy: Policy;
    neurons: ?GT.ListNeuronsResponse;
    totalStake: Nat;
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

    //---- Token functions

    /*
      Change supply by multiplying each balance by `to`, then dividing by `from`. Rounds down.

      Example:
      from=10, to=1
        Total=100, A=81 (81%), B=10 (10%), C=9 (9%)
      becomes
        Total=9, A=8 (88.8%), B=1 (11.1%), C=0
    */
    #Redenominate: { from: Nat; to: Nat };

    // Mints new tokens to the principal if specified, or Axon itself otherwise
    #Mint: { amount: Nat; recipient: ?Principal };

    // Transfers tokens from Axon to the specified principal
    #Transfer: { amount: Nat; recipient: Principal };
  };
  public type AxonCommandExecution = {
    #Ok;
    #SupplyChanged: { from: Nat; to: Nat };
    #Transfer: {
      receiver: Principal;
      amount: Nat;
      senderBalanceAfter: Nat;
    };
  };
  public type AxonCommandResponse = Result<AxonCommandExecution>;

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
    #ExecutionQueued: Int;
    #ExecutionStarted: Int;
    #ExecutionFinished: Int;
    #Rejected: Int;
    #Expired: Int;
    #Cancelled: Int;
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

  public type ManageNeuronResponseOrProposal = {
    #ManageNeuronResponse: Result<GT.ManageNeuronResponse>;
    #ProposalInfo: Result<?GT.ProposalInfo>;
  };
  public type NeuronCommandResponse = (Nat64, [ManageNeuronResponseOrProposal]);

  public type Result<T> = Result.Result<T, Error>;
  public type NeuronsResult = Result<Neurons>;
  public type ProposalResult = Result<[AxonProposal]>;
  public type SyncResult = Result<[Nat64]>;
}
