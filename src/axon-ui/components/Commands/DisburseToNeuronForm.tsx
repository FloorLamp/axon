import { Principal } from "@dfinity/principal";
import React, { useState } from "react";
import { Command, DisburseToNeuron } from "../../declarations/Axon/Axon.did";
import { NEURON_MIN_STAKE } from "../../lib/constants";
import SpinnerButton from "../Buttons/SpinnerButton";
import DissolveDelayInput from "../Inputs/DissolveDelayInput";

export function DisburseToNeuronForm({
  propose,
  isLoading,
  stake,
}: {
  propose: (proposal: Command) => void;
  isLoading: boolean;
  stake?: bigint;
}) {
  const [kyc, setKyc] = useState(true);
  const [dissolveDelay, setDissolveDelay] = useState("");
  const [controller, setController] = useState("");
  const [amount, setAmount] = useState("");
  const [nonce, setNonce] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    setError("");
    let new_controller = [];
    try {
      new_controller = [Principal.fromText(controller)];
    } catch (err) {
      setError("Invalid principal: " + err.message);
      return;
    }

    let nonce_bi;
    try {
      nonce_bi = BigInt(nonce);
    } catch (err) {
      setError("Invalid nonce");
      return;
    }

    propose({
      DisburseToNeuron: {
        dissolve_delay_seconds: BigInt(dissolveDelay),
        kyc_verified: kyc,
        amount_e8s: BigInt(amount) * BigInt(1e8),
        new_controller,
        nonce: nonce_bi,
      } as DisburseToNeuron,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 py-4">
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
          <label>
            <input
              type="checkbox"
              className="mr-1"
              checked={kyc}
              onChange={(e) => setKyc(e.target.checked)}
            />
            KYCed
          </label>
        </div>

        <div className="flex gap-2">
          <SpinnerButton
            isLoading={isLoading}
            className="px-2 py-1 text-center w-40 bg-gray-200 rounded hover:shadow-md transition-shadow transition-300"
          >
            Disburse To Neuron
          </SpinnerButton>
        </div>
      </div>
    </form>
  );
}
