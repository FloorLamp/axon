import React, { useState } from "react";
import { ProposalType } from "../../declarations/Axon/Axon.did";
import Modal from "../Layout/Modal";
import ProposalForm from "./ProposalForm";

export default function RepeatProposalButton({
  proposal,
  buttonClassName = "px-2 py-1 bg-transparent border-gray-800 border-2 transition-opacity opacity-50 hover:opacity-100",
}: {
  proposal: ProposalType;
  buttonClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={buttonClassName}
        title="Create a new copy of this proposal"
      >
        Repeat
      </button>
      <Modal
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        title="Repeat Proposal"
        className={
          "NeuronCommand" in proposal ? "w-full max-w-screen-md" : undefined
        }
      >
        {"AxonCommand" in proposal && (
          <ProposalForm
            proposalType="AxonCommand"
            defaultProposal={proposal}
            closeModal={closeModal}
          />
        )}
        {"NeuronCommand" in proposal && (
          <ProposalForm
            proposalType="NeuronCommand"
            closeModal={closeModal}
            defaultProposal={proposal}
            defaultNeuronIds={proposal.NeuronCommand[0].neuronIds[0]?.map(
              String
            )}
          />
        )}
      </Modal>
    </>
  );
}
