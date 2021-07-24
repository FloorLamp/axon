import classNames from "classnames";
import React from "react";
import { Visibility } from "../../declarations/Axon/Axon.did";

export function VisibilityLabel({ visibility }: { visibility: Visibility }) {
  return (
    <label
      className={classNames("px-2 py-0.5 rounded uppercase text-xs", {
        "bg-purple-300 text-purple-700": "Private" in visibility,
        "bg-green-300 text-green-700": "Public" in visibility,
      })}
      title={
        "Private" in visibility
          ? "Only owners can view neuron data"
          : "Neuron data can be viewed by anyone"
      }
    >
      {"Private" in visibility ? "Private" : "Public"}
    </label>
  );
}
