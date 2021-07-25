import React, { useEffect, useState } from "react";
import {
  Action,
  Command,
  NeuronId,
} from "../../declarations/Governance/Governance.did.d";
import useDebounce from "../../lib/hooks/useDebounce";
import ErrorAlert from "../Labels/ErrorAlert";
import CommandForm from "./CommandForm";

/** @todo use address book selector for neurons */
export default function ManageNeuronForm({
  setAction,
}: {
  setAction: (cmd: Action | null) => void;
}) {
  const [neuronId, setNeuronId] = useState("");
  const [command, setCommand] = useState<Command>(null);
  const [error, setError] = useState("");

  const debouncedNeuronId = useDebounce(neuronId);

  useEffect(() => {
    setError("");

    if (!neuronId || !command) {
      return setAction(null);
    }

    let id: [NeuronId];
    try {
      id = [{ id: BigInt(neuronId) }];
    } catch (error) {
      return setError("Invalid Neuron ID");
    }

    setAction({
      ManageNeuron: {
        id,
        command: [command],
      },
    });
  }, [debouncedNeuronId, command]);

  return (
    <div className="flex flex-col gap-2">
      <label className="block">
        Neuron ID
        <input
          type="number"
          placeholder="Neuron ID"
          className="w-full mt-1"
          value={neuronId}
          onChange={(e) => setNeuronId(e.target.value)}
          maxLength={20}
          min={0}
        />
      </label>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}

      <CommandForm setCommand={setCommand} />
    </div>
  );
}
