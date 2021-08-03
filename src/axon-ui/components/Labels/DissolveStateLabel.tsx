import classNames from "classnames";
import React from "react";
import { DissolveState } from "../../declarations/Axon/Axon.did";
import { parseDissolveState } from "../../lib/neurons";

export function DissolveStateLabel({
  dissolveState,
}: {
  dissolveState: DissolveState;
}) {
  let { state, dissolveDelay } = parseDissolveState(dissolveState);

  return (
    <span className="inline-flex gap-2 items-center">
      <label
        className={classNames(
          "block w-20 text-center py-0.5 rounded text-xs uppercase",
          {
            "bg-green-300 text-green-700": state === "Locked",
            "bg-yellow-200 text-yellow-700": state === "Dissolving",
            "bg-gray-300 text-gray-700": state === "Dissolved",
          }
        )}
      >
        {state}
      </label>
      {dissolveDelay && (
        <span className="text-gray-500 text-xs">{dissolveDelay}</span>
      )}
    </span>
  );
}
