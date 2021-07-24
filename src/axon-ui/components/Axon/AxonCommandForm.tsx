import React, { useState } from "react";
import {
  ActionType,
  AxonCommandRequest,
} from "../../declarations/Axon/Axon.did";
import { KeysOfUnion } from "../../lib/types";
import { AddOwnerForm, RemoveOwnerForm } from "./OwnersForm";
import { PolicyForm } from "./PolicyForm";
import { VisibilityForm } from "./VisibilityForm";

const commands: [AxonCommandName, string][] = [
  ["AddOwner", "Add Owner"],
  ["RemoveOwner", "Remove Owner"],
  ["UpdateVisibility", "Update Visibility"],
  ["SetPolicy", "Set Policy"],
];

type AxonCommandName = KeysOfUnion<AxonCommandRequest>;

export default function AxonCommandForm({
  setAction,
}: {
  setAction: (at: ActionType) => void;
}) {
  const [commandName, setCommandName] = useState<AxonCommandName>(
    commands[0][0]
  );

  function setCommand(command: AxonCommandRequest) {
    if (!command) {
      setAction(null);
    } else {
      setAction({
        AxonCommand: [command, []],
      });
    }
  }

  const renderForm = () => {
    switch (commandName) {
      case "AddOwner":
        return <AddOwnerForm makeCommand={setCommand} />;
      case "RemoveOwner":
        return <RemoveOwnerForm makeCommand={setCommand} />;
      case "UpdateVisibility":
        return <VisibilityForm makeCommand={setCommand} />;
      case "SetPolicy":
        return <PolicyForm makeCommand={setCommand} />;
    }
  };

  return (
    <>
      <div className="py-4">
        <label>Command</label>
        <select
          className="w-full mt-1"
          onChange={(e) => setCommandName(e.target.value as AxonCommandName)}
          value={commandName}
        >
          {commands.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {renderForm()}
    </>
  );
}
