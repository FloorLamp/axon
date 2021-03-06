import React, { useState } from "react";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import CodeBlockWithCopy from "../Inputs/CodeBlockWithCopy";
import Modal from "../Layout/Modal";
import SyncForm from "./SyncForm";

export default function RemoveHotkeyModal({ neuronId }: { neuronId: string }) {
  const { data } = useAxonById();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const dfxCommand = `dfx canister --network=ic --no-wallet call rrkah-fqaaa-aaaaa-aaaaq-cai manage_neuron "(record {id=opt (record {id=${
    neuronId || "$NEURON_ID"
  }:nat64}); command=opt (variant {Configure=(record {operation=opt (variant {RemoveHotKey=record {hot_key_to_remove=opt principal \\"${
    data?.proxy
  }\\"}})})})})"`;

  return (
    <>
      <button type="button" onClick={openModal} className="p-2 btn-secondary">
        Remove Hot Key
      </button>
      <Modal
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        title="Remove Hot Key"
      >
        <div className="flex flex-col divide-gray-300 divide-y">
          <div className="flex flex-col gap-2 py-4">
            <p className="leading-tight">
              The following{" "}
              <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                dfx
              </code>{" "}
              command will remove the Axon canister as a hot key for this
              neuron:
            </p>

            <CodeBlockWithCopy value={dfxCommand} />

            <p className="leading-tight">
              Then, click the button to sync Axon with the new neuron.
            </p>
          </div>

          <SyncForm />
        </div>
      </Modal>
    </>
  );
}
