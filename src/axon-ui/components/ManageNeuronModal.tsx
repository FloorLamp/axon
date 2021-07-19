import React, { useState } from "react";
import { ConfigureForm } from "./Commands/ConfigureForm";
import { DisburseForm } from "./Commands/DisburseForm";
import { DisburseToNeuronForm } from "./Commands/DisburseToNeuronForm";
import { SpawnForm } from "./Commands/SpawnForm";
import { SplitForm } from "./Commands/SplitForm";
import Modal from "./Modal";
import { useGlobalContext } from "./Store";

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

export default function ManageNeuronModal() {
  const {
    state: { isAuthed },
  } = useGlobalContext();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [command, setCommand] = useState<CommandName>(commands[0]);

  const renderForm = () => {
    switch (command) {
      case "Configure":
        return <ConfigureForm />;
      case "Spawn":
        return <SpawnForm />;
      case "Split":
        return <SplitForm />;
      case "Disburse":
        return <DisburseForm />;
      case "Disburse To Neuron":
        return <DisburseToNeuronForm />;
      default:
        return "TODO";
    }
  };

  if (!isAuthed) {
    return null;
  }

  return (
    <>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={openModal}
          className="text-xs px-2 py-1 bg-gray-200 rounded hover:shadow-md transition-shadow transition-300"
        >
          Manage
        </button>
      </div>
      <Modal
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        title="Manage Neurons"
      >
        <div className="pt-4">
          <label>Command</label>
          <select
            className="block w-full px-2 py-1 rounded border border-gray-300 cursor-pointer"
            onChange={(e) => setCommand(e.target.value as CommandName)}
          >
            {commands.map((command) => (
              <option key={command} value={command}>
                {command}
              </option>
            ))}
          </select>
          {renderForm()}
        </div>
      </Modal>
    </>
  );
}
