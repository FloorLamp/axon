import { Disclosure } from "@headlessui/react";
import classNames from "classnames";
import { DateTime } from "luxon";
import React from "react";
import { useIsMutating } from "react-query";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import { dateTimeFromNanos } from "../../lib/datetime";
import { useIsMember } from "../../lib/hooks/Axon/useIsMember";
import { useMyBallot } from "../../lib/hooks/Axon/useMyBallot";
import useAxonId from "../../lib/hooks/useAxonId";
import {
  hasExecutionError,
  proposalTypeToString,
} from "../../lib/proposalTypes";
import { getStatus } from "../../lib/status";
import AxonCommandSummary from "../Axon/AxonCommandSummary";
import PolicySummary from "../Axon/PolicySummary";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import NeuronCommandSummary from "../Commands/NeuronCommandSummary";
import ListButton from "../ExpandableList/ListButton";
import ListPanel from "../ExpandableList/ListPanel";
import StatusLabel from "../Labels/StatusLabel";
import { TimestampLabel } from "../Labels/TimestampLabel";
import AcceptRejectButtons from "./AcceptRejectButtons";
import StatusHistory from "./StatusHistory";
import VotesTable from "./VotesTable";
import VoteSummary from "./VoteSummary";

export const ProposalDetails = ({
  proposal,
  defaultOpen = false,
}: {
  proposal: AxonProposal;
  defaultOpen?: boolean;
}) => {
  const axonId = useAxonId();
  const isMember = useIsMember();

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
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <>
          <ListButton open={open}>
            <div className="flex">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 sm:flex-none sm:w-64 md:w-96 flex gap-2 leading-tight">
                  <span className="text-gray-500">
                    #{proposal.id.toString()}
                  </span>
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
                    <span
                      className="w-2 h-2 relative"
                      title="Needs your approval"
                    >
                      <span className="h-full w-full animate-ping absolute inline-flex rounded-full bg-indigo-300 opacity-75" />
                      <span className="absolute inline-flex rounded-full h-2 w-2 bg-indigo-400" />
                    </span>
                  </>
                )}
              </div>
            </div>
          </ListButton>
          <ListPanel>
            <div className="shadow-inner flex flex-col divide-y divide-gray-200 px-6 py-4">
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Proposal ID</div>
                <div>{proposal.id.toString()}</div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Status</div>
                <div className="xs:flex items-center gap-1">
                  <StatusLabel
                    status={status}
                    hasExecutionError={hasExecutionError(proposal.proposal)}
                  />
                  {!!actionTime && (
                    <>
                      {status === "Created" && "Starts "}
                      {status === "Active" && "Ends "}
                      <TimestampLabel dt={actionTime} />
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Creator</div>
                <div>
                  <IdentifierLabelWithButtons
                    type="Principal"
                    id={proposal.creator}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Policy</div>
                <div>
                  <PolicySummary policy={proposal.policy} />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Action</div>
                <div>
                  <ProposalSummary proposal={proposal} />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:gap-12 md:flex-row leading-tight divide-y divide-gray-200 md:divide-none">
                <div className="flex flex-col gap-2 md:flex-1 py-2">
                  <VoteSummary proposal={proposal} />
                  <VotesTable proposal={proposal} />
                </div>
                <div className="flex flex-col gap-2 md:flex-1 py-2">
                  <div className="font-bold">Progress</div>
                  <StatusHistory
                    proposal={proposal}
                    isEligibleToVote={isEligibleToVote}
                  />
                </div>
              </div>
            </div>
          </ListPanel>
        </>
      )}
    </Disclosure>
  );
};

const ProposalSummary = ({ proposal }: { proposal: AxonProposal }) => {
  if ("AxonCommand" in proposal.proposal) {
    return <AxonCommandSummary command={proposal.proposal.AxonCommand[0]} />;
  } else {
    return (
      <NeuronCommandSummary
        neuronCommand={proposal.proposal.NeuronCommand[0]}
      />
    );
  }
};
