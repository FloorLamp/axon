import React, { useState } from "react";
import NeuronCommandForm from "./Commands/CommandForm";
import Modal from "./Modal";
import { useGlobalContext } from "./Store";

export default function ManageNeuronModal() {
  const {
    state: { isAuthed },
  } = useGlobalContext();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  if (!isAuthed) {
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
        title="Manage Neurons"
      >
        <NeuronCommandForm />
      </Modal>
    </>
  );
}
