import React, { useState } from "react";
import { useIsMember } from "../../lib/hooks/Axon/useIsMember";
import Modal from "../Layout/Modal";
import NeuronActionsMenu from "./NeuronActionsMenu";

export default function ManageNeuronModal({
  defaultNeuronIds = [],
  buttonClassName = "text-xs px-2 py-1 btn-secondary",
  buttonText = "Manage",
}: {
  defaultNeuronIds?: string[];
  buttonClassName?: string;
  buttonText?: string;
}) {
  const isMember = useIsMember();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  if (!isMember) {
    return null;
  }

  return (
    <>
      <div>
        <button type="button" onClick={openModal} className={buttonClassName}>
          {buttonText}
        </button>
      </div>
      <Modal
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        title="Manage Neurons"
        className="w-full max-w-screen-md"
      >
        <NeuronActionsMenu
          closeModal={closeModal}
          defaultNeuronIds={defaultNeuronIds}
        />
      </Modal>
    </>
  );
}
