import { Disclosure } from "@headlessui/react";
import { DateTime } from "luxon";
import React from "react";
import { NeuronCommandProposal } from "../../declarations/Axon/Axon.did";
import { neuronCommandToString } from "../../lib/neuronCommandToString";
import { StatusKey } from "../../lib/types";
import NeuronCommandDescription from "../Commands/NeuronCommandDescription";
import ListButton from "../ExpandableList/ListButton";
import ListPanel from "../ExpandableList/ListPanel";
import StatusLabel from "../Labels/StatusLabel";
import { TimestampLabel } from "../Labels/TimestampLabel";
import { useGlobalContext } from "../Store";
import Steps from "./Steps";

export const Proposal = ({
  proposal,
  initialVisible = false,
}: {
  proposal: NeuronCommandProposal;
  initialVisible?: boolean;
}) => {
  const {
    state: { principal, isAuthed },
  } = useGlobalContext();

  const ballots = proposal.ballots.filter(({ vote }) => !!vote[0]);
  const hasVoted = ballots.find(
    (ballot) => principal && ballot.principal.toHex() === principal.toHex()
  );

  const status = Object.keys(proposal.status)[0] as StatusKey;
  let actionTime: DateTime;
  if (
    status === "Executed" ||
    status === "Rejected" ||
    status === "Accepted" ||
    status === "Expired"
  ) {
    const ts =
      "Executed" in proposal.status
        ? proposal.status.Executed.time
        : Object.values(proposal.status)[0];
    actionTime = DateTime.fromSeconds(Number(ts / BigInt(1e9)));
  }

  return (
    <Disclosure defaultOpen={initialVisible}>
      {({ open }) => (
        <>
          <ListButton open={open}>
            <div className="flex">
              <div className="hidden sm:block w-10 text-gray-500">
                #{proposal.id.toString()}
              </div>
              <div className="flex-1 flex flex-col xs:flex-row">
                <div className="sm:pl-2 flex-1">
                  {neuronCommandToString(proposal.proposal)}
                </div>
                <div className="xs:pl-2 flex-1 flex flex-row items-center gap-2">
                  <StatusLabel status={status} />
                  {status !== "Active" && actionTime.toRelative()}
                </div>
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
                <div className="flex items-center gap-1">
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
                  <NeuronCommandDescription neuronCommand={proposal.proposal} />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Policy</div>
                <div>
                  {proposal.policy[0] ? (
                    <span>
                      <strong>{proposal.policy[0].needed.toString()}</strong>
                      {" out of "}
                      <strong>{proposal.policy[0].total.toString()}</strong>
                    </span>
                  ) : (
                    <span>
                      <strong>No policy set</strong>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row leading-tight py-2">
                <div className="w-32 font-bold">Progress</div>
                <div className="flex-1">
                  <Steps proposal={proposal} />
                </div>
              </div>
            </div>
          </ListPanel>
        </>
      )}
    </Disclosure>
  );
};
