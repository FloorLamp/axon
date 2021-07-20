import { Principal } from "@dfinity/principal";
import { DateTime } from "luxon";
import {
  AddHotKey,
  Configure,
  Disburse,
  DisburseToNeuron,
  Error,
  GovernanceError,
  IncreaseDissolveDelay,
  NeuronCommand,
  SetDissolveTimestamp,
  Spawn,
  Split,
} from "../declarations/Axon/Axon.did";
import { accountIdentifierToString } from "./account";
import { CommandKey, OperationKey } from "./types";

export const stringify = (data) =>
  JSON.stringify(
    data,
    (key, value) =>
      typeof value === "bigint"
        ? value.toString()
        : value instanceof Principal
        ? value.toText()
        : Buffer.isBuffer(value)
        ? value.toString("hex")
        : value,
    2
  );

enum GovernanceErrorType {
  "Unspecified" = 0,
  "Ok" = 1,
  "Unavailable" = 2,
  "Not Authorized" = 3,
  "Not Found" = 4,
  "Invalid Command" = 5,
  "Requires Locked" = 6,
  "Requires Dissolving" = 7,
  "Requires Dissolved" = 8,
  "Hot Key" = 9,
  "Resource Exhausted" = 10,
  "Precondition Failed" = 11,
  "External" = 12,
  "Ledger Update Ongoing" = 13,
  "Insufficient Funds" = 14,
  "Invalid Principal" = 15,
  "Invalid Proposal" = 16,
}

export const governanceErrorToString = (error: GovernanceError) =>
  GovernanceErrorType[error.error_type] +
  (error.error_message ? ` (${error.error_message})` : "");

export const errorToString = (error: Error) => {
  if ("GovernanceError" in error) {
    return governanceErrorToString(error.GovernanceError);
  } else if ("Error" in error) {
    return (
      `[${error.Error.error_type}]` +
      (error.Error.error_message ? ` (${error.Error.error_message})` : "")
    );
  } else {
    return Object.keys(error)[0];
  }
};

export const neuronCommandToString = ({
  command,
  neuronIds,
}: NeuronCommand) => {
  const key = Object.keys(command)[0] as CommandKey;
  switch (key) {
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

export const formatE8s = (number: any, digits?: number) => {
  let n = number;
  if (typeof number !== "number") {
    n = Number(n);
  }
  return formatNumber(n / 1e8, digits);
};

export const formatNumber = (number: any, digits?: number) => {
  let n = number;
  if (typeof number !== "number") {
    n = Number(n);
  }
  const maximumFractionDigits =
    typeof digits === "undefined" ? (number < 1 ? 8 : 4) : digits;
  return Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(n);
};

export const shortAccount = (accountId: string) =>
  `${accountId.slice(0, 4)}...${accountId.slice(-4)}`;

export const shortPrincipal = (principal: string | Principal) => {
  const parts = (
    typeof principal === "string" ? principal : principal.toText()
  ).split("-");
  return `${parts[0]}...${parts.slice(-1)[0]}`;
};
