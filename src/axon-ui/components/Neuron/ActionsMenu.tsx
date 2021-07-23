import React, { useState } from "react";
import ActionForm from "../Action/ActionForm";
import NavButtons from "../Buttons/NavButtons";
import SettingsForm from "./SettingsForm";

const ACTIONS = ["Manage", "Settings"] as const;

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
      {action === "Settings" && <SettingsForm />}
    </div>
  );
}
