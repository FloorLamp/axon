import { Principal } from "@dfinity/principal";
import React, { useState } from "react";
import Modal from "../Layout/Modal";
import TopupForm from "./TopupForm";

export default function TopupNeuronModal({
  account,
  controller,
}: {
  account: string;
  controller: Principal;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button type="button" onClick={openModal} className="p-2 btn-secondary">
        Top Up
      </button>
      <Modal
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        title="Top Up Neurons"
      >
        <TopupForm
          closeModal={closeModal}
          account={account}
          controller={controller}
        />
      </Modal>
    </>
  );
}
