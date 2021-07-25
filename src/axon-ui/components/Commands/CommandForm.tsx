import React, { useState } from "react";
import { Command } from "../../declarations/Axon/Axon.did";
import { CommandKey } from "../../lib/types";
import { ConfigureForm } from "./ConfigureForm";
import { DisburseForm } from "./DisburseForm";
import { DisburseToNeuronForm } from "./DisburseToNeuronForm";
import FollowForm from "./FollowForm";
import MakeProposalForm from "./MakeProposalForm";
import { SpawnForm } from "./SpawnForm";
import { SplitForm } from "./SplitForm";

const commands: [CommandKey, string][] = [
  ["Spawn", "Spawn"],
  ["Split", "Split"],
  ["Follow", "Follow"],
  ["Configure", "Configure"],
  ["RegisterVote", "Register Vote"],
  ["DisburseToNeuron", "Disburse To Neuron"],
  ["MakeProposal", "Make Proposal"],
  ["Disburse", "Disburse"],
];

export default function CommandForm({
  setCommand,
}: {
  setCommand: (cmd: Command | null) => void;
}) {
  const [commandKey, setCommandKey] = useState<CommandKey>(commands[0][0]);

  const renderForm = () => {
    switch (commandKey) {
      case "Follow":
        return <FollowForm makeCommand={setCommand} />;
      case "Configure":
        return <ConfigureForm makeCommand={setCommand} />;
      case "Spawn":
        return <SpawnForm makeCommand={setCommand} />;
      case "Split":
        return <SplitForm makeCommand={setCommand} />;
      case "Disburse":
        return <DisburseForm makeCommand={setCommand} />;
      case "DisburseToNeuron":
        return <DisburseToNeuronForm makeCommand={setCommand} />;
      case "MakeProposal":
        return <MakeProposalForm makeCommand={setCommand} />;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label>Command</label>
        <select
          className="w-full mt-1"
          onChange={(e) => setCommandKey(e.target.value as CommandKey)}
          value={commandKey}
        >
          {commands.map(([value, label]) => (
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
