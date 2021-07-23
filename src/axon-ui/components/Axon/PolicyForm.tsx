import React, { useEffect, useState } from "react";
import { AxonCommandRequest } from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";

export function PolicyForm({
  makeCommand,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
}) {
  const { data } = useInfo();
  const [needed, setNeeded] = useState(data?.policy[0].needed.toString() ?? "");

  useEffect(() => {
    makeCommand({
      SetPolicy: {
        needed: BigInt(needed),
        total: [],
      },
    });
  }, [needed]);

  const maxSigners = data?.owners.length;
  const numSigners = Array.from({ length: maxSigners }).map((_, i) => i + 1);

  return (
    <>
      <div className="flex flex-col py-4 gap-2">
        <label className="block">
          <span>Approvers</span>
          <select
            name="approvers"
            className="w-full mt-1"
            onChange={(e) => setNeeded(e.target.value)}
          >
            {numSigners.map((i) => (
              <option key={i} value={i}>
                {i} out of {maxSigners}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}
