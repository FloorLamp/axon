import React, { useState } from "react";
import { Command } from "../../declarations/Axon/Axon.did";
import { CommandKey } from "../../lib/types";
import { ConfigureForm } from "./ConfigureForm";
import { DisburseForm } from "./DisburseForm";
import { DisburseToNeuronForm } from "./DisburseToNeuronForm";
import FollowForm from "./FollowForm";
import MakeProposalForm from "./MakeProposalForm";
import { RegisterVoteForm } from "./RegisterVoteForm";
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
  defaultCommand,
  neuronIds,
}: {
  setCommand: (cmd: Command | null) => void;
  defaultCommand?: Command;
  neuronIds: string[];
}) {
  const [commandKey, setCommandKey] = useState<CommandKey>(
    defaultCommand
      ? (Object.keys(defaultCommand)[0] as CommandKey)
      : commands[0][0]
  );

  const renderForm = () => {
    switch (commandKey) {
      case "Follow":
        return (
          <FollowForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "Follow" in defaultCommand
                ? defaultCommand.Follow
                : undefined
            }
          />
        );
      case "Configure":
        return (
          <ConfigureForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "Configure" in defaultCommand
                ? defaultCommand.Configure
                : undefined
            }
            neuronIds={neuronIds}
          />
        );
      case "Spawn":
        return (
          <SpawnForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "Spawn" in defaultCommand
                ? defaultCommand.Spawn
                : undefined
            }
          />
        );
      case "Split":
        return (
          <SplitForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "Split" in defaultCommand
                ? defaultCommand.Split
                : undefined
            }
          />
        );
      case "Disburse":
        return (
          <DisburseForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "Disburse" in defaultCommand
                ? defaultCommand.Disburse
                : undefined
            }
          />
        );
      case "DisburseToNeuron":
        return (
          <DisburseToNeuronForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "DisburseToNeuron" in defaultCommand
                ? defaultCommand.DisburseToNeuron
                : undefined
            }
          />
        );
      case "MakeProposal":
        return (
          <MakeProposalForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "MakeProposal" in defaultCommand
                ? defaultCommand.MakeProposal
                : undefined
            }
          />
        );
      case "RegisterVote":
        return (
          <RegisterVoteForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "RegisterVote" in defaultCommand
                ? defaultCommand.RegisterVote
                : undefined
            }
          />
        );
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
