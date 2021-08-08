import React, { useEffect, useState } from "react";
import {
  Command,
  Configure,
  Operation,
} from "../../declarations/Axon/Axon.did";
import { OperationKey } from "../../lib/types";
import { AddHotkeyForm } from "./AddHotkeyForm";
import { IncreaseDissolveDelayForm } from "./IncreaseDissolveDelayForm";
import { RemoveHotkeyForm } from "./RemoveHotkeyForm";
import { SetDissolveTimestampForm } from "./SetDissolveTimestampForm";

const operations: [OperationKey, string][] = [
  ["AddHotKey", "Add Hot Key"],
  ["RemoveHotKey", "Remove Hot Key"],
  ["StartDissolving", "Start Dissolving"],
  ["StopDissolving", "Stop Dissolving"],
  ["IncreaseDissolveDelay", "Increase Dissolve Delay"],
  ["SetDissolveTimestamp", "Set Dissolve Timestamp"],
];

export function ConfigureForm({
  makeCommand,
  defaults,
  neuronIds,
}: {
  makeCommand: (cmd: Command | null) => void;
  defaults?: Configure;
  neuronIds: string[];
}) {
  const [operationKey, setOperationKey] = useState<OperationKey>(
    defaults
      ? (Object.keys(defaults.operation[0])[0] as OperationKey)
      : operations[0][0]
  );

  const [operation, setOperation] = useState<Operation>(null);

  useEffect(() => {
    if (operation) {
      makeCommand({
        Configure: { operation: [operation] },
      });
    } else {
      makeCommand(null);
    }
  }, [operation]);

  const renderForm = () => {
    switch (operationKey) {
      case "IncreaseDissolveDelay":
        return (
          <IncreaseDissolveDelayForm
            makeOperation={setOperation}
            defaults={
              defaults && "IncreaseDissolveDelay" in defaults.operation[0]
                ? defaults.operation[0].IncreaseDissolveDelay
                : undefined
            }
          />
        );

      case "SetDissolveTimestamp":
        return (
          <SetDissolveTimestampForm
            makeOperation={setOperation}
            defaults={
              defaults && "SetDissolveTimestamp" in defaults.operation[0]
                ? defaults.operation[0].SetDissolveTimestamp
                : undefined
            }
          />
        );

      case "AddHotKey":
        return (
          <AddHotkeyForm
            makeOperation={setOperation}
            defaults={
              defaults && "AddHotKey" in defaults.operation[0]
                ? defaults.operation[0].AddHotKey
                : undefined
            }
          />
        );
      case "RemoveHotKey":
        return (
          <RemoveHotkeyForm
            makeOperation={setOperation}
            defaults={
              defaults && "RemoveHotKey" in defaults.operation[0]
                ? defaults.operation[0].RemoveHotKey
                : undefined
            }
            neuronIds={neuronIds}
          />
        );
      case "StartDissolving":
      case "StopDissolving":
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label>Operation</label>
        <select
          className="w-full mt-1"
          onChange={(e) => setOperationKey(e.target.value as OperationKey)}
          value={operationKey}
        >
          {operations.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {renderForm()}
    </div>
  );
}
