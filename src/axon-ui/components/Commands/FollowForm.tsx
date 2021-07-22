import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { Command } from "../../declarations/Axon/Axon.did";
import { Topic } from "../../lib/governance";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import useDebounce from "../../lib/hooks/useDebounce";
import { enumEntries } from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";

const DEFAULT_NEURONS = [
  {
    value: "27",
    label: "27 - DFINITY Foundation",
  },
  {
    value: "28",
    label: "28 - Internet Computer Association",
  },
];

export default function FollowForm({
  makeCommand,
}: {
  makeCommand: (cmd: Command | null) => void;
}) {
  const { data } = useNeuronIds();
  const [topic, setTopic] = useState(Topic["All Topics"]);
  const [neurons, setNeurons] = useState<string[]>([]);
  const [error, setError] = useState("");

  const debouncedTopic = useDebounce(topic);

  useEffect(() => {
    setError("");

    let followees;
    try {
      followees = neurons.map((id) => ({ id: BigInt(id) }));
    } catch (error) {
      setError(`Invalid Neuron ID: ${error.message}`);
      return;
    }

    makeCommand({
      Follow: { topic: Number(debouncedTopic), followees },
    });
  }, [debouncedTopic, neurons]);

  const handleChangeNeurons = (values: { value: string; label: string }[]) => {
    setNeurons(values.map(({ value }) => value));
  };

  const myNeurons = data
    .map((id) => ({ value: id.toString(), label: id.toString() }))
    .sort((a: any, b: any) => a.value - b.value);

  return (
    <>
      <div className="flex flex-col py-4 gap-2">
        <div>
          <label>Topic</label>
          <select
            className="w-full mt-1"
            onChange={(e) => setTopic(e.target.value as unknown as Topic)}
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
            isMulti
            onChange={handleChangeNeurons}
            options={DEFAULT_NEURONS.concat(myNeurons)}
          />
        </div>
      </div>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </>
  );
}
