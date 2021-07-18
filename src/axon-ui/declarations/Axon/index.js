import { Actor } from "@dfinity/agent";
import { idlFactory } from "./Axon.did.js";

import CanisterIds from "../../../../canister_ids.json";

export const canisterId = CanisterIds.Axon.ic;

/**
 *
 * @param {string | Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig}} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("./Axon.did.js")._SERVICE>}
 */
export const createActor = (canisterId, agent) => {
  // Fetch root key for certificate validation during development
  if (process.env.NODE_ENV !== "production") agent.fetchRootKey();

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
