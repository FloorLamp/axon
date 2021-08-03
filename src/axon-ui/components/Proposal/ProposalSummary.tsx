import classNames from "classnames";
import React from "react";
import { useIsMutating } from "react-query";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import { getActionTime, getStatus } from "../../lib/axonProposal";
import { useMyBallot } from "../../lib/hooks/Axon/useMyBallot";
import useAxonId from "../../lib/hooks/useAxonId";
import {
  hasExecutionError,
  proposalTypeToString,
} from "../../lib/proposalTypes";
import StatusLabel from "../Labels/StatusLabel";
import AcceptRejectButtons from "./AcceptRejectButtons";

export const ProposalSummary = ({ proposal }: { proposal: AxonProposal }) => {
  const axonId = useAxonId();

  const myBallot = useMyBallot(proposal);
  const status = getStatus(proposal);
  const actionTime = proposal ? getActionTime(proposal) : null;

  const isEligibleToVote =
    (status === "Active" ||
      (status === "Created" && actionTime?.diffNow().toMillis() < 0)) &&
    myBallot &&
    !myBallot.vote[0];
  const isMutating = !!useIsMutating({
    mutationKey: ["vote", axonId, proposal.id],
  });

  return (
    <div className="flex">
      <div className="flex flex-1 flex-col sm:flex-row">
        <div className="flex-2 flex gap-2 leading-tight">
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
      <div className="flex items-center justify-end pr-2">
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
            <span
              className="w-2 h-2 relative"
              data-balloon-pos="left"
              data-balloon-length="medium"
              aria-label="Needs your vote"
            >
              <span className="h-full w-full animate-ping absolute inline-flex rounded-full bg-indigo-300 opacity-75" />
              <span className="absolute inline-flex rounded-full h-2 w-2 bg-indigo-400" />
            </span>
          </>
        )}
      </div>
    </div>
  );
};
