import React, { useState } from "react";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
import Modal from "../Layout/Modal";
import ActionsMenu from "./ActionsMenu";

export default function ManageNeuronModal({
  defaultNeuronIds = [],
  buttonClassName = "text-xs px-2 py-1 btn-secondary",
}: {
  defaultNeuronIds?: string[];
  buttonClassName?: string;
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
          Manage
        </button>
      </div>
      <Modal
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        title="Manage Neurons"
      >
        <ActionsMenu
          closeModal={closeModal}
          defaultNeuronIds={defaultNeuronIds}
        />
      </Modal>
    </>
  );
}
