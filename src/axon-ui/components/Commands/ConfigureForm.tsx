import { Principal } from "@dfinity/principal";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { Command, Operation } from "../../declarations/Axon/Axon.did";
import useDebounce from "../../lib/hooks/useDebounce";
import DissolveDelayInput from "../Inputs/DissolveDelayInput";
import ErrorAlert from "../Labels/ErrorAlert";

const operations = [
  "Add Hot Key",
  "Remove Hot Key",
  "Start Dissolving",
  "Stop Dissolving",
  "Increase Dissolve Delay",
  "Set Dissolve Timestamp",
] as const;

type OperationName = typeof operations[number];

export function ConfigureForm({
  makeCommand,
}: {
  makeCommand: (cmd: Command | null) => void;
}) {
  const [operation, setOperation] = useState<OperationName>(operations[0]);

  const [hotKey, setHotKey] = useState("");
  const [dissolveDelay, setDissolveDelay] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [error, setError] = useState("");

  const debouncedHotKey = useDebounce(hotKey);
  const debouncedDissolveDelay = useDebounce(dissolveDelay);
  const debouncedTimestamp = useDebounce(timestamp);

  useEffect(() => {
    setError("");

    let op: Operation;
    if (operation === "Add Hot Key" || operation === "Remove Hot Key") {
      if (!hotKey) return makeCommand(null);
      let value;
      try {
        value = [Principal.fromText(hotKey)];
      } catch (err) {
        setError("Invalid principal");
        return makeCommand(null);
      }
      op =
        operation === "Add Hot Key"
          ? {
              AddHotKey: {
                new_hot_key: value,
              },
            }
          : {
              RemoveHotKey: {
                hot_key_to_remove: value,
              },
            };
    } else if (operation === "Increase Dissolve Delay") {
      if (!dissolveDelay) {
        return makeCommand(null);
      }
      op = {
        IncreaseDissolveDelay: {
          additional_dissolve_delay_seconds: Number(dissolveDelay),
        },
      };
    } else if (operation === "Start Dissolving") {
      op = {
        StartDissolving: null,
      };
    } else if (operation === "Stop Dissolving") {
      op = {
        StopDissolving: null,
      };
    } else if (operation === "Set Dissolve Timestamp") {
      if (!timestamp) {
        return makeCommand(null);
      }

      let dissolve_timestamp_seconds;
      try {
        dissolve_timestamp_seconds = BigInt(
          DateTime.fromISO(timestamp).toSeconds()
        );
      } catch (err) {
        setError("Invalid dissolve date");
        return makeCommand(null);
      }
      op = {
        SetDissolveTimestamp: {
          dissolve_timestamp_seconds,
        },
      };
    }

    makeCommand({
      Configure: { operation: [op] },
    });
  }, [operation, debouncedHotKey, debouncedDissolveDelay, debouncedTimestamp]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label>Operation</label>
        <select
          className="w-full mt-1"
          onChange={(e) => setOperation(e.target.value as OperationName)}
          value={operation}
        >
          {operations.map((operation) => (
            <option key={operation} value={operation}>
              {operation}
            </option>
          ))}
        </select>
      </div>

      {(operation === "Add Hot Key" || operation === "Remove Hot Key") && (
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
      )}

      {operation === "Increase Dissolve Delay" && (
        <div>
          <label>Additional Dissolve Delay</label>
          <DissolveDelayInput
            value={dissolveDelay}
            onChange={setDissolveDelay}
            required
          />
        </div>
      )}

      {operation === "Set Dissolve Timestamp" && (
        <div>
          <label>Dissolve Timestamp</label>
          <input
            type="datetime-local"
            placeholder="Dissolve Timestamp"
            className="w-full mt-1"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            maxLength={20}
            required
          />
        </div>
      )}

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
