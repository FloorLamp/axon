import { Disclosure, Transition } from "@headlessui/react";
import classNames from "classnames";
import { DateTime } from "luxon";
import React from "react";
import { FiChevronRight } from "react-icons/fi";
import { NeuronCommandProposal } from "../../declarations/Axon/Axon.did";
import { StatusKey } from "../../lib/types";
import { neuronCommandToString } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import NeuronCommandDescription from "../Commands/NeuronCommandDescription";
import { TimestampLabel } from "../Labels/TimestampLabel";
import { useGlobalContext } from "../Store";
import AcceptRejectButtons from "./AcceptRejectButtons";
import Ballots from "./Ballots";
import ExecuteButton from "./ExecuteButton";
import Results from "./Results";

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
          <Disclosure.Button
            as="div"
            className="group flex items-center cursor-pointer p-2 bg-gray-100 hover:bg-gray-200 transition-colors duration-75"
          >
            <div className="hidden sm:block w-28">
              Proposal {proposal.id.toString()}
            </div>
            <div className="sm:pl-2 flex-1">
              {neuronCommandToString(proposal.proposal)}
            </div>
            <div className="pl-2 flex-1">
              {status}
              {status !== "Active" && ` ${actionTime.toRelative()}`}
            </div>
            <div>
              <FiChevronRight
                className={classNames(
                  "transform transition-transform transition-100",
                  {
                    "group-hover:translate-x-1": !open,
                    "rotate-90": open,
                  }
                )}
              />
            </div>
          </Disclosure.Button>
          <Transition
            enter="transition duration-50 ease-in"
            enterFrom="transform -translate-y-1 opacity-0"
            enterTo="transform translate-y-0 opacity-100"
            leave="transition duration-50 ease-out"
            leaveFrom="transform translate-y-0 opacity-100"
            leaveTo="transform -translate-y-1 opacity-0"
          >
            <Disclosure.Panel className="flex flex-col gap-2 pt-2 pb-4">
              <div className="flex flex-col md:flex-row leading-tight">
                <div className="w-32 font-bold">Proposal ID</div>
                <div>{proposal.id.toString()}</div>
              </div>
              <div className="flex flex-col md:flex-row leading-tight">
                <div className="w-32 font-bold">Status</div>
                <div>
                  {status}
                  {!!actionTime && (
                    <>
                      {" "}
                      <TimestampLabel dt={actionTime} />
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row leading-tight">
                <div className="w-32 font-bold">Creator</div>
                <div>
                  <IdentifierLabelWithButtons
                    type="Principal"
                    id={proposal.creator}
                  >
                    {proposal.creator.toText()}
                  </IdentifierLabelWithButtons>
                </div>
              </div>
              <div className="flex flex-col md:flex-row leading-tight">
                <div className="w-32 font-bold">Started</div>
                <div>
                  <TimestampLabel
                    dt={DateTime.fromSeconds(
                      Number(proposal.timeStart / BigInt(1e9))
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row leading-tight">
                <div className="w-32 font-bold">End</div>
                <div>
                  <TimestampLabel
                    dt={DateTime.fromSeconds(
                      Number(proposal.timeEnd / BigInt(1e9))
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row leading-tight">
                <div className="w-32 font-bold">Action</div>
                <div>
                  <NeuronCommandDescription neuronCommand={proposal.proposal} />
                </div>
              </div>
              <div className="flex flex-col md:flex-row leading-tight">
                <div className="w-32 font-bold">Policy</div>
                <div>
                  {proposal && proposal.policy[0] ? (
                    <span>
                      <strong>{proposal.policy[0].needed.toString()}</strong>{" "}
                      out of{" "}
                      <strong>{proposal.policy[0].total.toString()}</strong>
                    </span>
                  ) : (
                    <span>
                      <strong>No policy set</strong>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row leading-tight">
                <div className="w-32 font-bold">Votes</div>
                <div>
                  <Ballots ballots={ballots} />
                </div>
              </div>
              {"Executed" in proposal.status && (
                <div className="flex flex-col md:flex-row leading-tight">
                  <div className="w-32 font-bold">Results</div>
                  <div>
                    <Results results={proposal.status.Executed} />
                  </div>
                </div>
              )}
              {isAuthed && (
                <>
                  {!hasVoted && (
                    <div className="flex flex-col md:flex-row leading-tight py-4">
                      <div className="w-32" />
                      <div>
                        <AcceptRejectButtons proposalId={proposal.id} />
                      </div>
                    </div>
                  )}
                  {"Accepted" in proposal.status && (
                    <div className="flex flex-col md:flex-row leading-tight py-4">
                      <div className="w-32" />
                      <div>
                        <ExecuteButton proposalId={proposal.id} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};
