const CanisterIds = require("../../canister_ids.json");

module.exports = {
  env: {
    AXON_CANISTER_ID:
      process.env.NEXT_PUBLIC_DFX_NETWORK === "local"
        ? require("../../.dfx/local/canister_ids.json").Axon.local
        : CanisterIds.Axon.ic,
  },
};
