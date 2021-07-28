import React, { useState } from "react";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
import Modal from "../Layout/Modal";
import ActionsMenu from "./ActionsMenu";

export default function ManageNeuronModal() {
  const isOwner = useIsProposer();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  if (!isOwner) {
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
        title="Manage Neurons"
      >
        <ActionsMenu closeModal={closeModal} />
      </Modal>
    </>
  );
}
