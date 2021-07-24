import React, { useState } from "react";
import { ActionType, Command } from "../../declarations/Axon/Axon.did";
import { ConfigureForm } from "./ConfigureForm";
import { DisburseForm } from "./DisburseForm";
import { DisburseToNeuronForm } from "./DisburseToNeuronForm";
import FollowForm from "./FollowForm";
import NeuronSelectionForm from "./NeuronSelectionForm";
import { SpawnForm } from "./SpawnForm";
import { SplitForm } from "./SplitForm";

const commands = [
  "Spawn",
  "Split",
  "Follow",
  "Configure",
  "Register Vote",
  "Disburse To Neuron",
  "Make Proposal",
  "Disburse",
] as const;

type CommandName = typeof commands[number];

export default function NeuronCommandForm({
  setAction,
}: {
  setAction: (at: ActionType) => void;
}) {
  const [neuronIds, setNeuronIds] = useState([]);
  const [commandName, setCommandName] = useState<CommandName>(commands[0]);

  function setCommand(command: Command) {
    if (command) {
      setAction({
        NeuronCommand: [
          {
            command,
            neuronIds: neuronIds.length > 0 ? [neuronIds.map(BigInt)] : [],
          },
          [],
        ],
      });
    }
  }

  const renderForm = () => {
    switch (commandName) {
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
      case "Disburse To Neuron":
        return <DisburseToNeuronForm makeCommand={setCommand} />;
      default:
        return "TODO";
    }
  };

  return (
    <>
      <div className="py-4">
        <label>Command</label>
        <select
          className="w-full mt-1"
          onChange={(e) => setCommandName(e.target.value as CommandName)}
          value={commandName}
        >
          {commands.map((command) => (
            <option key={command} value={command}>
              {command}
            </option>
          ))}
        </select>
      </div>

      {renderForm()}

      <NeuronSelectionForm neuronIds={neuronIds} setNeuronIds={setNeuronIds} />
    </>
  );
}
