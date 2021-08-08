import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import { AddHotKey, Operation } from "../../declarations/Axon/Axon.did";
import useDebounce from "../../lib/hooks/useDebounce";
import ErrorAlert from "../Labels/ErrorAlert";

export function AddHotkeyForm({
  makeOperation,
  defaults,
}: {
  makeOperation: (cmd: Operation | null) => void;
  defaults?: AddHotKey;
}) {
  const defaultHotkey = defaults ? defaults.new_hot_key[0].toText() : "";
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
      AddHotKey: {
        new_hot_key: value,
      },
    });
  }, [debouncedHotKey]);

  return (
    <div>
      <div>
        <label>Hot Key</label>
        <input
          type="text"
          placeholder="Hot Key"
          className="w-full mt-1"
          value={hotKey}
          onChange={(e) => setHotKey(e.target.value)}
          maxLength={64}
        />
      </div>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
