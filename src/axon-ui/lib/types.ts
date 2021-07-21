import { ActorSubclass } from "@dfinity/agent";
import Axon, {
  Command,
  Command_1,
  Operation,
  Status,
} from "../declarations/Axon/Axon.did";

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type AxonService = ActorSubclass<Axon._SERVICE>;

export type StatusKey = KeysOfUnion<Status>;

export type CommandKey = KeysOfUnion<Command>;
export type CommandResponseKey = KeysOfUnion<Command_1>;

export type OperationKey = KeysOfUnion<Operation>;

export enum Topic {
  "All Topics" = 0,
  "Neuron Management" = 1,
  "Exchange Rate" = 2,
  "Network Economics" = 3,
  "Governance" = 4,
  "Node Admin" = 5,
  "Participant Management" = 6,
  "Subnet Management" = 7,
  "Network Canister Management" = 8,
  "KYC" = 9,
  "Node Provider Rewards" = 10,
}
