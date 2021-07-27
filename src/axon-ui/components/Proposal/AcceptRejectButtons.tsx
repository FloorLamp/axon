import classNames from "classnames";
import React, { MouseEvent } from "react";
import { BsCheck, BsX } from "react-icons/bs";
import { useIsMutating } from "react-query";
import { useBalance } from "../../lib/hooks/Axon/useBalance";
import useVote from "../../lib/hooks/Axon/useVote";
import useAxonId from "../../lib/hooks/useAxonId";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";

export default function AcceptRejectButtons({
  id,
  size = "large",
}: {
  id: bigint;
  size?: "small" | "large";
}) {
  const axonId = useAxonId();
  const balance = useBalance();
  const { mutate, isError, error } = useVote(id);
  const handleVote = (e: MouseEvent, yesNo: boolean) => {
    e.stopPropagation();
    mutate({ yesNo });
  };
  const isLoading = !!useIsMutating({ mutationKey: ["vote", axonId, id] });

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
          title="Accept Proposal"
        >
          {size === "large" ? "Accept" : <BsCheck />}
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
          title="Reject Proposal"
        >
          {size === "large" ? "Reject" : <BsX />}
        </SpinnerButton>
      </div>
      {size === "large" && isError && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
