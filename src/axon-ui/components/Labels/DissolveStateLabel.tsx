import classNames from "classnames";
import { DateTime, Duration } from "luxon";
import React from "react";
import { DissolveState } from "../../declarations/Axon/Axon.did";
import { formatDuration } from "../../lib/datetime";

export function DissolveStateLabel({ state }: { state: DissolveState }) {
  let label, info;
  if ("DissolveDelaySeconds" in state) {
    if (state.DissolveDelaySeconds === BigInt(0)) {
      label = "Dissolved";
    } else {
      const dur = Duration.fromObject({
        seconds: Number(state.DissolveDelaySeconds),
      }).shiftTo("years", "months", "days", "hours", "minutes");

      label = "Locked";
      info = formatDuration(dur);
    }
  } else {
    label = "Dissolving";
    info = DateTime.fromSeconds(
      Number(state.WhenDissolvedTimestampSeconds)
    ).toRelative();
  }

  return (
    <span className="inline-flex gap-2 items-center">
      <label
        className={classNames(
          "block w-20 text-center py-0.5 rounded text-xs uppercase",
          {
            "bg-green-300 text-green-700": label === "Locked",
            "bg-yellow-200 text-yellow-600": label === "Dissolving",
            "bg-gray-300 text-gray-700": label === "Dissolved",
          }
        )}
      >
        {label}
      </label>
      {info && <span className="text-gray-500 text-xs">{info}</span>}
    </span>
  );
}
