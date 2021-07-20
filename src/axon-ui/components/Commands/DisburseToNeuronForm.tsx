import { Principal } from "@dfinity/principal";
import React, { useState } from "react";
import { Command, DisburseToNeuron } from "../../declarations/Axon/Axon.did";
import { NEURON_MIN_STAKE } from "../../lib/constants";
import DissolveDelayInput from "../Inputs/DissolveDelayInput";
import CommandForm from "./CommandForm";

export function DisburseToNeuronForm({ stake }: { stake?: bigint }) {
  const [kyc, setKyc] = useState(true);
  const [dissolveDelay, setDissolveDelay] = useState("");
  const [controller, setController] = useState("");
  const [amount, setAmount] = useState("");
  const [nonce, setNonce] = useState("");
  const [error, setError] = useState("");

  const makeCommand = (): Command | null => {
    setError("");
    let new_controller = [];
    if (controller) {
      try {
        new_controller = [Principal.fromText(controller)];
      } catch (err) {
        setError("Invalid principal: " + err.message);
        return null;
      }
    }

    let nonce_bi: BigInt;
    try {
      nonce_bi = BigInt(nonce);
    } catch (err) {
      setError("Invalid nonce");
      return null;
    }

    return {
      DisburseToNeuron: {
        dissolve_delay_seconds: BigInt(dissolveDelay),
        kyc_verified: kyc,
        amount_e8s: BigInt(amount) * BigInt(1e8),
        new_controller,
        nonce: nonce_bi,
      } as DisburseToNeuron,
    };
  };

  return (
    <CommandForm makeCommand={makeCommand}>
      <div className="flex flex-col py-4 gap-2">
        <div>
          <label>Amount</label>
          <input
            type="number"
            placeholder="Amount"
            className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={NEURON_MIN_STAKE}
            max={stake !== undefined ? Number(stake / BigInt(1e8)) : undefined}
            required
          />
        </div>

        <div>
          <label>Dissolve Delay</label>
          <DissolveDelayInput
            value={dissolveDelay}
            onChange={setDissolveDelay}
          />
        </div>

        <div>
          <label>New Controller</label>
          <input
            type="text"
            placeholder="New Controller"
            className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
            value={controller}
            onChange={(e) => setController(e.target.value)}
            maxLength={64}
          />
        </div>

        <div>
          <label>Nonce</label>
          <input
            type="text"
            placeholder="Nonce"
            className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
            value={nonce}
            onChange={(e) => setNonce(e.target.value)}
            maxLength={64}
            required
          />
        </div>

        <div>
          <label className="cursor-pointer">
            <input
              type="checkbox"
              className="mr-1"
              checked={kyc}
              onChange={(e) => setKyc(e.target.checked)}
            />
            KYCed
          </label>
        </div>
      </div>
    </CommandForm>
  );
}
