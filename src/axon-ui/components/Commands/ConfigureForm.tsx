import React, { useEffect, useState } from "react";
import {
  Command,
  Configure,
  Operation,
} from "../../declarations/Axon/Axon.did";
import { AddHotkeyForm } from "./AddHotkeyForm";
import { IncreaseDissolveDelayForm } from "./IncreaseDissolveDelayForm";
import { RemoveHotkeyForm } from "./RemoveHotkeyForm";
import { SetDissolveTimestampForm } from "./SetDissolveTimestampForm";

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
  defaults,
  neuronIds,
}: {
  makeCommand: (cmd: Command | null) => void;
  defaults?: Configure;
  neuronIds: string[];
}) {
  const [operationName, setOperationName] = useState<OperationName>(
    defaults
      ? (Object.keys(defaults.operation[0])[0] as OperationName)
      : operations[0]
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
    switch (operationName) {
      case "Increase Dissolve Delay":
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

      case "Set Dissolve Timestamp":
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

      case "Add Hot Key":
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
      case "Remove Hot Key":
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
      case "Start Dissolving":
      case "Stop Dissolving":
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label>Operation</label>
        <select
          className="w-full mt-1"
          onChange={(e) => setOperationName(e.target.value as OperationName)}
          value={operationName}
        >
          {operations.map((operation) => (
            <option key={operation} value={operation}>
              {operation}
            </option>
          ))}
        </select>
      </div>

      {renderForm()}
    </div>
  );
}
