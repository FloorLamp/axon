import classNames from "classnames";
import React, { useState } from "react";
import { AxonProposal, Ballot } from "../../declarations/Axon/Axon.did";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import { formatNumber, formatPercent, pluralize } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";

function BallotsList({
  ballots,
}: {
  ballots: (Ballot & { percent: string })[];
}) {
  return ballots.length ? (
    <>
      <div className="flex p-2 text-gray-500 text-xs border-b border-gray-300">
        <span className="flex-1">
          {ballots.length} {pluralize("Principal", ballots.length)}
        </span>
        <span className="flex-1 text-right">Votes</span>
        <span className="hidden xs:block flex-1 text-right">Voting Power</span>
      </div>
      <ul className="flex flex-col mt-2 pb-2 divide divide-gray-300">
        {ballots.map((ballot) => {
          return (
            <li key={ballot.principal.toText()} className="flex">
              <span className="flex-1 pl-2 py-0.5">
                <IdentifierLabelWithButtons
                  type="Principal"
                  id={ballot.principal}
                  isShort={true}
                />
              </span>

              <span className="flex-1 text-right pr-2 xs:pr-0">
                {formatNumber(ballot.votingPower)}
              </span>

              <span className="hidden xs:block flex-1 text-right pr-2">
                {ballot.percent}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  ) : (
    <p className="py-4 text-center text-sm text-gray-500">None</p>
  );
}

const VoteTypes = ["For", "Against", "Not Voted"] as const;
type VoteType = typeof VoteTypes[number];

export default function Votes({ proposal }: { proposal: AxonProposal }) {
  const { data } = useAxonById();
  const ballots = proposal.ballots.filter(({ vote }) => !!vote[0]);
  const yesBallots = ballots.filter(({ vote: [v] }) => "Yes" in v);
  const noBallots = ballots.filter(({ vote: [v] }) => "No" in v);
  const notVotedBallots = proposal.ballots.filter(({ vote }) => !vote[0]);

  const [type, setType] = useState<VoteType>(VoteTypes[0]);
  const maxVotes =
    Number(proposal.totalVotes.no) +
    Number(proposal.totalVotes.yes) +
    Number(proposal.totalVotes.notVoted);
  const selectedBallots = (
    type === "For"
      ? yesBallots
      : type === "Against"
      ? noBallots
      : notVotedBallots
  ).map((ballot) => ({
    ...ballot,
    percent: data ? formatPercent(Number(ballot.votingPower) / maxVotes) : null,
  }));

  return (
    <div className="flex flex-col items-stretch w-full rounded-md border border-gray-300">
      <ul className="flex gap-1 border-b border-gray-300 text-sm">
        {VoteTypes.map((value) => (
          <li
            key={value}
            className={classNames(
              "flex-1 text-center py-2 cursor-pointer hover:border-b-2 transition-all duration-75",
              {
                "hover:border-green-500 hover:text-green-500": value === "For",
                "hover:border-red-500 hover:text-red-500": value === "Against",
                "hover:border-gray-500 hover:text-gray-500":
                  value === "Not Voted",
                "border-b-2": value === type,
                "text-green-500 border-green-500":
                  value === type && value === "For",
                "border-red-500 text-red-500":
                  value === type && value === "Against",
                "border-gray-500 text-gray-500":
                  value === type && value === "Not Voted",
              }
            )}
            onClick={() => setType(value)}
          >
            {value}
          </li>
        ))}
      </ul>
      <BallotsList ballots={selectedBallots} />
    </div>
  );
}
