import React, { useState } from "react";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
import Modal from "../Layout/Modal";
import ProposalForm from "../Proposal/ProposalForm";

export default function ManageAxonModal() {
  const isProposer = useIsProposer();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  if (!isProposer) {
    return null;
  }

  return (
    <>
      <div>
        <button
          type="button"
          onClick={openModal}
          className="text-xs px-2 py-1 btn-secondary"
        >
          Manage
        </button>
      </div>
      <Modal
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        title="Manage Axon"
      >
        <ProposalForm proposalType="AxonCommand" closeModal={closeModal} />
      </Modal>
    </>
  );
}
