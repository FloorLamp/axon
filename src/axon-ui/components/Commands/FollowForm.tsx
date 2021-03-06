import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { Command, Follow } from "../../declarations/Axon/Axon.did";
import { Topic } from "../../lib/governance";
import useDebounce from "../../lib/hooks/useDebounce";
import useNeuronOptions from "../../lib/hooks/useNeuronOptions";
import { enumEntries } from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";

export default function FollowForm({
  makeCommand,
  defaults,
}: {
  makeCommand: (cmd: Command | null) => void;
  defaults?: Follow;
}) {
  const [topic, setTopic] = useState(defaults?.topic ?? Topic["All Topics"]);
  const [neurons, setNeurons] = useState<string[]>(
    defaults?.followees.map(({ id }) => id.toString()) ?? []
  );
  const [error, setError] = useState("");

  const neuronOptions = useNeuronOptions();

  const debouncedTopic = useDebounce(topic);
  useEffect(() => {
    setError("");

    let followees;
    try {
      followees = neurons.map((id) => ({ id: BigInt(id) }));
    } catch (error) {
      setError(`Invalid Neuron ID: ${error.message}`);
      return makeCommand(null);
    }

    makeCommand({
      Follow: { topic: Number(debouncedTopic), followees },
    });
  }, [debouncedTopic, neurons]);

  const handleChangeNeurons = (values: { value: string; label: string }[]) => {
    setNeurons(values.map(({ value }) => value));
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label>Topic</label>
        <select
          className="react-select w-full mt-1"
          onChange={(e) => setTopic(e.target.value as unknown as Topic)}
          value={topic}
        >
          {enumEntries(Topic).map(([name, id]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Neuron</label>
        <CreatableSelect
          className="react-select"
          isMulti
          onChange={handleChangeNeurons}
          options={neuronOptions}
        />
      </div>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
