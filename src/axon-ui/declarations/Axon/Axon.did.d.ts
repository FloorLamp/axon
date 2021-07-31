import type { Principal } from '@dfinity/principal';
export interface AccountIdentifier { 'hash' : Array<number> }
export type Action = { 'ManageNeuron' : ManageNeuron } |
  { 'ExecuteNnsFunction' : ExecuteNnsFunction } |
  { 'RewardNodeProvider' : RewardNodeProvider } |
  { 'SetDefaultFollowees' : SetDefaultFollowees } |
  { 'ManageNetworkEconomics' : NetworkEconomics } |
  { 'ApproveGenesisKyc' : ApproveGenesisKyc } |
  { 'AddOrRemoveNodeProvider' : AddOrRemoveNodeProvider } |
  { 'Motion' : Motion };
export interface AddHotKey { 'new_hot_key' : [] | [Principal] }
export interface AddOrRemoveNodeProvider { 'change' : [] | [Change] }
export interface Amount { 'e8s' : bigint }
export interface ApproveGenesisKyc { 'principals' : Array<Principal> }
export interface Axon {
  'id' : bigint,
  'balance' : bigint,
  'name' : string,
  'supply' : bigint,
  'proxy' : Proxy,
  'visibility' : Visibility,
  'policy' : Policy,
}
export type AxonCommand = [AxonCommandRequest, [] | [AxonCommandResponse]];
export type AxonCommandExecution = { 'Ok' : null } |
  {
    'Transfer' : {
      'senderBalanceAfter' : bigint,
      'amount' : bigint,
      'receiver' : Principal,
    }
  } |
  { 'SupplyChanged' : { 'to' : bigint, 'from' : bigint } };
export type AxonCommandRequest = {
    'Redenominate' : { 'to' : bigint, 'from' : bigint }
  } |
  { 'Mint' : { 'recipient' : [] | [Principal], 'amount' : bigint } } |
  { 'RemoveMembers' : Array<Principal> } |
  { 'AddMembers' : Array<Principal> } |
  { 'Transfer' : { 'recipient' : Principal, 'amount' : bigint } } |
  { 'SetVisibility' : Visibility } |
  { 'SetPolicy' : Policy };
export type AxonCommandResponse = { 'ok' : AxonCommandExecution } |
  { 'err' : Error };
export interface AxonProposal {
  'id' : bigint,
  'status' : Array<Status>,
  'creator' : Principal,
  'ballots' : Array<Ballot>,
  'timeStart' : bigint,
  'totalVotes' : Votes,
  'proposal' : ProposalType,
  'timeEnd' : bigint,
  'policy' : Policy,
}
export interface AxonService {
  'axonById' : (arg_0: bigint) => Promise<Axon>,
  'balanceOf' : (arg_0: bigint, arg_1: [] | [Principal]) => Promise<bigint>,
  'cancel' : (arg_0: bigint, arg_1: bigint) => Promise<Result_2>,
  'cleanup' : (arg_0: bigint) => Promise<Result>,
  'count' : () => Promise<bigint>,
  'create' : (arg_0: Initialization) => Promise<Axon>,
  'execute' : (arg_0: bigint, arg_1: bigint) => Promise<Result_2>,
  'getActiveProposals' : (arg_0: bigint) => Promise<ProposalResult>,
  'getAllProposals' : (arg_0: bigint, arg_1: [] | [bigint]) => Promise<
      ProposalResult
    >,
  'getNeuronIds' : (arg_0: bigint) => Promise<Array<bigint>>,
  'getNeurons' : (arg_0: bigint) => Promise<ListNeuronsResult>,
  'ledger' : (arg_0: bigint) => Promise<Array<LedgerEntry>>,
  'propose' : (arg_0: NewProposal) => Promise<Result>,
  'sync' : (arg_0: bigint) => Promise<ListNeuronsResult>,
  'transfer' : (arg_0: bigint, arg_1: Principal, arg_2: bigint) => Promise<
      Result
    >,
  'vote' : (arg_0: VoteRequest) => Promise<Result>,
}
export interface Ballot {
  'principal' : Principal,
  'votingPower' : bigint,
  'vote' : [] | [Vote],
}
export interface BallotInfo { 'vote' : number, 'proposal_id' : [] | [NeuronId] }
export type Change = { 'ToRemove' : NodeProvider } |
  { 'ToAdd' : NodeProvider };
export type Command = { 'Spawn' : Spawn } |
  { 'Split' : Split } |
  { 'Follow' : Follow } |
  { 'Configure' : Configure } |
  { 'RegisterVote' : RegisterVote } |
  { 'DisburseToNeuron' : DisburseToNeuron } |
  { 'MakeProposal' : Proposal } |
  { 'Disburse' : Disburse };
export type Command_1 = { 'Error' : GovernanceError } |
  { 'Spawn' : SpawnResponse } |
  { 'Split' : SpawnResponse } |
  { 'Follow' : {} } |
  { 'Configure' : {} } |
  { 'RegisterVote' : {} } |
  { 'DisburseToNeuron' : SpawnResponse } |
  { 'MakeProposal' : MakeProposalResponse } |
  { 'Disburse' : DisburseResponse };
export interface Configure { 'operation' : [] | [Operation] }
export interface Disburse {
  'to_account' : [] | [AccountIdentifier],
  'amount' : [] | [Amount],
}
export interface DisburseResponse { 'transfer_block_height' : bigint }
export interface DisburseToNeuron {
  'dissolve_delay_seconds' : bigint,
  'kyc_verified' : boolean,
  'amount_e8s' : bigint,
  'new_controller' : [] | [Principal],
  'nonce' : bigint,
}
export type DissolveState = { 'DissolveDelaySeconds' : bigint } |
  { 'WhenDissolvedTimestampSeconds' : bigint };
export type Error = { 'AlreadyVoted' : null } |
  { 'Error' : { 'error_message' : string, 'error_type' : ErrorCode } } |
  { 'CannotVote' : null } |
  { 'CannotExecute' : null } |
  { 'InvalidProposal' : null } |
  { 'InsufficientBalance' : null } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'NotProposer' : null } |
  { 'NoNeurons' : null } |
  { 'GovernanceError' : GovernanceError } |
  { 'InsufficientBalanceToPropose' : null };
export type ErrorCode = { 'canister_error' : null } |
  { 'system_transient' : null } |
  { 'future' : number } |
  { 'canister_reject' : null } |
  { 'destination_invalid' : null } |
  { 'system_fatal' : null };
export interface ExecuteNnsFunction {
  'nns_function' : number,
  'payload' : Array<number>,
}
export interface Follow { 'topic' : number, 'followees' : Array<NeuronId> }
export interface Followees { 'followees' : Array<NeuronId> }
export interface GovernanceError {
  'error_message' : string,
  'error_type' : number,
}
export interface IncreaseDissolveDelay {
  'additional_dissolve_delay_seconds' : number,
}
export interface Initialization {
  'ledgerEntries' : Array<LedgerEntry>,
  'name' : string,
  'visibility' : Visibility,
  'policy' : Policy,
}
export type LedgerEntry = [Principal, bigint];
export interface ListNeuronsResponse {
  'neuron_infos' : Array<[bigint, NeuronInfo]>,
  'full_neurons' : Array<Neuron>,
}
export type ListNeuronsResult = { 'ok' : ListNeuronsResponse } |
  { 'err' : Error };
export interface MakeProposalResponse { 'proposal_id' : [] | [NeuronId] }
export interface ManageNeuron {
  'id' : [] | [NeuronId],
  'command' : [] | [Command],
}
export interface ManageNeuronResponse { 'command' : [] | [Command_1] }
export interface Motion { 'motion_text' : string }
export interface NetworkEconomics {
  'neuron_minimum_stake_e8s' : bigint,
  'max_proposals_to_keep_per_topic' : number,
  'neuron_management_fee_per_proposal_e8s' : bigint,
  'reject_cost_e8s' : bigint,
  'transaction_fee_e8s' : bigint,
  'neuron_spawn_dissolve_delay_seconds' : bigint,
  'minimum_icp_xdr_rate' : bigint,
  'maximum_node_provider_rewards_e8s' : bigint,
}
export interface Neuron {
  'id' : [] | [NeuronId],
  'controller' : [] | [Principal],
  'recent_ballots' : Array<BallotInfo>,
  'kyc_verified' : boolean,
  'not_for_profit' : boolean,
  'maturity_e8s_equivalent' : bigint,
  'cached_neuron_stake_e8s' : bigint,
  'created_timestamp_seconds' : bigint,
  'aging_since_timestamp_seconds' : bigint,
  'hot_keys' : Array<Principal>,
  'account' : Array<number>,
  'dissolve_state' : [] | [DissolveState],
  'followees' : Array<[number, Followees]>,
  'neuron_fees_e8s' : bigint,
  'transfer' : [] | [NeuronStakeTransfer],
}
export type NeuronCommand = [
  NeuronCommandRequest,
  [] | [Array<NeuronCommandResponse>],
];
export interface NeuronCommandRequest {
  'command' : Command,
  'neuronIds' : [] | [Array<bigint>],
}
export type NeuronCommandResponse = [bigint, Result_1];
export interface NeuronId { 'id' : bigint }
export interface NeuronInfo {
  'dissolve_delay_seconds' : bigint,
  'recent_ballots' : Array<BallotInfo>,
  'created_timestamp_seconds' : bigint,
  'state' : number,
  'retrieved_at_timestamp_seconds' : bigint,
  'voting_power' : bigint,
  'age_seconds' : bigint,
}
export interface NeuronStakeTransfer {
  'to_subaccount' : Array<number>,
  'neuron_stake_e8s' : bigint,
  'from' : [] | [Principal],
  'memo' : bigint,
  'from_subaccount' : Array<number>,
  'transfer_timestamp' : bigint,
  'block_height' : bigint,
}
export interface NewProposal {
  'axonId' : bigint,
  'timeStart' : [] | [bigint],
  'durationSeconds' : [] | [bigint],
  'proposal' : ProposalType,
  'execute' : [] | [boolean],
}
export interface NodeProvider { 'id' : [] | [Principal] }
export type Operation = { 'RemoveHotKey' : RemoveHotKey } |
  { 'AddHotKey' : AddHotKey } |
  { 'StopDissolving' : {} } |
  { 'StartDissolving' : {} } |
  { 'IncreaseDissolveDelay' : IncreaseDissolveDelay } |
  { 'SetDissolveTimestamp' : SetDissolveTimestamp };
export interface Policy {
  'proposeThreshold' : bigint,
  'proposers' : { 'Open' : null } |
    { 'Closed' : Array<Principal> },
  'acceptanceThreshold' : Threshold,
}
export interface Proposal {
  'url' : string,
  'action' : [] | [Action],
  'summary' : string,
}
export type ProposalResult = { 'ok' : Array<AxonProposal> } |
  { 'err' : Error };
export type ProposalType = { 'NeuronCommand' : NeuronCommand } |
  { 'AxonCommand' : AxonCommand };
export interface Proxy {
  'list_neurons' : () => Promise<ListNeuronsResponse>,
  'manage_neuron' : (arg_0: ManageNeuron) => Promise<ManageNeuronResponse>,
}
export interface RegisterVote { 'vote' : number, 'proposal' : [] | [NeuronId] }
export interface RemoveHotKey { 'hot_key_to_remove' : [] | [Principal] }
export type Result = { 'ok' : null } |
  { 'err' : Error };
export type Result_1 = { 'ok' : ManageNeuronResponse } |
  { 'err' : Error };
export type Result_2 = { 'ok' : AxonProposal } |
  { 'err' : Error };
export type RewardMode = { 'RewardToNeuron' : RewardToNeuron } |
  { 'RewardToAccount' : RewardToAccount };
export interface RewardNodeProvider {
  'node_provider' : [] | [NodeProvider],
  'reward_mode' : [] | [RewardMode],
  'amount_e8s' : bigint,
}
export interface RewardToAccount { 'to_account' : [] | [AccountIdentifier] }
export interface RewardToNeuron { 'dissolve_delay_seconds' : bigint }
export interface SetDefaultFollowees {
  'default_followees' : Array<[number, Followees]>,
}
export interface SetDissolveTimestamp { 'dissolve_timestamp_seconds' : bigint }
export interface Spawn { 'new_controller' : [] | [Principal] }
export interface SpawnResponse { 'created_neuron_id' : [] | [NeuronId] }
export interface Split { 'amount_e8s' : bigint }
export type Status = { 'Active' : bigint } |
  { 'Rejected' : bigint } |
  { 'ExecutionQueued' : bigint } |
  { 'Accepted' : bigint } |
  { 'ExecutionStarted' : bigint } |
  { 'ExecutionFinished' : bigint } |
  { 'Cancelled' : bigint } |
  { 'Created' : bigint } |
  { 'Expired' : bigint };
export type Threshold = {
    'Percent' : { 'percent' : bigint, 'quorum' : [] | [bigint] }
  } |
  { 'Absolute' : bigint };
export type Visibility = { 'Private' : null } |
  { 'Public' : null };
export type Vote = { 'No' : null } |
  { 'Yes' : null };
export interface VoteRequest {
  'axonId' : bigint,
  'vote' : Vote,
  'proposalId' : bigint,
}
export interface Votes { 'no' : bigint, 'yes' : bigint, 'notVoted' : bigint }
export interface _SERVICE extends AxonService {}