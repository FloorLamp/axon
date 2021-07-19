import { Principal } from "@dfinity/principal";
import React, { useState } from "react";
import { Command, Operation } from "../../declarations/Axon/Axon.did";
import SpinnerButton from "../Buttons/SpinnerButton";
import DissolveDelayInput from "../Inputs/DissolveDelayInput";

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
  propose,
  isLoading,
}: {
  propose: (proposal: Command) => void;
  isLoading: boolean;
}) {
  const [operation, setOperation] = useState<OperationName>(operations[0]);

  const [hotKey, setHotKey] = useState("");
  const [dissolveDelay, setDissolveDelay] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    let op: Operation;
    if (operation === "Add Hot Key" || operation === "Remove Hot Key") {
      let new_hot_key;
      try {
        new_hot_key = [Principal.fromText(hotKey)];
      } catch (err) {
        setError("Invalid principal");
        return;
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

    propose({
      Configure: { operation: [op] },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 py-4">
        <div>
          <label>Operation</label>
          <select
            className="block px-2 py-1 rounded border border-gray-300"
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

        <div className="flex gap-2">
          <SpinnerButton
            isLoading={isLoading}
            className="px-2 py-1 text-center w-20 bg-gray-200 rounded hover:shadow-md transition-shadow transition-300"
          >
            Configure
          </SpinnerButton>
        </div>
      </div>
    </form>
  );
}
