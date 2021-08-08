import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import { Command, Spawn } from "../../declarations/Axon/Axon.did";
import useDebounce from "../../lib/hooks/useDebounce";
import ErrorAlert from "../Labels/ErrorAlert";

export function SpawnForm({
  makeCommand,
  defaults,
}: {
  makeCommand: (cmd: Command | null) => void;
  defaults?: Spawn;
}) {
  const [controller, setController] = useState(
    defaults?.new_controller[0] ? defaults.new_controller[0].toText() : ""
  );
  const [error, setError] = useState("");
  const debouncedController = useDebounce(controller);

  useEffect(() => {
    setError("");
    let new_controller = [];
    if (controller) {
      try {
        new_controller = [Principal.fromText(controller)];
      } catch (err) {
        setError("Invalid principal");
        return makeCommand(null);
      }
    }

    makeCommand({
      Spawn: {
        new_controller,
      } as Spawn,
    });
  }, [debouncedController]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block">
          <div className="flex justify-between">
            <span>New Controller</span>
            <span className="text-gray-400">Optional</span>
          </div>
          <input
            type="text"
            placeholder="New Controller"
            className="w-full mt-1"
            value={controller}
            onChange={(e) => setController(e.target.value)}
            maxLength={64}
          />
        </label>
      </div>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
