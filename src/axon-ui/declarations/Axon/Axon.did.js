export const idlFactory = ({ IDL }) => {
  const Command = IDL.Rec();
  const Visibility = IDL.Variant({ 'Private' : IDL.Null, 'Public' : IDL.Null });
  const Initialization = IDL.Record({
    'owner' : IDL.Principal,
    'visibility' : Visibility,
  });
  const ErrorCode = IDL.Variant({
    'canister_error' : IDL.Null,
    'system_transient' : IDL.Null,
    'future' : IDL.Nat32,
    'canister_reject' : IDL.Null,
    'destination_invalid' : IDL.Null,
    'system_fatal' : IDL.Null,
  });
  const GovernanceError = IDL.Record({
    'error_message' : IDL.Text,
    'error_type' : IDL.Int32,
  });
  const Error = IDL.Variant({
    'AlreadyVoted' : IDL.Null,
    'Error' : IDL.Record({
      'error_message' : IDL.Text,
      'error_type' : ErrorCode,
    }),
    'CannotExecute' : IDL.Null,
    'CannotPropose' : IDL.Null,
    'InvalidAction' : IDL.Null,
    'NotFound' : IDL.Null,
    'CannotRemoveOperator' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'GovernanceError' : GovernanceError,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const NeuronId = IDL.Record({ 'id' : IDL.Nat64 });
  const SpawnResponse = IDL.Record({ 'created_neuron_id' : IDL.Opt(NeuronId) });
  const MakeProposalResponse = IDL.Record({
    'proposal_id' : IDL.Opt(NeuronId),
  });
  const DisburseResponse = IDL.Record({ 'transfer_block_height' : IDL.Nat64 });
  const Command_1 = IDL.Variant({
    'Error' : GovernanceError,
    'Spawn' : SpawnResponse,
    'Split' : SpawnResponse,
    'Follow' : IDL.Record({}),
    'Configure' : IDL.Record({}),
    'RegisterVote' : IDL.Record({}),
    'DisburseToNeuron' : SpawnResponse,
    'MakeProposal' : MakeProposalResponse,
    'Disburse' : DisburseResponse,
  });
  const ManageNeuronResponse = IDL.Record({ 'command' : IDL.Opt(Command_1) });
  const Result_1 = IDL.Variant({ 'ok' : ManageNeuronResponse, 'err' : Error });
  const ManageNeuronCall = IDL.Tuple(IDL.Nat64, Result_1);
  const Execute = IDL.Record({
    'responses' : IDL.Vec(ManageNeuronCall),
    'time' : IDL.Int,
  });
  const Status = IDL.Variant({
    'Active' : IDL.Null,
    'Rejected' : IDL.Int,
    'Executed' : Execute,
    'Accepted' : IDL.Int,
    'Expired' : IDL.Int,
  });
  const Vote = IDL.Variant({ 'No' : IDL.Null, 'Yes' : IDL.Null });
  const Ballot = IDL.Record({
    'principal' : IDL.Principal,
    'vote' : IDL.Opt(Vote),
  });
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
  const ManageNeuron = IDL.Record({
    'id' : IDL.Opt(NeuronId),
    'command' : IDL.Opt(Command),
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
  Command.fill(
    IDL.Variant({
      'Spawn' : Spawn,
      'Split' : Split,
      'Follow' : Follow,
      'Configure' : Configure,
      'RegisterVote' : RegisterVote,
      'DisburseToNeuron' : DisburseToNeuron,
      'MakeProposal' : Proposal,
      'Disburse' : Disburse,
    })
  );
  const NeuronCommand = IDL.Record({
    'command' : Command,
    'neuronIds' : IDL.Opt(IDL.Vec(IDL.Nat64)),
  });
  const Policy = IDL.Record({ 'total' : IDL.Nat, 'needed' : IDL.Nat });
  const NeuronCommandProposal = IDL.Record({
    'id' : IDL.Nat,
    'status' : Status,
    'creator' : IDL.Principal,
    'ballots' : IDL.Vec(Ballot),
    'timeStart' : IDL.Int,
    'proposal' : NeuronCommand,
    'timeEnd' : IDL.Int,
    'policy' : IDL.Opt(Policy),
  });
  const Result_3 = IDL.Variant({ 'ok' : NeuronCommandProposal, 'err' : Error });
  const NeuronCommandProposalResult = IDL.Variant({
    'ok' : IDL.Vec(NeuronCommandProposal),
    'err' : Error,
  });
  const Info = IDL.Record({
    'operators' : IDL.Vec(IDL.Principal),
    'visibility' : Visibility,
    'policy' : IDL.Opt(Policy),
  });
  const BallotInfo = IDL.Record({
    'vote' : IDL.Int32,
    'proposal_id' : IDL.Opt(NeuronId),
  });
  const NeuronInfo = IDL.Record({
    'dissolve_delay_seconds' : IDL.Nat64,
    'recent_ballots' : IDL.Vec(BallotInfo),
    'created_timestamp_seconds' : IDL.Nat64,
    'state' : IDL.Int32,
    'retrieved_at_timestamp_seconds' : IDL.Nat64,
    'voting_power' : IDL.Nat64,
    'age_seconds' : IDL.Nat64,
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
  const ListNeuronsResponse = IDL.Record({
    'neuron_infos' : IDL.Vec(IDL.Tuple(IDL.Nat64, NeuronInfo)),
    'full_neurons' : IDL.Vec(Neuron),
  });
  const ListNeuronsResult = IDL.Variant({
    'ok' : ListNeuronsResponse,
    'err' : Error,
  });
  const ManageAxon = IDL.Record({
    'action' : IDL.Variant({
      'UpdateVisibility' : Visibility,
      'AddOperator' : IDL.Record({
        'principal' : IDL.Principal,
        'needed' : IDL.Nat,
      }),
      'RemoveOperator' : IDL.Record({
        'principal' : IDL.Principal,
        'needed' : IDL.Nat,
      }),
      'SetPolicy' : IDL.Record({ 'needed' : IDL.Nat }),
    }),
  });
  const NewProposal = IDL.Record({
    'timeStart' : IDL.Opt(IDL.Int),
    'durationSeconds' : IDL.Opt(IDL.Nat),
    'proposal' : NeuronCommand,
    'execute' : IDL.Opt(IDL.Bool),
  });
  const SyncResult = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat64), 'err' : Error });
  const VoteRequest = IDL.Record({
    'id' : IDL.Nat,
    'vote' : Vote,
    'execute' : IDL.Bool,
  });
  const Result = IDL.Variant({
    'ok' : IDL.Opt(NeuronCommandProposal),
    'err' : Error,
  });
  const Axon = IDL.Service({
    'cleanup' : IDL.Func([], [Result_2], []),
    'execute' : IDL.Func([IDL.Nat], [Result_3], []),
    'getActiveProposals' : IDL.Func(
        [],
        [NeuronCommandProposalResult],
        ['query'],
      ),
    'getAllProposals' : IDL.Func(
        [IDL.Opt(IDL.Nat)],
        [NeuronCommandProposalResult],
        ['query'],
      ),
    'getNeuronIds' : IDL.Func([], [IDL.Vec(IDL.Nat64)], ['query']),
    'info' : IDL.Func([], [Info], ['query']),
    'listNeurons' : IDL.Func([], [ListNeuronsResult], []),
    'manage' : IDL.Func([ManageAxon], [Result_2], []),
    'proposeCommand' : IDL.Func([NewProposal], [Result_2], []),
    'sync' : IDL.Func([], [SyncResult], []),
    'vote' : IDL.Func([VoteRequest], [Result], []),
  });
  return Axon;
};
export const init = ({ IDL }) => {
  const Visibility = IDL.Variant({ 'Private' : IDL.Null, 'Public' : IDL.Null });
  const Initialization = IDL.Record({
    'owner' : IDL.Principal,
    'visibility' : Visibility,
  });
  return [Initialization];
};