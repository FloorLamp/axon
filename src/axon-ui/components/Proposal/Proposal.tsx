import { DateTime } from "luxon";
import React from "react";
import { CommandProposal } from "../../declarations/Axon/Axon.did";
import { shortPrincipal } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import CommandDescription from "../Commands/CommandDescription";
import { TimestampLabel } from "../Labels/TimestampLabel";
import VoteLabel from "../Labels/VoteLabel";
import { useGlobalContext } from "../Store";
import AcceptRejectButtons from "./AcceptRejectButtons";

export const Proposal = ({ proposal }: { proposal: CommandProposal }) => {
  console.log(proposal);
  const {
    state: { principal, isAuthed },
  } = useGlobalContext();

  const ballots = proposal.ballots.filter(({ vote }) => !!vote[0]);
  const hasVoted = ballots.find(
    (ballot) => ballot.principal.toHex() === principal.toHex()
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Proposal ID</div>
        <div>{proposal.id.toString()}</div>
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
        <div className="w-32 font-bold">Command</div>
        <div>
          <CommandDescription command={proposal.proposal} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Votes</div>
        <div>
          <ul className="flex flex-col gap-1">
            {ballots.map((ballot, i) => {
              const principalText = ballot.principal.toText();
              return (
                <li key={principalText + i} className="flex gap-2">
                  <VoteLabel vote={ballot.vote[0]} />
                  <IdentifierLabelWithButtons
                    type="Principal"
                    id={ballot.principal}
                  >
                    <span title={principalText}>
                      {shortPrincipal(ballot.principal)}
                    </span>
                  </IdentifierLabelWithButtons>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {isAuthed && !hasVoted && (
        <div className="flex flex-col md:flex-row leading-tight py-4">
          <div className="w-32" />
          <div>
            <AcceptRejectButtons proposalId={proposal.id} />
          </div>
        </div>
      )}
    </div>
  );
};
