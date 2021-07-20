import { DateTime } from "luxon";
import React from "react";
import { NeuronCommandProposal } from "../../declarations/Axon/Axon.did";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import NeuronCommandDescription from "../Commands/NeuronCommandDescription";
import { TimestampLabel } from "../Labels/TimestampLabel";
import { useGlobalContext } from "../Store";
import AcceptRejectButtons from "./AcceptRejectButtons";
import Ballots from "./Ballots";
import ExecuteButton from "./ExecuteButton";
import Results from "./Results";

export const Proposal = ({ proposal }: { proposal: NeuronCommandProposal }) => {
  const {
    state: { principal, isAuthed },
  } = useGlobalContext();

  const ballots = proposal.ballots.filter(({ vote }) => !!vote[0]);
  const hasVoted = ballots.find(
    (ballot) => ballot.principal.toHex() === principal.toHex()
  );

  const actionTime =
    "Executed" in proposal.status
      ? proposal.status.Executed.time
      : "Rejected" in proposal.status ||
        "Accepted" in proposal.status ||
        "Expired" in proposal.status
      ? Object.values(proposal.status)[0]
      : null;

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Proposal ID</div>
        <div>{proposal.id.toString()}</div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Status</div>
        <div>
          {Object.keys(proposal.status)[0]}
          {!!actionTime && (
            <>
              {" "}
              <TimestampLabel
                dt={DateTime.fromSeconds(Number(actionTime / BigInt(1e9)))}
              />
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Creator</div>
        <div>
          <IdentifierLabelWithButtons type="Principal" id={proposal.creator}>
            {proposal.creator.toText()}
          </IdentifierLabelWithButtons>
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Started</div>
        <div>
          <TimestampLabel
            dt={DateTime.fromSeconds(Number(proposal.timeStart / BigInt(1e9)))}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">End</div>
        <div>
          <TimestampLabel
            dt={DateTime.fromSeconds(Number(proposal.timeEnd / BigInt(1e9)))}
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
    </div>
  );
};
