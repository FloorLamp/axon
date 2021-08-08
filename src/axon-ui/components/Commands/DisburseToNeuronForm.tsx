import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import { Command, DisburseToNeuron } from "../../declarations/Axon/Axon.did";
import { NEURON_MIN_STAKE } from "../../lib/constants";
import useDebounce from "../../lib/hooks/useDebounce";
import DissolveDelayInput from "../Inputs/DissolveDelayInput";
import ErrorAlert from "../Labels/ErrorAlert";

export function DisburseToNeuronForm({
  stake,
  makeCommand,
  defaults,
}: {
  stake?: bigint;
  makeCommand: (cmd: Command | null) => void;
  defaults?: DisburseToNeuron;
}) {
  const [kyc, setKyc] = useState(defaults?.kyc_verified ?? true);
  const [dissolveDelay, setDissolveDelay] = useState(
    defaults?.dissolve_delay_seconds.toString() ?? ""
  );
  const [controller, setController] = useState(
    defaults?.new_controller[0] ? defaults.new_controller[0].toText() : ""
  );
  const [amount, setAmount] = useState(defaults?.amount_e8s.toString() ?? "");
  const [nonce, setNonce] = useState(defaults?.nonce.toString() ?? "");
  const [error, setError] = useState("");

  const debouncedController = useDebounce(controller);
  const debouncedAmount = useDebounce(amount);
  const debouncedDissolveDelay = useDebounce(dissolveDelay);
  const debouncedNonce = useDebounce(nonce);

  useEffect(() => {
    setError("");
    let new_controller: DisburseToNeuron["new_controller"] = [];
    if (controller) {
      try {
        new_controller = [Principal.fromText(controller)];
      } catch (err) {
        setError("Invalid principal: " + err.message);
        return makeCommand(null);
      }
    }

    if (!amount || !nonce || !dissolveDelay) {
      return makeCommand(null);
    }

    let nonce_bi: bigint;
    try {
      nonce_bi = BigInt(nonce);
    } catch (err) {
      setError("Invalid nonce");
      return makeCommand(null);
    }

    let command: Command;
    try {
      command = {
        DisburseToNeuron: {
          dissolve_delay_seconds: BigInt(dissolveDelay),
          kyc_verified: kyc,
          amount_e8s: BigInt(amount) * BigInt(1e8),
          new_controller,
          nonce: nonce_bi,
        },
      };
    } catch (error) {
      setError(error.message);
      return makeCommand(null);
    }

    makeCommand(command);
  }, [
    debouncedController,
    debouncedAmount,
    debouncedDissolveDelay,
    debouncedNonce,
  ]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div>
          <label>Amount</label>
          <input
            type="number"
            placeholder="Amount"
            className="w-full mt-1"
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
            required
          />
        </div>

        <div>
          <div className="flex justify-between">
            <span>New Controller</span>
            <span className="text-gray-400">Optional</span>
          </div>
          <input
            type="text"
            placeholder="New Controller"
            className="w-full mt-1"
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
            className="w-full mt-1"
            value={nonce}
            onChange={(e) => setNonce(e.target.value)}
            maxLength={64}
            required
          />
        </div>

        <div>
          <label className="cursor-pointer inline-flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={kyc}
              onChange={(e) => setKyc(e.target.checked)}
            />
            KYCed
          </label>
        </div>
      </div>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </>
  );
}
