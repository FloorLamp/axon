import React, { useState } from "react";
import { Command, Neuron } from "../declarations/Axon/Axon.did";
import { AxonService } from "../lib/types";
import { DisburseForm } from "./Commands/DisburseForm";
import { SpawnForm } from "./Commands/SpawnForm";
import { SplitForm } from "./Commands/SplitForm";
import Modal from "./Modal";

const commands = [
  "Spawn",
  "Split",
  "Follow",
  "Configure",
  "RegisterVote",
  "DisburseToNeuron",
  "MakeProposal",
  "Disburse",
];

export default function ManageNeuronModal({
  axon,
  neurons,
}: {
  axon: AxonService;
  neurons: Neuron[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [command, setCommand] = useState(commands[0]);
  const [timeStart, setTimeStart] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  async function propose(proposal: Command) {
    setIsLoading(true);
    await axon.proposeCommand({
      timeStart,
      durationSeconds,
      proposal,
    });
    setIsLoading(false);
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
        <select
          className="mt-4 px-2 py-1 rounded border border-gray-300"
          onChange={(e) => setCommand(e.target.value)}
        >
          {commands.map((command) => (
            <option key={command} value={command}>
              {command}
            </option>
          ))}
        </select>
        {command === "Spawn" && (
          <SpawnForm propose={propose} isLoading={isLoading} />
        )}
        {command === "Split" && (
          <SplitForm propose={propose} isLoading={isLoading} />
        )}
        {command === "Disburse" && (
          <DisburseForm
            propose={propose}
            isLoading={isLoading}
            stake={
              neurons.length === 1
                ? neurons[0].cached_neuron_stake_e8s
                : undefined
            }
          />
        )}
      </Modal>
    </>
  );
}
