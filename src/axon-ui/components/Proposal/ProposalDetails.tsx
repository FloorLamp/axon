import { DateTime } from "luxon";
import React from "react";
import { ProposalType } from "../../declarations/Axon/Axon.did";
import { dateTimeFromNanos } from "../../lib/datetime";
import { useMyBallot } from "../../lib/hooks/Axon/useMyBallot";
import {
  useActiveProposals,
  useAllProposals,
} from "../../lib/hooks/Axon/useProposals";
import useAxonId from "../../lib/hooks/useAxonId";
import {
  hasExecutionError,
  proposalTypeToString,
} from "../../lib/proposalTypes";
import { getStatus } from "../../lib/status";
import AxonCommandSummary from "../Axon/AxonCommandSummary";
import PolicySummary from "../Axon/PolicySummary";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import NeuronCommandSummary from "../Commands/NeuronCommandSummary";
import Panel from "../Containers/Panel";
import StatusLabel from "../Labels/StatusLabel";
import { TimestampLabel } from "../Labels/TimestampLabel";
import AcceptRejectButtons from "./AcceptRejectButtons";
import StatusHistory from "./StatusHistory";
import VotesTable from "./VotesTable";
import VoteSummary from "./VoteSummary";

export const ProposalDetails = ({ proposalId }: { proposalId: string }) => {
  const axonId = useAxonId();
  const activeProposalsQuery = useActiveProposals();
  const allProposalsQuery = useAllProposals();
  const proposal =
    activeProposalsQuery.data?.find((p) => p.id.toString() === proposalId) ??
    allProposalsQuery.data?.find((p) => p.id.toString() === proposalId);

  const myBallot = useMyBallot(proposal);
  const currentStatus = proposal?.status.slice(-1)[0];
  const status = proposal ? getStatus(proposal) : null;

  if (activeProposalsQuery.data && allProposalsQuery.data && !proposal) {
    return (
      <Panel className="py-16 text-center text-gray-500 text-sm">
        Proposal {proposalId} not found
      </Panel>
    );
  }

  const handleRefresh = () => {
    activeProposalsQuery.refetch();
    allProposalsQuery.refetch();
  };

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
    actionTime = dateTimeFromNanos(proposal?.timeStart);
  } else if (status === "Active") {
    actionTime = dateTimeFromNanos(proposal?.timeEnd);
  }

  const isEligibleToVote =
    (status === "Active" ||
      (status === "Created" && actionTime.diffNow().toMillis() < 0)) &&
    myBallot &&
    !myBallot.vote[0];

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
            <div className="inline-flex items-center gap-2">
              <h2 className="text-xl font-bold">
                {proposal && proposalTypeToString(proposal.proposal)}
              </h2>
              <RefreshButton
                isFetching={
                  activeProposalsQuery.isFetching ||
                  allProposalsQuery.isFetching
                }
                onClick={handleRefresh}
                title="Refresh"
              />
            </div>
            {isEligibleToVote && <AcceptRejectButtons proposal={proposal} />}
          </div>
          <div className="xs:flex items-center gap-4">
            {proposal && (
              <StatusLabel
                status={status}
                hasExecutionError={hasExecutionError(proposal.proposal)}
              />
            )}
            {!!actionTime && (
              <>
                {status === "Created" && "Starts "}
                {status === "Active" && "Ends "}
                <TimestampLabel dt={actionTime} />
              </>
            )}
          </div>
          <div className="flex flex-col xs:flex-row xs:gap-4">
            <span className="text-gray-400 whitespace-nowrap">
              ID {proposalId}
            </span>
            <span>
              Created by{" "}
              {proposal && (
                <IdentifierLabelWithButtons
                  type="Principal"
                  id={proposal.creator}
                />
              )}
            </span>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl">Policy</h2>
          {proposal && <PolicySummary policy={proposal.policy} />}
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl">Action</h2>
          {proposal && <ProposalTypeSummary proposal={proposal.proposal} />}
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-2 md:gap-12 md:flex-row leading-tight divide-y divide-gray-200 md:divide-none">
          <div className="flex flex-col gap-2 md:flex-1 pb-4">
            <h2 className="text-xl">Votes</h2>
            {proposal && <VoteSummary proposal={proposal} />}
            {proposal && <VotesTable proposal={proposal} />}
          </div>
          <div className="flex flex-col gap-2 md:flex-1 pt-4 md:pt-0">
            <h2 className="text-xl">History</h2>
            {proposal && <StatusHistory proposal={proposal} />}
          </div>
        </div>
      </Panel>
    </div>
  );
};

const ProposalTypeSummary = ({ proposal }: { proposal: ProposalType }) => {
  if ("AxonCommand" in proposal) {
    return <AxonCommandSummary command={proposal.AxonCommand[0]} />;
  } else {
    return <NeuronCommandSummary neuronCommand={proposal.NeuronCommand[0]} />;
  }
};
