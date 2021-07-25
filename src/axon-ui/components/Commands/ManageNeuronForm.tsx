import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import {
  Action,
  Command,
  NeuronId,
} from "../../declarations/Governance/Governance.did.d";
import useDebounce from "../../lib/hooks/useDebounce";
import useNeuronOptions from "../../lib/hooks/useNeuronOptions";
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

  const neuronOptions = useNeuronOptions();
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
        <CreatableSelect
          onChange={({ value }) => setNeuronId(value)}
          options={neuronOptions}
        />
      </label>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}

      <CommandForm setCommand={setCommand} />
    </div>
  );
}
