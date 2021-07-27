import classNames from "classnames";
import React from "react";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import { percentFromBigInt } from "../../lib/percents";
import { formatNumber, formatPercent } from "../../lib/utils";

export default function VoteSummary({ proposal }: { proposal: AxonProposal }) {
  const { data } = useInfo();

  if (!data) {
    return null;
  }
  const maxVotes = Number(
    proposal.totalVotes.no +
      proposal.totalVotes.yes +
      proposal.totalVotes.notVoted
  );
  const totalVoted = Number(proposal.totalVotes.no + proposal.totalVotes.yes);

  const isPercent = "Percent" in proposal.policy.acceptanceThreshold;
  const yesPercentTotal = formatPercent(
    Number(proposal.totalVotes.yes) / totalVoted
  );
  const yesPercentMax = formatPercent(
    Number(proposal.totalVotes.yes) / maxVotes
  );
  const yesDisplay = isPercent
    ? yesPercentTotal
    : formatNumber(proposal.totalVotes.yes);

  const noPercentTotal = formatPercent(
    Number(proposal.totalVotes.no) / totalVoted
  );
  const noPercentMax = formatPercent(Number(proposal.totalVotes.no) / maxVotes);
  const noDisplay = isPercent
    ? noPercentTotal
    : formatNumber(proposal.totalVotes.no);
  const notVotedPercent = formatPercent(
    Number(proposal.totalVotes.notVoted) / maxVotes
  );

  const participationPercent = totalVoted / maxVotes;

  let acceptanceDisplay;
  if (
    "Percent" in proposal.policy.acceptanceThreshold &&
    proposal.policy.acceptanceThreshold.Percent.quorum[0]
  ) {
    const quorumPercent =
      percentFromBigInt(proposal.policy.acceptanceThreshold.Percent.quorum[0]) /
      100;
    const quorumPercentStr = formatPercent(quorumPercent);

    const isQuorumReached = participationPercent >= quorumPercent;
    acceptanceDisplay = (
      <div
        className={classNames(
          "whitespace-nowrap absolute text-xs top-0 pt-2 border-dashed",
          {
            "text-gray-300 border-gray-300": isQuorumReached,
            "text-gray-800 border-gray-800": !isQuorumReached,
            "border-l pl-1": quorumPercent <= 0.5,
            "border-r pr-1 text-right": quorumPercent > 0.5,
          }
        )}
        style={
          quorumPercent > 0.5
            ? { right: formatPercent(1 - quorumPercent) }
            : { left: quorumPercentStr }
        }
      >
        {quorumPercentStr} Quorum
      </div>
    );
  } else if ("Absolute" in proposal.policy.acceptanceThreshold) {
    const acceptancePercent =
      Number(proposal.policy.acceptanceThreshold.Absolute) / maxVotes;
    const isAccepted =
      proposal.totalVotes.yes >= proposal.policy.acceptanceThreshold.Absolute;
    const diff =
      proposal.policy.acceptanceThreshold.Absolute - proposal.totalVotes.yes;
    acceptanceDisplay = (
      <div
        className={classNames(
          "whitespace-nowrap absolute text-xs top-0 pt-2 border-dashed",
          {
            "text-gray-300 border-gray-300": isAccepted,
            "text-gray-700 border-gray-700": !isAccepted,
            "border-l pl-1.5": acceptancePercent <= 0.5,
            "border-r pr-1.5 text-right": acceptancePercent > 0.5,
          }
        )}
        style={
          acceptancePercent > 0.5
            ? { right: formatPercent(1 - acceptancePercent) }
            : { left: formatPercent(acceptancePercent) }
        }
      >
        {"Active" in proposal.status.slice(-1)[0] && !isAccepted && (
          <p className="font-bold leading-tight">
            {formatNumber(diff)} More to Accept
          </p>
        )}
        {formatNumber(proposal.policy.acceptanceThreshold.Absolute)} Total to
        Accept
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="font-bold">Votes</div>
      <div>
        <div className="text-gray-800 mb-1">
          <span className="text-xl font-bold mr-1">
            {formatPercent(participationPercent)}
          </span>

          <span className="text-sm uppercase">Participation</span>
        </div>
        <div className="flex justify-between text-sm uppercase">
          <span
            className={classNames("text-green-500", {
              "font-bold": proposal.totalVotes.yes > proposal.totalVotes.no,
            })}
          >
            {yesDisplay} For
          </span>
          <span
            className={classNames("text-red-500", {
              "font-bold": proposal.totalVotes.yes < proposal.totalVotes.no,
            })}
          >
            {noDisplay} Against
          </span>
        </div>
        <div
          className={classNames(
            "relative mt-1 h-1 rounded-full w-full bg-gray-200",
            {
              "mb-4": !!acceptanceDisplay,
            }
          )}
        >
          <div
            className="bg-green-400 h-full absolute"
            style={{ width: yesPercentMax }}
          />
          <div
            className="bg-red-400 h-full absolute"
            style={{ left: yesPercentMax, width: noPercentMax }}
          />
          {acceptanceDisplay}
        </div>
      </div>
    </div>
  );
}
