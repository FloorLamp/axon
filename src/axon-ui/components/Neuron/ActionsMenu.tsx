import React, { useState } from "react";
import ActionForm from "../Action/ActionForm";
import NavButtons from "../Buttons/NavButtons";
import AddHotKeyForm from "./AddHotKeyForm";
import DelegateNeuronForm from "./DelegateNeuronForm";

const ACTIONS = ["Manage", "Add Hot Key", "Delegate Neuron"] as const;

export default function ActionsMenu({
  closeModal,
}: {
  closeModal: () => void;
}) {
  const [action, setAction] = useState<typeof ACTIONS[number]>(ACTIONS[0]);
  return (
    <div>
      <NavButtons values={ACTIONS} selected={action} onChange={setAction} />

      {action === "Manage" && (
        <ActionForm actionType="NeuronCommand" closeModal={closeModal} />
      )}
      {action === "Add Hot Key" && <AddHotKeyForm />}
      {action === "Delegate Neuron" && <DelegateNeuronForm />}
    </div>
  );
}
