import { Disclosure } from "@headlessui/react";
import classNames from "classnames";
import { DateTime } from "luxon";
import React from "react";
import { useIsMutating } from "react-query";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import { useIsOwner } from "../../lib/hooks/Axon/useIsOwner";
import { proposalTypeToString } from "../../lib/proposalTypes";
import { StatusKey } from "../../lib/types";
import AxonCommandSummary from "../Axon/AxonCommandSummary";
import PolicySummary from "../Axon/PolicySummary";
import NeuronCommandSummary from "../Commands/NeuronCommandSummary";
import ListButton from "../ExpandableList/ListButton";
import ListPanel from "../ExpandableList/ListPanel";
import StatusLabel from "../Labels/StatusLabel";
import { TimestampLabel } from "../Labels/TimestampLabel";
import { useGlobalContext } from "../Store/Store";
import ApproveRejectButtons from "./ApproveRejectButtons";
import Steps from "./Steps";

export const ProposalDetails = ({
  proposal,
  defaultOpen = false,
}: {
  proposal: AxonProposal;
  defaultOpen?: boolean;
}) => {
  const {
    state: { principal },
  } = useGlobalContext();
  const isOwner = useIsOwner();

  // const request = 'NeuronCommand' in action ? action.NeuronCommand : action.AxonCommand
  const status = Object.keys(proposal.status)[0] as StatusKey;

  const myVote = proposal.ballots.find(
    (ballot) => principal && ballot.principal.toHex() === principal.toHex()
  );
  const isEligibleToVote =
    isOwner && status === "Pending" && myVote && !myVote.vote[0];
  const isMutating = !!useIsMutating({ mutationKey: ["vote", proposal.id] });

  let actionTime: DateTime;
  if (
    status === "Executed" ||
    status === "Rejected" ||
    status === "Accepted" ||
    status === "Expired"
  ) {
    const ts = Object.values(proposal.status)[0];
    actionTime = DateTime.fromSeconds(Number(ts / BigInt(1e9)));
  }

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
                  <StatusLabel status={status} />
                  {actionTime && (
                    <span className="text-gray-500 text-xs">
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
                        "hidden group-hover:block": !isMutating,
                      })}
                    >
                      <ApproveRejectButtons id={proposal.id} size="small" />
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
                  <StatusLabel status={status} />
                  {!!actionTime && <TimestampLabel dt={actionTime} />}
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Started</div>
                <div>
                  <TimestampLabel
                    dt={DateTime.fromSeconds(
                      Number(proposal.timeStart / BigInt(1e9))
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">End</div>
                <div>
                  <TimestampLabel
                    dt={DateTime.fromSeconds(
                      Number(proposal.timeEnd / BigInt(1e9))
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Action</div>
                <div>
                  <ProposalSummary proposal={proposal} />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Policy</div>
                <div>
                  <PolicySummary policy={proposal.policy} />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Progress</div>
                <div className="flex-1">
                  <Steps
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
