import { Principal } from "@dfinity/principal";
import React, { useState } from "react";
import { Command, Spawn } from "../../declarations/Axon/Axon.did";
import SpinnerButton from "../Buttons/SpinnerButton";

export function SpawnForm({
  propose,
  isLoading,
}: {
  propose: (proposal: Command) => void;
  isLoading: boolean;
}) {
  const [controller, setController] = useState("");
  const [error, setError] = useState("");
  function handleSubmit(e) {
    e.preventDefault();

    setError("");
    let new_controller = [];
    if (controller) {
      try {
        new_controller = [Principal.fromText(controller)];
      } catch (err) {
        setError("Invalid principal: " + err.message);
        return;
      }
    }

    propose({
      Spawn: {
        new_controller,
      } as Spawn,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 py-4">
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

        <div className="flex gap-2">
          <SpinnerButton
            isLoading={isLoading}
            className="px-2 py-1 text-center w-20 bg-gray-200 rounded hover:shadow-md transition-shadow transition-300"
          >
            Spawn
          </SpinnerButton>
        </div>
      </div>
    </form>
  );
}
