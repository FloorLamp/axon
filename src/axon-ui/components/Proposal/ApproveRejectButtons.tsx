import classNames from "classnames";
import React, { MouseEvent } from "react";
import { BsCheck, BsX } from "react-icons/bs";
import { useIsMutating } from "react-query";
import useVote from "../../lib/hooks/Axon/useVote";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";

export default function ApproveRejectButtons({
  id,
  size = "large",
}: {
  id: bigint;
  size?: "small" | "large";
}) {
  const { mutate, isError, error } = useVote(id);
  const handleVote = (e: MouseEvent, yesNo: boolean) => {
    e.stopPropagation();
    mutate({ yesNo });
  };
  const isLoading = !!useIsMutating({ mutationKey: ["vote", id] });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <SpinnerButton
          className={classNames({
            "w-20 p-2": size === "large",
            "p-1": size === "small",
          })}
          activeClassName="text-white bg-green-500 hover:bg-green-400 transition-colors"
          disabledClassName="text-white bg-green-300"
          isLoading={isLoading}
          onClick={(e) => handleVote(e, true)}
          title="Approve"
        >
          {size === "large" ? "Approve" : <BsCheck />}
        </SpinnerButton>
        <SpinnerButton
          className={classNames({
            "w-20 p-2": size === "large",
            "p-1": size === "small",
          })}
          activeClassName="text-white bg-red-500 hover:bg-red-400 transition-colors"
          disabledClassName="text-white bg-red-300"
          isLoading={isLoading}
          onClick={(e) => handleVote(e, false)}
          title="Reject"
        >
          {size === "large" ? "Reject" : <BsX />}
        </SpinnerButton>
      </div>
      {size === "large" && isError && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
