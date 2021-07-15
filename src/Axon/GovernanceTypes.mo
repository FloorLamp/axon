// This is a generated Motoko binding.
// Please use `import service "ic:canister_id"` instead to call canisters on the IC if possible.

module {
  public type AccountIdentifier = { hash : [Nat8] };
  public type Action = {
    #ManageNeuron : ManageNeuron;
    #ExecuteNnsFunction : ExecuteNnsFunction;
    #RewardNodeProvider : RewardNodeProvider;
    #SetDefaultFollowees : SetDefaultFollowees;
    #ManageNetworkEconomics : NetworkEconomics;
    #ApproveGenesisKyc : ApproveGenesisKyc;
    #AddOrRemoveNodeProvider : AddOrRemoveNodeProvider;
    #Motion : Motion;
  };
  public type AddHotKey = { new_hot_key : ?Principal };
  public type AddOrRemoveNodeProvider = { change : ?Change };
  public type Amount = { e8s : Nat64 };
  public type ApproveGenesisKyc = { principals : [Principal] };
  public type Ballot = { vote : Int32; voting_power : Nat64 };
  public type BallotInfo = { vote : Int32; proposal_id : ?NeuronId };
  public type Change = { #ToRemove : NodeProvider; #ToAdd : NodeProvider };
  public type ClaimOrRefreshNeuronFromAccount = {
    controller : ?Principal;
    memo : Nat64;
  };
  public type ClaimOrRefreshNeuronFromAccountResponse = { result : ?NeuronIdResult };
  public type Command = {
    #Spawn : Spawn;
    #Split : Split;
    #Follow : Follow;
    #Configure : Configure;
    #RegisterVote : RegisterVote;
    #DisburseToNeuron : DisburseToNeuron;
    #MakeProposal : Proposal;
    #Disburse : Disburse;
  };
  public type Command_1 = {
    #Error : GovernanceError;
    #Spawn : SpawnResponse;
    #Split : SpawnResponse;
    #Follow : {};
    #Configure : {};
    #RegisterVote : {};
    #DisburseToNeuron : SpawnResponse;
    #MakeProposal : MakeProposalResponse;
    #Disburse : DisburseResponse;
  };
  public type Command_2 = {
    #Spawn : Spawn;
    #Split : Split;
    #ClaimOrRefresh : ClaimOrRefreshNeuronFromAccount;
    #DisburseToNeuron : DisburseToNeuron;
    #Disburse : Disburse;
  };
  public type Configure = { operation : ?Operation };
  public type Disburse = { to_account : ?AccountIdentifier; amount : ?Amount };
  public type DisburseResponse = { transfer_block_height : Nat64 };
  public type DisburseToNeuron = {
    dissolve_delay_seconds : Nat64;
    kyc_verified : Bool;
    amount_e8s : Nat64;
    new_controller : ?Principal;
    nonce : Nat64;
  };
  public type DissolveState = {
    #DissolveDelaySeconds : Nat64;
    #WhenDissolvedTimestampSeconds : Nat64;
  };
  public type ExecuteNnsFunction = { nns_function : Int32; payload : [Nat8] };
  public type Follow = { topic : Int32; followees : [NeuronId] };
  public type Followees = { followees : [NeuronId] };
  public type Governance = {
    default_followees : [(Int32, Followees)];
    wait_for_quiet_threshold_seconds : Nat64;
    node_providers : [NodeProvider];
    economics : ?NetworkEconomics;
    latest_reward_event : ?RewardEvent;
    to_claim_transfers : [NeuronStakeTransfer];
    short_voting_period_seconds : Nat64;
    proposals : [(Nat64, ProposalData)];
    in_flight_commands : [(Nat64, NeuronInFlightCommand)];
    neurons : [(Nat64, Neuron)];
    genesis_timestamp_seconds : Nat64;
  };
  public type GovernanceError = { error_message : Text; error_type : Int32 };
  public type IncreaseDissolveDelay = {
    additional_dissolve_delay_seconds : Nat32;
  };
  public type ListNeurons = {
    neuron_ids : [Nat64];
    include_neurons_readable_by_caller : Bool;
  };
  public type ListNeuronsResponse = {
    neuron_infos : [(Nat64, NeuronInfo)];
    full_neurons : [Neuron];
  };
  public type ListProposalInfo = {
    include_reward_status : [Int32];
    before_proposal : ?NeuronId;
    limit : Nat32;
    exclude_topic : [Int32];
    include_status : [Int32];
  };
  public type ListProposalInfoResponse = { proposal_info : [ProposalInfo] };
  public type MakeProposalResponse = { proposal_id : ?NeuronId };
  public type ManageNeuron = { id : ?NeuronId; command : ?Command };
  public type ManageNeuronResponse = { command : ?Command_1 };
  public type Motion = { motion_text : Text };
  public type NetworkEconomics = {
    neuron_minimum_stake_e8s : Nat64;
    max_proposals_to_keep_per_topic : Nat32;
    neuron_management_fee_per_proposal_e8s : Nat64;
    reject_cost_e8s : Nat64;
    transaction_fee_e8s : Nat64;
    neuron_spawn_dissolve_delay_seconds : Nat64;
    minimum_icp_xdr_rate : Nat64;
    maximum_node_provider_rewards_e8s : Nat64;
  };
  public type Neuron = {
    id : ?NeuronId;
    controller : ?Principal;
    recent_ballots : [BallotInfo];
    kyc_verified : Bool;
    not_for_profit : Bool;
    maturity_e8s_equivalent : Nat64;
    cached_neuron_stake_e8s : Nat64;
    created_timestamp_seconds : Nat64;
    aging_since_timestamp_seconds : Nat64;
    hot_keys : [Principal];
    account : [Nat8];
    dissolve_state : ?DissolveState;
    followees : [(Int32, Followees)];
    neuron_fees_e8s : Nat64;
    transfer : ?NeuronStakeTransfer;
  };
  public type NeuronId = { id : Nat64 };
  public type NeuronInFlightCommand = {
    command : ?Command_2;
    timestamp : Nat64;
  };
  public type NeuronInfo = {
    dissolve_delay_seconds : Nat64;
    recent_ballots : [BallotInfo];
    created_timestamp_seconds : Nat64;
    state : Int32;
    retrieved_at_timestamp_seconds : Nat64;
    voting_power : Nat64;
    age_seconds : Nat64;
  };
  public type NeuronStakeTransfer = {
    to_subaccount : [Nat8];
    neuron_stake_e8s : Nat64;
    from : ?Principal;
    memo : Nat64;
    from_subaccount : [Nat8];
    transfer_timestamp : Nat64;
    block_height : Nat64;
  };
  public type NodeProvider = { id : ?Principal };
  public type Operation = {
    #RemoveHotKey : RemoveHotKey;
    #AddHotKey : AddHotKey;
    #StopDissolving : {};
    #StartDissolving : {};
    #IncreaseDissolveDelay : IncreaseDissolveDelay;
    #SetDissolveTimestamp : SetDissolveTimestamp;
  };
  public type Proposal = { url : Text; action : ?Action; summary : Text };
  public type ProposalData = {
    id : ?NeuronId;
    failure_reason : ?GovernanceError;
    ballots : [(Nat64, Ballot)];
    proposal_timestamp_seconds : Nat64;
    reward_event_round : Nat64;
    failed_timestamp_seconds : Nat64;
    reject_cost_e8s : Nat64;
    latest_tally : ?Tally;
    decided_timestamp_seconds : Nat64;
    proposal : ?Proposal;
    proposer : ?NeuronId;
    executed_timestamp_seconds : Nat64;
  };
  public type ProposalInfo = {
    id : ?NeuronId;
    status : Int32;
    topic : Int32;
    failure_reason : ?GovernanceError;
    ballots : [(Nat64, Ballot)];
    proposal_timestamp_seconds : Nat64;
    reward_event_round : Nat64;
    failed_timestamp_seconds : Nat64;
    reject_cost_e8s : Nat64;
    latest_tally : ?Tally;
    reward_status : Int32;
    decided_timestamp_seconds : Nat64;
    proposal : ?Proposal;
    proposer : ?NeuronId;
    executed_timestamp_seconds : Nat64;
  };
  public type RegisterVote = { vote : Int32; proposal : ?NeuronId };
  public type RemoveHotKey = { hot_key_to_remove : ?Principal };
  public type Result = { #Ok; #Err : GovernanceError };
  public type NeuronIdResult = { #Error : GovernanceError; #NeuronId : NeuronId };
  public type NeuronResult = { #Ok : Neuron; #Err : GovernanceError };
  public type NeuronInfoResult = { #Ok : NeuronInfo; #Err : GovernanceError };
  public type RewardEvent = {
    day_after_genesis : Nat64;
    actual_timestamp_seconds : Nat64;
    distributed_e8s_equivalent : Nat64;
    settled_proposals : [NeuronId];
  };
  public type RewardMode = {
    #RewardToNeuron : RewardToNeuron;
    #RewardToAccount : RewardToAccount;
  };
  public type RewardNodeProvider = {
    node_provider : ?NodeProvider;
    reward_mode : ?RewardMode;
    amount_e8s : Nat64;
  };
  public type RewardToAccount = { to_account : ?AccountIdentifier };
  public type RewardToNeuron = { dissolve_delay_seconds : Nat64 };
  public type SetDefaultFollowees = {
    default_followees : [(Int32, Followees)];
  };
  public type SetDissolveTimestamp = { dissolve_timestamp_seconds : Nat64 };
  public type Spawn = { new_controller : ?Principal };
  public type SpawnResponse = { created_neuron_id : ?NeuronId };
  public type Split = { amount_e8s : Nat64 };
  public type Tally = {
    no : Nat64;
    yes : Nat64;
    total : Nat64;
    timestamp_seconds : Nat64;
  };
  public type Service = actor {
    claim_gtc_neurons : shared (Principal, [NeuronId]) -> async Result;
    claim_or_refresh_neuron_from_account : shared ClaimOrRefreshNeuronFromAccount -> async ClaimOrRefreshNeuronFromAccountResponse;
    get_full_neuron : shared query Nat64 -> async NeuronResult;
    get_neuron_ids : shared query () -> async [Nat64];
    get_neuron_info : shared query Nat64 -> async NeuronInfoResult;
    get_pending_proposals : shared query () -> async [ProposalInfo];
    get_proposal_info : shared query Nat64 -> async ?ProposalInfo;
    list_neurons : shared query ListNeurons -> async ListNeuronsResponse;
    list_proposals : shared query ListProposalInfo -> async ListProposalInfoResponse;
    manage_neuron : shared ManageNeuron -> async ManageNeuronResponse;
    transfer_gtc_neuron : shared (NeuronId, NeuronId) -> async Result;
  }
}
