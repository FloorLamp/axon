import React from "react";
import { ProposalType } from "../../declarations/Axon/Axon.did";
import { getActionTime, getStatus } from "../../lib/axonProposal";
import { useMyBallot } from "../../lib/hooks/Axon/useMyBallot";
import {
  useActiveProposals,
  useAllProposals,
} from "../../lib/hooks/Axon/useProposals";
import {
  hasExecutionError,
  proposalTypeToString,
} from "../../lib/proposalTypes";
import { principalIsEqual } from "../../lib/utils";
import AxonCommandSummary from "../Axon/AxonCommandSummary";
import PolicySummary from "../Axon/PolicySummary";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import NeuronCommandSummary from "../Commands/NeuronCommandSummary";
import Panel from "../Containers/Panel";
import StatusLabel from "../Labels/StatusLabel";
import { TimestampLabel } from "../Labels/TimestampLabel";
import { useGlobalContext } from "../Store/Store";
import AcceptRejectButtons from "./AcceptRejectButtons";
import CancelButton from "./CancelButton";
import StatusHistory from "./StatusHistory";
import VotesTable from "./VotesTable";
import VoteSummary from "./VoteSummary";

export const ProposalDetails = ({ proposalId }: { proposalId: string }) => {
  const {
    state: { principal },
  } = useGlobalContext();
  const activeProposalsQuery = useActiveProposals();
  const allProposalsQuery = useAllProposals();
  const proposal =
    activeProposalsQuery.data?.find((p) => p.id.toString() === proposalId) ??
    allProposalsQuery.data?.find((p) => p.id.toString() === proposalId);

  const myBallot = useMyBallot(proposal);
  const status = proposal ? getStatus(proposal) : null;
  const actionTime = proposal ? getActionTime(proposal) : null;

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

  const isEligibleToVote =
    (status === "Active" ||
      (status === "Created" && actionTime.diffNow().toMillis() < 0)) &&
    myBallot &&
    !myBallot.vote[0];

  const isCancellable =
    principalIsEqual(proposal?.creator, principal) &&
    (status === "Active" || status === "Created");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Panel className="p-4 flex-1">
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
              {isCancellable && <CancelButton proposal={proposal} />}
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

        <Panel className="p-4 flex-1">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl">Policy</h2>
            {proposal && <PolicySummary policy={proposal.policy} />}
          </div>
        </Panel>
      </div>

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
    return <AxonCommandSummary axonCommand={proposal.AxonCommand} />;
  } else {
    return <NeuronCommandSummary neuronCommand={proposal.NeuronCommand} />;
  }
};
