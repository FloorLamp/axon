import React, { useState } from "react";
import NavButtons from "../Buttons/NavButtons";
import NeuronCommandForm from "../Commands/CommandForm";
import SettingsForm from "./SettingsForm";

const ACTIONS = ["Manage", "Settings"] as const;

export default function ActionsMenu() {
  const [action, setAction] = useState<typeof ACTIONS[number]>(ACTIONS[0]);
  return (
    <div>
      <NavButtons values={ACTIONS} selected={action} onChange={setAction} />

      {action === "Manage" && <NeuronCommandForm />}
      {action === "Settings" && <SettingsForm />}
    </div>
  );
}
