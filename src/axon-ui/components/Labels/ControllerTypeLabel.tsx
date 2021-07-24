import classNames from "classnames";
import React from "react";

export default function ControllerTypeLabel({
  type,
}: {
  type: "Hot Key" | "Controller";
}) {
  return (
    <label
      className={classNames(
        "block w-20 text-center py-0.5 rounded uppercase text-xs",
        {
          "bg-yellow-200 text-yellow-700": type === "Hot Key",
          "bg-green-300 text-green-700": type === "Controller",
        }
      )}
      title={
        type === "Hot Key"
          ? "Only Vote/Follow commands can be executed"
          : "All neuron commands can be executed"
      }
    >
      {type}
    </label>
  );
}
