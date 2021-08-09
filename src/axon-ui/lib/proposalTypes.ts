import assert from "assert";
import { DateTime } from "luxon";
import {
  AddHotKey,
  AxonCommandRequest,
  Command,
  Configure,
  Disburse,
  DisburseToNeuron,
  Follow,
  IncreaseDissolveDelay,
  Motion,
  ProposalType,
  RegisterVote,
  RemoveHotKey,
  SetDissolveTimestamp,
  Spawn,
  Split,
} from "../declarations/Axon/Axon.did";
import {
  ManageNeuron,
  Proposal,
} from "../declarations/Governance/Governance.did.d";
import { accountIdentifierToString } from "./account";
import { Topic, Vote } from "./governance";
import { ActionKey, AxonCommandKey, CommandKey, OperationKey } from "./types";
import {
  formatE8s,
  formatNumber,
  formatPercent,
  shortAccount,
  shortPrincipal,
  stringify,
} from "./utils";

export const proposalTypeToString = (proposal: ProposalType) => {
  if ("AxonCommand" in proposal) {
    return axonCommandToString(proposal.AxonCommand[0]);
  } else {
    return commandToString(proposal.NeuronCommand[0].command);
  }
};

export const hasExecutionError = (proposal: ProposalType) => {
  if ("AxonCommand" in proposal) {
    return proposal.AxonCommand[1][0]
      ? "err" in proposal.AxonCommand[1][0]
      : false;
  } else {
    return proposal.NeuronCommand[1][0]
      ? !proposal.NeuronCommand[1][0].every(
          ([_, res]) => "ok" in res && !("Error" in res.ok.command[0])
        )
      : false;
  }
};

export const commandToString = (command: Command) => {
  const key = Object.keys(command)[0] as CommandKey;
  switch (key) {
    case "RegisterVote": {
      const { vote, proposal } = command[key] as RegisterVote;
      return `Vote ${Vote[vote]} on Proposal ${proposal[0].id.toString()}`;
    }
    case "Follow": {
      const { topic } = command[key] as Follow;
      return `Set Following for ${Topic[topic]}`;
    }
    case "Spawn": {
      const controller = (command[key] as Spawn).new_controller[0];
      if (controller) {
        return `Spawn to ${shortPrincipal(controller)}`;
      }
      return "Spawn";
    }
    case "Split": {
      const amount = (command[key] as Split).amount_e8s;
      return `Split ${formatE8s(amount)} ICP`;
    }
    case "Disburse": {
      const {
        to_account: [aid],
        amount: [amt],
      } = command[key] as Disburse;
      return `Disburse${amt ? ` ${formatE8s(amt.e8s)} ICP` : ""}${
        aid ? " to " + shortAccount(accountIdentifierToString(aid)) : ""
      }`;
    }
    case "DisburseToNeuron": {
      const {
        new_controller: [controller],
        amount_e8s,
      } = command[key] as DisburseToNeuron;
      return `Disburse to Neuron, ${formatE8s(amount_e8s)} ICP${
        controller ? " to " + shortPrincipal(controller) : ""
      }`;
    }
    case "Configure": {
      const operation = (command[key] as Configure).operation[0];
      const opKey = Object.keys(operation)[0] as OperationKey;
      switch (opKey) {
        case "AddHotKey": {
          const {
            new_hot_key: [id],
          } = operation[opKey] as AddHotKey;
          return `Add Hot Key ${shortPrincipal(id)}`;
        }
        case "RemoveHotKey": {
          const {
            hot_key_to_remove: [id],
          } = operation[opKey] as RemoveHotKey;
          return `Remove Hot Key ${shortPrincipal(id)}`;
        }
        case "StartDissolving":
          return "Start Dissolving";
        case "StopDissolving":
          return "Stop Dissolving";
        case "IncreaseDissolveDelay":
          const { additional_dissolve_delay_seconds } = operation[
            opKey
          ] as IncreaseDissolveDelay;
          return `Increase Dissolve Delay by ${additional_dissolve_delay_seconds}s`;
        case "SetDissolveTimestamp":
          const { dissolve_timestamp_seconds } = operation[
            opKey
          ] as SetDissolveTimestamp;
          const dt = DateTime.fromSeconds(
            Number(dissolve_timestamp_seconds)
          ).toLocaleString(DateTime.DATETIME_SHORT);
          return `Set Dissolve to ${dt}`;
      }
    }
    case "MakeProposal": {
      const {
        action: [action],
      } = command[key] as Proposal;
      const actionKey = Object.keys(action)[0] as ActionKey;
      switch (actionKey) {
        case "ManageNeuron": {
          const {
            id,
            command: [delegatedCommand],
          } = action[actionKey] as ManageNeuron;

          return delegatedCommand
            ? `${id[0]?.id.toString()}: ${commandToString(delegatedCommand)}`
            : `Manage Neuron ${id[0]?.id.toString()}: ${
                Object.keys(delegatedCommand)[0]
              }`;
        }
        case "Motion":
          const { motion_text } = action[actionKey] as Motion;
          return `Motion: ${motion_text.slice(0, 35)}${
            motion_text.length > 35 ? "..." : ""
          }`;
      }
    }
    default:
      return stringify(command);
  }
};

export const axonCommandToString = (command: AxonCommandRequest) => {
  const key = Object.keys(command)[0] as AxonCommandKey;
  switch (key) {
    case "AddMembers": {
      assert("AddMembers" in command);
      const principals = command.AddMembers;
      const display =
        principals.length <= 2
          ? principals.map(shortPrincipal).join(", ")
          : `${principals.length} principals`;
      return `Add Proposers: ${display}`;
    }
    case "RemoveMembers": {
      assert("RemoveMembers" in command);
      const principals = command.RemoveMembers;
      const display =
        principals.length <= 2
          ? principals.map(shortPrincipal).join(", ")
          : `${principals.length} principals`;
      return `Remove Proposers: ${display}`;
    }
    case "SetPolicy": {
      assert("SetPolicy" in command);
      const { proposeThreshold, proposers, acceptanceThreshold } =
        command.SetPolicy;
      const membership = "Closed" in proposers ? "Restricted" : "Any";
      let threshold: string;
      if ("Percent" in acceptanceThreshold) {
        const percent = formatPercent(
          Number(acceptanceThreshold.Percent.percent) / 1e8,
          0
        );
        const quorum = acceptanceThreshold.Percent.quorum[0]
          ? `(${formatPercent(
              Number(acceptanceThreshold.Percent.quorum[0]) / 1e8,
              0
            )} quorum)`
          : "";
        threshold = `${percent} to accept${quorum ? " " + quorum : ""}`;
      } else {
        threshold = `${formatNumber(acceptanceThreshold.Absolute)} to accept`;
      }
      return `Set Policy: ${membership} proposer, ${formatNumber(
        proposeThreshold
      )} to propose, ${threshold}`;
    }
    case "SetVisibility": {
      assert("SetVisibility" in command);
      const visibility = Object.keys(command.SetVisibility)[0];
      return `Set Visibility to ${visibility}`;
    }
    case "Mint": {
      assert("Mint" in command);
      const to = command.Mint.recipient[0]
        ? ` to ${shortPrincipal(command.Mint.recipient[0])}`
        : "";
      return `Mint ${formatNumber(command.Mint.amount)} tokens${to}`;
    }
    case "Transfer": {
      assert("Transfer" in command);
      return `Transfer ${formatNumber(
        command.Transfer.amount
      )} tokens to ${shortPrincipal(command.Transfer.recipient)}`;
    }
    case "Redenominate": {
      assert("Redenominate" in command);
      return `Redenominate ${formatNumber(
        command.Redenominate.from
      )} to ${formatNumber(command.Redenominate.to)}`;
    }
  }
};
