import React, { useState } from "react";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
import { pluralize } from "../../lib/utils";
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
        <button type="button" onClick={openModal} className={buttonClassName}>
          {buttonText}
        </button>
      </div>
      <Modal
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        title={`Manage ${pluralize("Neuron", defaultNeuronIds?.length)}`}
      >
        <NeuronActionsMenu
          closeModal={closeModal}
          defaultNeuronIds={defaultNeuronIds}
        />
      </Modal>
    </>
  );
}
