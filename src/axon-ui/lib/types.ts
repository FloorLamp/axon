import { ActorSubclass } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import Axon, {
  AxonCommandRequest,
  Command,
  Command_1,
  NewProposal,
  Operation,
  ProposalType,
  Status,
} from "../declarations/Axon/Axon.did";
import { Action } from "../declarations/Governance/Governance.did.d";

export type Modify<T, R> = Omit<T, keyof R> & R;
export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type AxonService = ActorSubclass<Axon._SERVICE>;
export type AxonWithProxy = Modify<Axon.AxonPublic, { proxy: Principal }>;

export type StatusKey = KeysOfUnion<Status>;
export type ProposalTypeKey = KeysOfUnion<ProposalType>;

export type AxonCommandKey = KeysOfUnion<AxonCommandRequest>;

export type CommandKey = KeysOfUnion<Command>;
export type CommandResponseKey = KeysOfUnion<Command_1>;
export type ActionKey = KeysOfUnion<Action>;
export type OperationKey = KeysOfUnion<Operation>;

export type ProposalOptions = {
  [Property in keyof Omit<
    NewProposal,
    "proposal" | "axonId"
  >]?: NewProposal[Property][0];
};
