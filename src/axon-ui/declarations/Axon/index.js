import { Actor } from "@dfinity/agent";
import { idlFactory } from "./Axon.did.js";

import CanisterIds from "../../../../canister_ids.json";

let localCanisterIds;
try {
  localCanisterIds = require("../../../../.dfx/local/canister_ids.json");
} catch (error) {
  console.warn("local canister_ids.json not found!");
}

export const canisterId =
  process.env.NEXT_PUBLIC_DFX_NETWORK === "local"
    ? localCanisterIds?.Axon.local
    : CanisterIds.Axon.ic;

/**
 *
 * @param {string | Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig}} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("./Axon.did.js")._SERVICE>}
 */
export const createActor = (canisterId, agent) => {
  // Fetch root key for certificate validation during development
  if (process.env.NEXT_PUBLIC_DFX_NETWORK === "local") {
    agent.fetchRootKey();
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
