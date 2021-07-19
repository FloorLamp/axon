import classNames from "classnames";
import React from "react";
import { Vote } from "../../declarations/Axon/Axon.did";

export default function VoteLabel({ vote }: { vote: Vote }) {
  const isYes = "Yes" in vote;
  return (
    <span
      className={classNames(
        "w-20 text-center py-0.5 rounded text-xs uppercase",
        {
          "bg-green-300": isYes,
          "bg-red-300": !isYes,
        }
      )}
    >
      {isYes ? "Approved" : "Rejected"}
    </span>
  );
}
