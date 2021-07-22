import { DateTime } from "luxon";
import {
  AddHotKey,
  Configure,
  Disburse,
  DisburseToNeuron,
  Follow,
  IncreaseDissolveDelay,
  NeuronCommand,
  RegisterVote,
  SetDissolveTimestamp,
  Spawn,
  Split,
} from "../declarations/Axon/Axon.did";
import { accountIdentifierToString } from "./account";
import { Vote } from "./governance";
import { CommandKey, OperationKey } from "./types";
import { formatE8s, shortAccount, shortPrincipal, stringify } from "./utils";

export const neuronCommandToString = ({
  command,
  neuronIds,
}: NeuronCommand) => {
  const key = Object.keys(command)[0] as CommandKey;
  switch (key) {
    case "RegisterVote": {
      const { vote, proposal } = command[key] as RegisterVote;
      return `Vote ${Vote[vote]} on Proposal ${proposal[0].id.toString()}`;
    }
    case "Follow": {
      const { followees, topic } = command[key] as Follow;
      return `Set Following for Topic ${topic}`;
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
      let accountId;
      if (aid) {
        accountId = shortAccount(accountIdentifierToString(aid));
      }
      return `Disburse${amt ? ` ${formatE8s(amt.e8s)} ICP` : ""}${
        accountId ? " to " + accountId : ""
      }`;
    }
    case "DisburseToNeuron": {
      const {
        new_controller: [controller],
        amount_e8s,
      } = command[key] as DisburseToNeuron;
      let cid;
      if (controller) {
        cid = shortPrincipal(controller);
      }
      return `Disburse to Neuron, ${formatE8s(amount_e8s)} ICP${
        cid ? " to " + cid : ""
      }`;
    }
    case "Configure": {
      const operation = (command[key] as Configure).operation[0];
      const opKey = Object.keys(operation)[0] as OperationKey;
      switch (opKey) {
        case "AddHotKey":
        case "RemoveHotKey":
          const {
            new_hot_key: [id],
          } = operation[opKey] as AddHotKey;
          return `${
            opKey === "AddHotKey" ? "Add" : "Remove"
          } Hot Key ${shortPrincipal(id)}`;
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
            Number(dissolve_timestamp_seconds / BigInt(1e9))
          ).toLocaleString(DateTime.DATETIME_SHORT);
          return `Set Dissolve to ${dt}`;
      }
    }
    default:
      return stringify(command);
  }
};
