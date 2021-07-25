import { ActorSubclass } from "@dfinity/agent";
import Axon, {
  ActionType,
  AxonCommandRequest,
  Command,
  Command_1,
  InitiateAction,
  Operation,
  Status,
} from "../declarations/Axon/Axon.did";
import { Action } from "../declarations/Governance/Governance.did.d";

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type AxonService = ActorSubclass<Axon._SERVICE>;

export type StatusKey = KeysOfUnion<Status>;
export type ActionTypeKey = KeysOfUnion<ActionType>;

export type AxonCommandKey = KeysOfUnion<AxonCommandRequest>;

export type CommandKey = KeysOfUnion<Command>;
export type CommandResponseKey = KeysOfUnion<Command_1>;
export type ActionKey = KeysOfUnion<Action>;
export type OperationKey = KeysOfUnion<Operation>;

export type ActionOptions = {
  [Property in keyof Omit<
    InitiateAction,
    "action"
  >]?: InitiateAction[Property][0];
};
