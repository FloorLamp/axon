import { ActorSubclass } from "@dfinity/agent";
import Axon, { Command, Operation } from "../declarations/Axon/Axon.did";

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type AxonService = ActorSubclass<Axon._SERVICE>;

export type CommandKey = KeysOfUnion<Command>;

export type OperationKey = KeysOfUnion<Operation>;
