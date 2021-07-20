import { Principal } from "@dfinity/principal";
import React, { useState } from "react";
import { Command, Spawn } from "../../declarations/Axon/Axon.did";
import CommandForm from "./CommandForm";

export function SpawnForm() {
  const [controller, setController] = useState("");
  const [error, setError] = useState("");

  const makeCommand = (): Command | null => {
    setError("");
    let new_controller = [];
    if (controller) {
      try {
        new_controller = [Principal.fromText(controller)];
      } catch (err) {
        setError("Invalid principal: " + err.message);
        return null;
      }
    }

    return {
      Spawn: {
        new_controller,
      } as Spawn,
    };
  };

  return (
    <CommandForm makeCommand={makeCommand}>
      <div className="flex flex-col py-4 gap-2">
        <div>
          <label>New Controller</label>
          <input
            type="text"
            placeholder="New Controller"
            className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
            value={controller}
            onChange={(e) => setController(e.target.value)}
            maxLength={64}
          />
        </div>

        {error && <p>{error}</p>}
      </div>
    </CommandForm>
  );
}
