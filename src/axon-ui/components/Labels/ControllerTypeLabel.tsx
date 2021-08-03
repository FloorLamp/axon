import classNames from "classnames";
import React from "react";

export default function ControllerTypeLabel({
  type,
}: {
  type: "Hot Key" | "Controller";
}) {
  return (
    <label
      className={classNames("w-20 flex justify-center py-0.5 rounded text-xs", {
        "bg-yellow-200 text-yellow-700": type === "Hot Key",
        "bg-green-300 text-green-700": type === "Controller",
      })}
      data-balloon-pos="right"
      data-balloon-length="large"
      aria-label={
        type === "Hot Key"
          ? "Axon is Hot Key: Only Vote/Follow commands can be executed"
          : "Axon is Controller: All neuron commands can be executed"
      }
    >
      {type.toUpperCase()}
    </label>
  );
}
