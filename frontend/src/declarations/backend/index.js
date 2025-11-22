import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "./backend.did.js";

export const canisterId = process.env.CANISTER_ID_BACKEND ||
  (process.env.DFX_NETWORK !== "ic" ? "bkyz2-fmaaa-aaaaa-qaaaq-cai" : undefined);

export const createActor = (canisterId, options = {}) => {
  const agent = options.agent || new HttpAgent({
    ...options.agentOptions,
    host: process.env.DFX_NETWORK === "ic"
      ? "https://ic0.app"
      : "http://127.0.0.1:4943"
  });

  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const backend = canisterId ? createActor(canisterId) : undefined;
