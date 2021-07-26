import { HttpAgent } from "@dfinity/agent";
import { canisterId, createActor } from "../declarations/Governance";

export const defaultAgent = new HttpAgent({
  host:
    process.env.NEXT_PUBLIC_DFX_NETWORK === "local"
      ? "http://localhost:8000"
      : "https://ic0.app",
});

export const governance = createActor(canisterId, defaultAgent);
