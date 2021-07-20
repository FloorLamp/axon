import { Principal } from "@dfinity/principal";
import React, { useState } from "react";
import { Command, Operation } from "../../declarations/Axon/Axon.did";
import DissolveDelayInput from "../Inputs/DissolveDelayInput";
import ErrorAlert from "../Labels/ErrorAlert";
import CommandForm from "./CommandForm";

const operations = [
  "Add Hot Key",
  "Remove Hot Key",
  "Start Dissolving",
  "Stop Dissolving",
  "Increase Dissolve Delay",
  "Set Dissolve Timestamp",
] as const;

type OperationName = typeof operations[number];

export function ConfigureForm() {
  const [operation, setOperation] = useState<OperationName>(operations[0]);

  const [hotKey, setHotKey] = useState("");
  const [dissolveDelay, setDissolveDelay] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [error, setError] = useState("");

  const makeCommand = (): Command | null => {
    let op: Operation;
    if (operation === "Add Hot Key" || operation === "Remove Hot Key") {
      let new_hot_key;
      try {
        new_hot_key = [Principal.fromText(hotKey)];
      } catch (err) {
        setError("Invalid principal");
        return null;
      }
      op = {
        [operation === "Add Hot Key" ? "AddHotKey" : "RemoveHotKey"]: {
          new_hot_key,
        },
      } as Operation;
    } else if (operation === "Increase Dissolve Delay") {
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
      op = {
        SetDissolveTimestamp: {
          dissolve_timestamp_seconds: BigInt(timestamp),
        },
      };
    }

    return {
      Configure: { operation: [op] },
    };
  };

  return (
    <CommandForm makeCommand={makeCommand}>
      <div className="flex flex-col py-4 gap-2">
        <div>
          <label>Operation</label>
          <select
            className="block w-full px-2 py-1 rounded border border-gray-300 cursor-pointer"
            onChange={(e) => setOperation(e.target.value as OperationName)}
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
              className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
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
            />
          </div>
        )}

        {operation === "Set Dissolve Timestamp" && (
          <div>
            <label>Dissolve Timestamp</label>
            <input
              type="text"
              placeholder="Dissolve Timestamp"
              className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              maxLength={20}
            />
          </div>
        )}

        {!!error && <ErrorAlert>{error}</ErrorAlert>}
      </div>
    </CommandForm>
  );
}
