import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "./backend.did.js";

// Try multiple sources for canister ID
export const canisterId =
  process.env.CANISTER_ID_BACKEND ||
  import.meta.env.VITE_BACKEND_CANISTER_ID ||
  (process.env.DFX_NETWORK !== "ic" ? "bkyz2-fmaaa-aaaaa-qaaaq-cai" : undefined);

console.log('Backend canister ID:', canisterId);
console.log('DFX_NETWORK:', process.env.DFX_NETWORK);

export const createActor = (canisterId, options = {}) => {
  const host = process.env.DFX_NETWORK === "ic"
    ? "https://ic0.app"
    : "http://127.0.0.1:4943";

  console.log('Creating actor with:', { canisterId, host });

  const agent = options.agent || new HttpAgent({
    ...options.agentOptions,
    host
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
