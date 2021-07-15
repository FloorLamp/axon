export const idlFactory = ({ IDL }) => {
  const ManageNeuron = IDL.Rec();
  const NeuronId = IDL.Record({ 'id' : IDL.Nat64 });
  const Spawn = IDL.Record({ 'new_controller' : IDL.Opt(IDL.Principal) });
  const Split = IDL.Record({ 'amount_e8s' : IDL.Nat64 });
  const Follow = IDL.Record({
    'topic' : IDL.Int32,
    'followees' : IDL.Vec(NeuronId),
  });
  const RemoveHotKey = IDL.Record({
    'hot_key_to_remove' : IDL.Opt(IDL.Principal),
  });
  const AddHotKey = IDL.Record({ 'new_hot_key' : IDL.Opt(IDL.Principal) });
  const IncreaseDissolveDelay = IDL.Record({
    'additional_dissolve_delay_seconds' : IDL.Nat32,
  });
  const SetDissolveTimestamp = IDL.Record({
    'dissolve_timestamp_seconds' : IDL.Nat64,
  });
  const Operation = IDL.Variant({
    'RemoveHotKey' : RemoveHotKey,
    'AddHotKey' : AddHotKey,
    'StopDissolving' : IDL.Record({}),
    'StartDissolving' : IDL.Record({}),
    'IncreaseDissolveDelay' : IncreaseDissolveDelay,
    'SetDissolveTimestamp' : SetDissolveTimestamp,
  });
  const Configure = IDL.Record({ 'operation' : IDL.Opt(Operation) });
  const RegisterVote = IDL.Record({
    'vote' : IDL.Int32,
    'proposal' : IDL.Opt(NeuronId),
  });
  const DisburseToNeuron = IDL.Record({
    'dissolve_delay_seconds' : IDL.Nat64,
    'kyc_verified' : IDL.Bool,
    'amount_e8s' : IDL.Nat64,
    'new_controller' : IDL.Opt(IDL.Principal),
    'nonce' : IDL.Nat64,
  });
  const ExecuteNnsFunction = IDL.Record({
    'nns_function' : IDL.Int32,
    'payload' : IDL.Vec(IDL.Nat8),
  });
  const NodeProvider = IDL.Record({ 'id' : IDL.Opt(IDL.Principal) });
  const RewardToNeuron = IDL.Record({ 'dissolve_delay_seconds' : IDL.Nat64 });
  const AccountIdentifier = IDL.Record({ 'hash' : IDL.Vec(IDL.Nat8) });
  const RewardToAccount = IDL.Record({
    'to_account' : IDL.Opt(AccountIdentifier),
  });
  const RewardMode = IDL.Variant({
    'RewardToNeuron' : RewardToNeuron,
    'RewardToAccount' : RewardToAccount,
  });
  const RewardNodeProvider = IDL.Record({
    'node_provider' : IDL.Opt(NodeProvider),
    'reward_mode' : IDL.Opt(RewardMode),
    'amount_e8s' : IDL.Nat64,
  });
  const Followees = IDL.Record({ 'followees' : IDL.Vec(NeuronId) });
  const SetDefaultFollowees = IDL.Record({
    'default_followees' : IDL.Vec(IDL.Tuple(IDL.Int32, Followees)),
  });
  const NetworkEconomics = IDL.Record({
    'neuron_minimum_stake_e8s' : IDL.Nat64,
    'max_proposals_to_keep_per_topic' : IDL.Nat32,
    'neuron_management_fee_per_proposal_e8s' : IDL.Nat64,
    'reject_cost_e8s' : IDL.Nat64,
    'transaction_fee_e8s' : IDL.Nat64,
    'neuron_spawn_dissolve_delay_seconds' : IDL.Nat64,
    'minimum_icp_xdr_rate' : IDL.Nat64,
    'maximum_node_provider_rewards_e8s' : IDL.Nat64,
  });
  const ApproveGenesisKyc = IDL.Record({
    'principals' : IDL.Vec(IDL.Principal),
  });
  const Change = IDL.Variant({
    'ToRemove' : NodeProvider,
    'ToAdd' : NodeProvider,
  });
  const AddOrRemoveNodeProvider = IDL.Record({ 'change' : IDL.Opt(Change) });
  const Motion = IDL.Record({ 'motion_text' : IDL.Text });
  const Action = IDL.Variant({
    'ManageNeuron' : ManageNeuron,
    'ExecuteNnsFunction' : ExecuteNnsFunction,
    'RewardNodeProvider' : RewardNodeProvider,
    'SetDefaultFollowees' : SetDefaultFollowees,
    'ManageNetworkEconomics' : NetworkEconomics,
    'ApproveGenesisKyc' : ApproveGenesisKyc,
    'AddOrRemoveNodeProvider' : AddOrRemoveNodeProvider,
    'Motion' : Motion,
  });
  const Proposal = IDL.Record({
    'url' : IDL.Text,
    'action' : IDL.Opt(Action),
    'summary' : IDL.Text,
  });
  const Amount = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Disburse = IDL.Record({
    'to_account' : IDL.Opt(AccountIdentifier),
    'amount' : IDL.Opt(Amount),
  });
  const Command = IDL.Variant({
    'Spawn' : Spawn,
    'Split' : Split,
    'Follow' : Follow,
    'Configure' : Configure,
    'RegisterVote' : RegisterVote,
    'DisburseToNeuron' : DisburseToNeuron,
    'MakeProposal' : Proposal,
    'Disburse' : Disburse,
  });
  ManageNeuron.fill(
    IDL.Record({ 'id' : IDL.Opt(NeuronId), 'command' : IDL.Opt(Command) })
  );
  const GovernanceError = IDL.Record({
    'error_message' : IDL.Text,
    'error_type' : IDL.Int32,
  });
  const Error = IDL.Variant({
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'Other' : IDL.Text,
    'GovernanceError' : GovernanceError,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const ManageOperator = IDL.Record({
    'principal' : IDL.Principal,
    'action' : IDL.Variant({ 'Add' : IDL.Null, 'Remove' : IDL.Null }),
  });
  const BallotInfo = IDL.Record({
    'vote' : IDL.Int32,
    'proposal_id' : IDL.Opt(NeuronId),
  });
  const DissolveState = IDL.Variant({
    'DissolveDelaySeconds' : IDL.Nat64,
    'WhenDissolvedTimestampSeconds' : IDL.Nat64,
  });
  const NeuronStakeTransfer = IDL.Record({
    'to_subaccount' : IDL.Vec(IDL.Nat8),
    'neuron_stake_e8s' : IDL.Nat64,
    'from' : IDL.Opt(IDL.Principal),
    'memo' : IDL.Nat64,
    'from_subaccount' : IDL.Vec(IDL.Nat8),
    'transfer_timestamp' : IDL.Nat64,
    'block_height' : IDL.Nat64,
  });
  const Neuron = IDL.Record({
    'id' : IDL.Opt(NeuronId),
    'controller' : IDL.Opt(IDL.Principal),
    'recent_ballots' : IDL.Vec(BallotInfo),
    'kyc_verified' : IDL.Bool,
    'not_for_profit' : IDL.Bool,
    'maturity_e8s_equivalent' : IDL.Nat64,
    'cached_neuron_stake_e8s' : IDL.Nat64,
    'created_timestamp_seconds' : IDL.Nat64,
    'aging_since_timestamp_seconds' : IDL.Nat64,
    'hot_keys' : IDL.Vec(IDL.Principal),
    'account' : IDL.Vec(IDL.Nat8),
    'dissolve_state' : IDL.Opt(DissolveState),
    'followees' : IDL.Vec(IDL.Tuple(IDL.Int32, Followees)),
    'neuron_fees_e8s' : IDL.Nat64,
    'transfer' : IDL.Opt(NeuronStakeTransfer),
  });
  const NeuronResult = IDL.Variant({ 'Ok' : Neuron, 'Err' : GovernanceError });
  const Axon = IDL.Service({
    'getOperators' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'manage' : IDL.Func([ManageNeuron], [Result], []),
    'manageOperator' : IDL.Func([ManageOperator], [Result], []),
    'neurons' : IDL.Func([], [IDL.Vec(IDL.Opt(NeuronResult))], []),
    'registerNeuron' : IDL.Func([IDL.Nat64], [NeuronResult], []),
  });
  return Axon;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };