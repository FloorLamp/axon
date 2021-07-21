import { HttpAgent } from "@dfinity/agent";
import { canisterId, createActor } from "../declarations/Governance";

export const defaultAgent = new HttpAgent({ host: "https://ic0.app" });

export const governance = createActor(canisterId, defaultAgent);
