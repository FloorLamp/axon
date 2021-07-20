import { ActorSubclass } from "@dfinity/agent";
import Axon, {
  Command,
  Operation,
  Status,
} from "../declarations/Axon/Axon.did";

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type AxonService = ActorSubclass<Axon._SERVICE>;

export type StatusKey = KeysOfUnion<Status>;

export type CommandKey = KeysOfUnion<Command>;

export type OperationKey = KeysOfUnion<Operation>;
