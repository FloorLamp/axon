import classNames from "classnames";
import React from "react";
import { ControllerType } from "../../lib/neurons";

export default function ControllerTypeLabel({
  type,
}: {
  type: ControllerType;
}) {
  return (
    <label
      className={classNames("w-20 flex justify-center py-0.5 rounded text-xs", {
        "bg-yellow-200 text-yellow-700": type === "Hot Key",
        "bg-green-300 text-green-700": type === "Controller",
        "bg-blue-300 text-blue-700": type === "Delegated",
      })}
      data-balloon-pos="right"
      data-balloon-length="large"
      aria-label={
        type === "Hot Key"
          ? "Axon is Hot Key: Only Vote/Follow/Propose commands can be executed"
          : type === "Delegated"
          ? "Neuron is Delegated: All neuron commands can be executed"
          : "Axon is Controller: All neuron commands can be executed"
      }
    >
      {type.toUpperCase()}
    </label>
  );
}
