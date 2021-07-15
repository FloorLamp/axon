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
  'getOperators' : () => Promise<Array<Principal>>,
  'manage' : (arg_0: ManageNeuron) => Promise<Result>,
  'manageOperator' : (arg_0: ManageOperator) => Promise<Result>,
  'neurons' : () => Promise<Array<[] | [NeuronResult]>>,
  'registerNeuron' : (arg_0: bigint) => Promise<NeuronResult>,
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
export interface Configure { 'operation' : [] | [Operation] }
export interface Disburse {
  'to_account' : [] | [AccountIdentifier],
  'amount' : [] | [Amount],
}
export interface DisburseToNeuron {
  'dissolve_delay_seconds' : bigint,
  'kyc_verified' : boolean,
  'amount_e8s' : bigint,
  'new_controller' : [] | [Principal],
  'nonce' : bigint,
}
export type DissolveState = { 'DissolveDelaySeconds' : bigint } |
  { 'WhenDissolvedTimestampSeconds' : bigint };
export type Error = { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'Other' : string } |
  { 'GovernanceError' : GovernanceError };
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
export interface ManageNeuron {
  'id' : [] | [NeuronId],
  'command' : [] | [Command],
}
export interface ManageOperator {
  'principal' : Principal,
  'action' : { 'Add' : null } |
    { 'Remove' : null },
}
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
export interface NeuronId { 'id' : bigint }
export type NeuronResult = { 'Ok' : Neuron } |
  { 'Err' : GovernanceError };
export interface NeuronStakeTransfer {
  'to_subaccount' : Array<number>,
  'neuron_stake_e8s' : bigint,
  'from' : [] | [Principal],
  'memo' : bigint,
  'from_subaccount' : Array<number>,
  'transfer_timestamp' : bigint,
  'block_height' : bigint,
}
export interface NodeProvider { 'id' : [] | [Principal] }
export type Operation = { 'RemoveHotKey' : RemoveHotKey } |
  { 'AddHotKey' : AddHotKey } |
  { 'StopDissolving' : {} } |
  { 'StartDissolving' : {} } |
  { 'IncreaseDissolveDelay' : IncreaseDissolveDelay } |
  { 'SetDissolveTimestamp' : SetDissolveTimestamp };
export interface Proposal {
  'url' : string,
  'action' : [] | [Action],
  'summary' : string,
}
export interface RegisterVote { 'vote' : number, 'proposal' : [] | [NeuronId] }
export interface RemoveHotKey { 'hot_key_to_remove' : [] | [Principal] }
export type Result = { 'ok' : null } |
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
export interface Split { 'amount_e8s' : bigint }
export interface _SERVICE extends Axon {}