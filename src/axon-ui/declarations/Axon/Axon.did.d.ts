import type { Principal } from '@dfinity/principal';
export interface AccountIdentifier { 'hash' : Array<number> }
export interface Action {
  'id' : bigint,
  'status' : Status,
  'creator' : Principal,
  'action' : ActionType,
  'ballots' : Array<Ballot>,
  'timeStart' : bigint,
  'timeEnd' : bigint,
  'policy' : [] | [Policy],
}
export type ActionResult = { 'ok' : Array<Action> } |
  { 'err' : Error };
export type ActionType = { 'NeuronCommand' : NeuronCommand } |
  { 'AxonCommand' : AxonCommand };
export type Action__1 = { 'ManageNeuron' : ManageNeuron } |
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
  'cleanup' : () => Promise<Result_2>,
  'execute' : (arg_0: bigint) => Promise<Result_3>,
  'getAllActions' : (arg_0: [] | [bigint]) => Promise<ActionResult>,
  'getNeuronIds' : () => Promise<Array<bigint>>,
  'getNeurons' : () => Promise<ListNeuronsResult>,
  'getPendingActions' : () => Promise<ActionResult>,
  'info' : () => Promise<Info>,
  'initiate' : (arg_0: InitiateAction) => Promise<Result_2>,
  'sync' : () => Promise<ListNeuronsResult>,
  'vote' : (arg_0: VoteRequest) => Promise<Result>,
}
export type AxonCommand = [AxonCommandRequest, [] | [AxonCommandResponse]];
export type AxonCommandRequest = {
    'RemoveOwner' : {
      'principal' : Principal,
      'total' : [] | [bigint],
      'needed' : bigint,
    }
  } |
  { 'UpdateVisibility' : Visibility } |
  {
    'AddOwner' : {
      'principal' : Principal,
      'total' : [] | [bigint],
      'needed' : bigint,
    }
  } |
  { 'SetPolicy' : { 'needed' : bigint } };
export type AxonCommandResponse = { 'ok' : null } |
  { 'err' : Error };
export interface Ballot { 'principal' : Principal, 'vote' : [] | [Vote] }
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
  { 'CannotExecute' : null } |
  { 'InvalidAction' : null } |
  { 'NotFound' : null } |
  { 'CannotRemoveOwner' : null } |
  { 'Unauthorized' : null } |
  { 'NoNeurons' : null } |
  { 'GovernanceError' : GovernanceError };
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
export interface Info {
  'owners' : Array<Principal>,
  'visibility' : Visibility,
  'policy' : [] | [Policy],
}
export interface Initialization {
  'owner' : Principal,
  'visibility' : Visibility,
}
export interface InitiateAction {
  'action' : ActionType,
  'timeStart' : [] | [bigint],
  'durationSeconds' : [] | [bigint],
  'execute' : [] | [boolean],
}
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
export interface NodeProvider { 'id' : [] | [Principal] }
export type Operation = { 'RemoveHotKey' : RemoveHotKey } |
  { 'AddHotKey' : AddHotKey } |
  { 'StopDissolving' : {} } |
  { 'StartDissolving' : {} } |
  { 'IncreaseDissolveDelay' : IncreaseDissolveDelay } |
  { 'SetDissolveTimestamp' : SetDissolveTimestamp };
export interface Policy { 'total' : bigint, 'needed' : bigint }
export interface Proposal {
  'url' : string,
  'action' : [] | [Action__1],
  'summary' : string,
}
export interface RegisterVote { 'vote' : number, 'proposal' : [] | [NeuronId] }
export interface RemoveHotKey { 'hot_key_to_remove' : [] | [Principal] }
export type Result = { 'ok' : [] | [Action] } |
  { 'err' : Error };
export type Result_1 = { 'ok' : ManageNeuronResponse } |
  { 'err' : Error };
export type Result_2 = { 'ok' : null } |
  { 'err' : Error };
export type Result_3 = { 'ok' : Action } |
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
export type Status = { 'Rejected' : bigint } |
  { 'Executed' : bigint } |
  { 'Accepted' : bigint } |
  { 'Expired' : bigint } |
  { 'Pending' : null };
export type Visibility = { 'Private' : null } |
  { 'Public' : null };
export type Vote = { 'No' : null } |
  { 'Yes' : null };
export interface VoteRequest {
  'id' : bigint,
  'vote' : Vote,
  'execute' : boolean,
}
export interface _SERVICE extends Axon {}