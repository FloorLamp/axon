const CanisterIds = require("../../canister_ids.json");

const AXON_CANISTER_ID =
  process.env.NEXT_PUBLIC_DFX_NETWORK === "local"
    ? require("../../.dfx/local/canister_ids.json").Axon.local
    : CanisterIds.Axon.ic;
console.log(`AXON_CANISTER_ID=${AXON_CANISTER_ID}`);

module.exports = {
  env: {
    AXON_CANISTER_ID,
  },
};
