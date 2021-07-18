import { DateTime } from "luxon";
import React from "react";
import { DissolveState } from "../declarations/Axon/Axon.did";
import { TimestampLabel } from "./TimestampLabel";

export function DissolveStateLabel({ state }: { state: DissolveState }) {
  if ("DissolveDelaySeconds" in state) {
    if (state.DissolveDelaySeconds === BigInt(0)) {
      return <span>Dissolved</span>;
    }
    return <span>Locked ({state.DissolveDelaySeconds.toString()})</span>;
  }

  return (
    <span>
      Dissolving (
      <TimestampLabel
        dt={DateTime.fromSeconds(Number(state.WhenDissolvedTimestampSeconds))}
      />
      )
    </span>
  );
}
