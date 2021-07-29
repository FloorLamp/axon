import classNames from "classnames";
import { DateTime } from "luxon";
import React from "react";
import { useIsMutating } from "react-query";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import { dateTimeFromNanos } from "../../lib/datetime";
import { useMyBallot } from "../../lib/hooks/Axon/useMyBallot";
import useAxonId from "../../lib/hooks/useAxonId";
import {
  hasExecutionError,
  proposalTypeToString,
} from "../../lib/proposalTypes";
import { getStatus } from "../../lib/status";
import StatusLabel from "../Labels/StatusLabel";
import AcceptRejectButtons from "./AcceptRejectButtons";

export const ProposalSummary = ({ proposal }: { proposal: AxonProposal }) => {
  const axonId = useAxonId();

  const myBallot = useMyBallot(proposal);
  const currentStatus = proposal.status.slice(-1)[0];
  const status = getStatus(proposal);

  let actionTime: DateTime;
  if (
    status === "Executed" ||
    status === "Rejected" ||
    status === "Accepted" ||
    status === "Expired"
  ) {
    const ts = Object.values(currentStatus)[0];
    actionTime = dateTimeFromNanos(ts);
  } else if (status === "Created") {
    actionTime = dateTimeFromNanos(proposal.timeStart);
  } else if (status === "Active") {
    actionTime = dateTimeFromNanos(proposal.timeEnd);
  }

  const isEligibleToVote =
    (status === "Active" ||
      (status === "Created" && actionTime.diffNow().toMillis() < 0)) &&
    myBallot &&
    !myBallot.vote[0];
  const isMutating = !!useIsMutating({
    mutationKey: ["vote", axonId, proposal.id],
  });

  return (
    <div className="flex">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 sm:flex-none sm:w-64 md:w-96 flex gap-2 leading-tight">
          <span className="text-gray-500">#{proposal.id.toString()}</span>
          <span>{proposalTypeToString(proposal.proposal)}</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <StatusLabel
            status={status}
            hasExecutionError={hasExecutionError(proposal.proposal)}
          />
          {actionTime && (
            <span className="text-gray-500 text-xs">
              {status === "Created" && "Starts "}
              {status === "Active" && "Ends "}
              {actionTime.toRelative()}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-end pr-2">
        {isEligibleToVote && (
          <>
            <div
              className={classNames("pr-4", {
                "invisible pointer-events-none group-hover:visible group-hover:pointer-events-auto":
                  !isMutating,
              })}
            >
              <AcceptRejectButtons proposal={proposal} size="small" />
            </div>
            <span className="w-2 h-2 relative" title="Needs your approval">
              <span className="h-full w-full animate-ping absolute inline-flex rounded-full bg-indigo-300 opacity-75" />
              <span className="absolute inline-flex rounded-full h-2 w-2 bg-indigo-400" />
            </span>
          </>
        )}
      </div>
    </div>
  );
};
