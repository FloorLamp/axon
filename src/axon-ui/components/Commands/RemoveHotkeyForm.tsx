import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { Operation, RemoveHotKey } from "../../declarations/Axon/Axon.did";
import { useNeuronsByIds } from "../../lib/hooks/Axon/useNeuronsByIds";
import useDebounce from "../../lib/hooks/useDebounce";
import useNames from "../../lib/hooks/useNames";
import { shortPrincipal } from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";

export function RemoveHotkeyForm({
  makeOperation,
  defaults,
  neuronIds,
}: {
  makeOperation: (cmd: Operation | null) => void;
  defaults?: RemoveHotKey;
  neuronIds: string[];
}) {
  const defaultHotkey = defaults ? defaults.hot_key_to_remove[0].toText() : "";
  const [hotKey, setHotKey] = useState(defaultHotkey);
  const [error, setError] = useState("");

  const debouncedHotKey = useDebounce(hotKey);

  useEffect(() => {
    setError("");

    let op: Operation;
    if (!hotKey) return makeOperation(null);
    let value;
    try {
      value = [Principal.fromText(hotKey)];
    } catch (err) {
      setError("Invalid principal");
      return makeOperation(null);
    }
    makeOperation({
      RemoveHotKey: {
        hot_key_to_remove: value,
      },
    });
  }, [debouncedHotKey]);

  const { principalName } = useNames();
  const getPrincipalLabel = (value: string) =>
    principalName(value)
      ? `${principalName(value)} (${shortPrincipal(value)})`
      : value;
  const targetNeurons = useNeuronsByIds(neuronIds);
  const hotkeyOptions = [
    ...new Set(
      targetNeurons.flatMap((neuron) => neuron.hot_keys.map((p) => p.toText()))
    ),
  ].map((value) => ({ value, label: getPrincipalLabel(value) }));

  return (
    <div>
      <div>
        <label>Hot Key</label>
        <CreatableSelect
          onChange={({ value }) => setHotKey(value)}
          options={hotkeyOptions}
          defaultValue={
            defaults
              ? { value: defaultHotkey, label: defaultHotkey }
              : undefined
          }
        />
      </div>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
