export const idlFactory = ({ IDL }) => {
  const ManageNeuron = IDL.Rec();
  const NeuronId = IDL.Record({ 'id' : IDL.Nat64 });
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
  const Followees = IDL.Record({ 'followees' : IDL.Vec(NeuronId) });
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
  const Proxy = IDL.Service({
    'list_neurons' : IDL.Func([], [ListNeuronsResponse], []),
    'manage_neuron' : IDL.Func([ManageNeuron], [ManageNeuronResponse], []),
  });
  const Visibility = IDL.Variant({ 'Private' : IDL.Null, 'Public' : IDL.Null });
  const Threshold = IDL.Variant({
    'Percent' : IDL.Record({
      'percent' : IDL.Nat,
      'quorum' : IDL.Opt(IDL.Nat),
    }),
    'Absolute' : IDL.Nat,
  });
  const Policy = IDL.Record({
    'proposeThreshold' : IDL.Nat,
    'proposers' : IDL.Variant({
      'Open' : IDL.Null,
      'Closed' : IDL.Vec(IDL.Principal),
    }),
    'acceptanceThreshold' : Threshold,
  });
  const AxonPublic = IDL.Record({
    'id' : IDL.Nat,
    'balance' : IDL.Nat,
    'name' : IDL.Text,
    'tokenHolders' : IDL.Nat,
    'totalStake' : IDL.Nat,
    'supply' : IDL.Nat,
    'proxy' : Proxy,
    'visibility' : Visibility,
    'policy' : Policy,
  });
  const definite_canister_settings = IDL.Record({
    'freezing_threshold' : IDL.Nat,
    'controllers' : IDL.Vec(IDL.Principal),
    'memory_allocation' : IDL.Nat,
    'compute_allocation' : IDL.Nat,
  });
  const CanisterStatusResult = IDL.Record({
    'status' : IDL.Variant({
      'stopped' : IDL.Null,
      'stopping' : IDL.Null,
      'running' : IDL.Null,
    }),
    'memory_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'settings' : definite_canister_settings,
    'module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Status = IDL.Variant({
    'Active' : IDL.Int,
    'Rejected' : IDL.Int,
    'ExecutionQueued' : IDL.Int,
    'Accepted' : IDL.Int,
    'ExecutionStarted' : IDL.Int,
    'ExecutionFinished' : IDL.Int,
    'Cancelled' : IDL.Int,
    'Created' : IDL.Int,
    'Expired' : IDL.Int,
  });
  const Vote = IDL.Variant({ 'No' : IDL.Null, 'Yes' : IDL.Null });
  const Ballot__1 = IDL.Record({
    'principal' : IDL.Principal,
    'votingPower' : IDL.Nat,
    'vote' : IDL.Opt(Vote),
  });
  const Votes = IDL.Record({
    'no' : IDL.Nat,
    'yes' : IDL.Nat,
    'notVoted' : IDL.Nat,
  });
  const NeuronCommandRequest = IDL.Record({
    'command' : Command,
    'neuronIds' : IDL.Opt(IDL.Vec(IDL.Nat64)),
  });
  const Ballot = IDL.Record({ 'vote' : IDL.Int32, 'voting_power' : IDL.Nat64 });
  const Tally = IDL.Record({
    'no' : IDL.Nat64,
    'yes' : IDL.Nat64,
    'total' : IDL.Nat64,
    'timestamp_seconds' : IDL.Nat64,
  });
  const ProposalInfo = IDL.Record({
    'id' : IDL.Opt(NeuronId),
    'status' : IDL.Int32,
    'topic' : IDL.Int32,
    'failure_reason' : IDL.Opt(GovernanceError),
    'ballots' : IDL.Vec(IDL.Tuple(IDL.Nat64, Ballot)),
    'proposal_timestamp_seconds' : IDL.Nat64,
    'reward_event_round' : IDL.Nat64,
    'failed_timestamp_seconds' : IDL.Nat64,
    'reject_cost_e8s' : IDL.Nat64,
    'latest_tally' : IDL.Opt(Tally),
    'reward_status' : IDL.Int32,
    'decided_timestamp_seconds' : IDL.Nat64,
    'proposal' : IDL.Opt(Proposal),
    'proposer' : IDL.Opt(NeuronId),
    'executed_timestamp_seconds' : IDL.Nat64,
  });
  const ErrorCode = IDL.Variant({
    'canister_error' : IDL.Null,
    'system_transient' : IDL.Null,
    'future' : IDL.Nat32,
    'canister_reject' : IDL.Null,
    'destination_invalid' : IDL.Null,
    'system_fatal' : IDL.Null,
  });
  const Error = IDL.Variant({
    'AlreadyVoted' : IDL.Null,
    'Error' : IDL.Record({
      'error_message' : IDL.Text,
      'error_type' : ErrorCode,
    }),
    'CannotVote' : IDL.Null,
    'CannotExecute' : IDL.Null,
    'InvalidProposal' : IDL.Null,
    'InsufficientBalance' : IDL.Null,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'NotProposer' : IDL.Null,
    'NoNeurons' : IDL.Null,
    'GovernanceError' : GovernanceError,
    'InsufficientBalanceToPropose' : IDL.Null,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Opt(ProposalInfo), 'err' : Error });
  const Result_1 = IDL.Variant({ 'ok' : ManageNeuronResponse, 'err' : Error });
  const ManageNeuronResponseOrProposal = IDL.Variant({
    'ProposalInfo' : Result_2,
    'ManageNeuronResponse' : Result_1,
  });
  const NeuronCommandResponse = IDL.Tuple(
    IDL.Nat64,
    IDL.Vec(ManageNeuronResponseOrProposal),
  );
  const NeuronCommand = IDL.Tuple(
    NeuronCommandRequest,
    IDL.Opt(IDL.Vec(NeuronCommandResponse)),
  );
  const AxonCommandRequest = IDL.Variant({
    'Redenominate' : IDL.Record({ 'to' : IDL.Nat, 'from' : IDL.Nat }),
    'Mint' : IDL.Record({
      'recipient' : IDL.Opt(IDL.Principal),
      'amount' : IDL.Nat,
    }),
    'RemoveMembers' : IDL.Vec(IDL.Principal),
    'AddMembers' : IDL.Vec(IDL.Principal),
    'Transfer' : IDL.Record({
      'recipient' : IDL.Principal,
      'amount' : IDL.Nat,
    }),
    'SetVisibility' : Visibility,
    'SetPolicy' : Policy,
  });
  const AxonCommandExecution = IDL.Variant({
    'Ok' : IDL.Null,
    'Transfer' : IDL.Record({
      'senderBalanceAfter' : IDL.Nat,
      'amount' : IDL.Nat,
      'receiver' : IDL.Principal,
    }),
    'SupplyChanged' : IDL.Record({ 'to' : IDL.Nat, 'from' : IDL.Nat }),
  });
  const AxonCommandResponse = IDL.Variant({
    'ok' : AxonCommandExecution,
    'err' : Error,
  });
  const AxonCommand = IDL.Tuple(
    AxonCommandRequest,
    IDL.Opt(AxonCommandResponse),
  );
  const ProposalType = IDL.Variant({
    'NeuronCommand' : NeuronCommand,
    'AxonCommand' : AxonCommand,
  });
  const AxonProposal = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Vec(Status),
    'creator' : IDL.Principal,
    'ballots' : IDL.Vec(Ballot__1),
    'timeStart' : IDL.Int,
    'totalVotes' : Votes,
    'proposal' : ProposalType,
    'timeEnd' : IDL.Int,
    'policy' : Policy,
  });
  const Result_3 = IDL.Variant({ 'ok' : AxonProposal, 'err' : Error });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const LedgerEntry = IDL.Tuple(IDL.Principal, IDL.Nat);
  const Initialization = IDL.Record({
    'ledgerEntries' : IDL.Vec(LedgerEntry),
    'name' : IDL.Text,
    'visibility' : Visibility,
    'policy' : Policy,
  });
  const Result_4 = IDL.Variant({ 'ok' : AxonPublic, 'err' : Error });
  const ProposalResult = IDL.Variant({
    'ok' : IDL.Vec(AxonProposal),
    'err' : Error,
  });
  const ListNeuronsResult = IDL.Variant({
    'ok' : ListNeuronsResponse,
    'err' : Error,
  });
  const NewProposal = IDL.Record({
    'axonId' : IDL.Nat,
    'timeStart' : IDL.Opt(IDL.Int),
    'durationSeconds' : IDL.Opt(IDL.Nat),
    'proposal' : ProposalType,
    'execute' : IDL.Opt(IDL.Bool),
  });
  const VoteRequest = IDL.Record({
    'axonId' : IDL.Nat,
    'vote' : Vote,
    'proposalId' : IDL.Nat,
  });
  const AxonService = IDL.Service({
    'axonById' : IDL.Func([IDL.Nat], [AxonPublic], ['query']),
    'axonStatusById' : IDL.Func([IDL.Nat], [CanisterStatusResult], []),
    'balanceOf' : IDL.Func(
        [IDL.Nat, IDL.Opt(IDL.Principal)],
        [IDL.Nat],
        ['query'],
      ),
    'cancel' : IDL.Func([IDL.Nat, IDL.Nat], [Result_3], []),
    'cleanup' : IDL.Func([IDL.Nat], [Result], []),
    'count' : IDL.Func([], [IDL.Nat], ['query']),
    'create' : IDL.Func([Initialization], [Result_4], []),
    'execute' : IDL.Func([IDL.Nat, IDL.Nat], [Result_3], []),
    'getActiveProposals' : IDL.Func([IDL.Nat], [ProposalResult], ['query']),
    'getAllProposals' : IDL.Func(
        [IDL.Nat, IDL.Opt(IDL.Nat)],
        [ProposalResult],
        ['query'],
      ),
    'getNeuronIds' : IDL.Func([IDL.Nat], [IDL.Vec(IDL.Nat64)], ['query']),
    'getNeurons' : IDL.Func([IDL.Nat], [ListNeuronsResult], ['query']),
    'getProposalById' : IDL.Func([IDL.Nat, IDL.Nat], [Result_3], ['query']),
    'ledger' : IDL.Func([IDL.Nat], [IDL.Vec(LedgerEntry)], ['query']),
    'myAxons' : IDL.Func([], [IDL.Vec(AxonPublic)], ['query']),
    'propose' : IDL.Func([NewProposal], [Result_3], []),
    'sync' : IDL.Func([IDL.Nat], [ListNeuronsResult], []),
    'topAxons' : IDL.Func([], [IDL.Vec(AxonPublic)], ['query']),
    'transfer' : IDL.Func([IDL.Nat, IDL.Principal, IDL.Nat], [Result], []),
    'vote' : IDL.Func([VoteRequest], [Result], []),
    'wallet_receive' : IDL.Func([], [IDL.Nat], []),
  });
  return AxonService;
};
export const init = ({ IDL }) => { return []; };