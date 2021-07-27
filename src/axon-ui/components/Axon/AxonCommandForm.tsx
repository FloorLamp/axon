import React, { useState } from "react";
import {
  AxonCommandRequest,
  ProposalType,
} from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import { KeysOfUnion } from "../../lib/types";
import { PolicyForm } from "./PolicyForm";
import { AddProposersForm, RemoveProposersForm } from "./ProposersForm";
import { VisibilityForm } from "./VisibilityForm";

const onlyClosedProposersCommands: [AxonCommandName, string][] = [
  ["AddMembers", "Add Proposers"],
  ["RemoveMembers", "Remove Proposers"],
];

const commands: [AxonCommandName, string][] = [
  ["SetVisibility", "Set Visibility"],
  ["SetPolicy", "Set Policy"],
  ["Redenominate", "Redenominate"],
];

type AxonCommandName = KeysOfUnion<AxonCommandRequest>;

export default function AxonCommandForm({
  setProposal,
}: {
  setProposal: (at: ProposalType) => void;
}) {
  const { data } = useInfo();
  const [commandName, setCommandName] = useState<AxonCommandName>(
    commands[0][0]
  );

  function setCommand(command: AxonCommandRequest) {
    if (!command) {
      setProposal(null);
    } else {
      setProposal({
        AxonCommand: [command, []],
      });
    }
  }

  const renderForm = () => {
    switch (commandName) {
      case "AddMembers":
        return <AddProposersForm makeCommand={setCommand} />;
      case "RemoveMembers":
        return <RemoveProposersForm makeCommand={setCommand} />;
      case "SetVisibility":
        return <VisibilityForm makeCommand={setCommand} />;
      case "SetPolicy":
        return <PolicyForm makeCommand={setCommand} />;
    }
  };

  if (!data) {
    return null;
  }

  const options =
    data && "Closed" in data.policy.proposers
      ? onlyClosedProposersCommands.concat(commands)
      : commands;

  return (
    <div className="flex flex-col gap-2 py-4">
      <div>
        <label>Command</label>
        <select
          className="w-full mt-1"
          onChange={(e) => setCommandName(e.target.value as AxonCommandName)}
          value={commandName}
        >
          {options.map(([value, label]) => (
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
