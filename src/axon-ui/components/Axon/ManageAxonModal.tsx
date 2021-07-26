import React, { useState } from "react";
import { useIsOwner } from "../../lib/hooks/Axon/useIsOwner";
import Modal from "../Layout/Modal";
import ProposalForm from "../Proposal/ProposalForm";

export default function ManageAxonModal() {
  const isOwner = useIsOwner();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  if (!isOwner) {
    return null;
  }

  return (
    <>
      <div className="flex gap-1">
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
