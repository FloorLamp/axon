import classNames from "classnames";
import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import { getStatus } from "../../lib/axonProposal";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import { percentFromBigInt } from "../../lib/percents";
import { StatusKey } from "../../lib/types";
import { formatNumber, formatPercent } from "../../lib/utils";
import { statusColor } from "../Labels/StatusLabel";

export default function VoteSummary({
  proposal,
  newVote,
}: {
  proposal: AxonProposal;
  newVote?: {
    yesNo: boolean;
    votePower: bigint;
  };
}) {
  const { data } = useInfo();

  if (!data) {
    return null;
  }
  const status = getStatus(proposal);

  const no = Number(proposal.totalVotes.no);
  const yes = Number(proposal.totalVotes.yes);
  const notVoted = Number(proposal.totalVotes.notVoted);

  const maxVotes = no + yes + notVoted;
  const totalVoted = no + yes;

  const isPercent = "Percent" in proposal.policy.acceptanceThreshold;
  const yesPercentMax = formatPercent(yes / maxVotes);
  const noPercentMax = formatPercent(no / maxVotes);

  const delta = newVote ? Number(newVote.votePower) : 0;
  const deltaPercent = delta / maxVotes;
  const deltaYes = newVote?.yesNo === true ? delta : 0;
  const deltaNo = newVote?.yesNo === false ? delta : 0;
  const totalVotedWithDelta = totalVoted + delta;

  const renderCount = (base: number, label: string, delta?: number) => {
    if (isPercent) {
      if (delta) {
        return `${formatPercent(
          (base + delta) / totalVotedWithDelta
        )} ${label} (${formatPercent(
          (base + delta) / totalVotedWithDelta - base / totalVoted,
          2,
          "always"
        )})`;
      } else {
        return `${formatPercent(base / totalVotedWithDelta)} ${label}`;
      }
    } else {
      if (delta) {
        return `${formatNumber(base + delta)} ${label} (+${delta})`;
      } else {
        return `${formatNumber(base)} ${label}`;
      }
    }
  };

  const participationPercent = totalVoted / maxVotes;

  let acceptanceDisplay, newStatus: StatusKey;
  if ("Percent" in proposal.policy.acceptanceThreshold) {
    const acceptancePercent =
      percentFromBigInt(proposal.policy.acceptanceThreshold.Percent.percent) /
      100;
    const rejectionThreshold = (1 - acceptancePercent) * maxVotes;

    if (proposal.policy.acceptanceThreshold.Percent.quorum[0]) {
      const quorumPercent =
        percentFromBigInt(
          proposal.policy.acceptanceThreshold.Percent.quorum[0]
        ) / 100;
      const quorumPercentStr = formatPercent(quorumPercent);

      const isQuorumReached =
        participationPercent + deltaPercent >= quorumPercent;
      acceptanceDisplay = (
        <div
          className={classNames(
            "whitespace-nowrap absolute text-xs top-0 pt-2 border-dashed text-gray-800 border-gray-800",
            {
              // "text-gray-300 border-gray-300": isQuorumReached,
              // "text-gray-800 border-gray-800": !isQuorumReached,
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
          <span className="inline-flex items-center gap-1">
            {quorumPercentStr} Quorum
            {isQuorumReached && <FaCheckCircle className="text-green-400" />}
            {status === "Expired" && !isQuorumReached && (
              <FaTimesCircle className="text-red-400" />
            )}
          </span>
        </div>
      );

      if (
        newVote &&
        isQuorumReached &&
        yes + deltaYes >= acceptancePercent * (totalVoted + delta)
      ) {
        newStatus = "Accepted";
      }
    } else {
      if (newVote && yes + deltaYes >= acceptancePercent * maxVotes) {
        newStatus = "Accepted";
      }
    }
    if (newVote && no + deltaNo > rejectionThreshold) {
      newStatus = "Rejected";
    }
  } else if ("Absolute" in proposal.policy.acceptanceThreshold) {
    const abs = Number(proposal.policy.acceptanceThreshold.Absolute);
    const acceptancePercent = abs / maxVotes;
    const isAccepted = yes >= abs;
    const diff = abs - yes - deltaYes;
    const willBeAccepted = !isAccepted && diff <= 0;
    if (newVote) {
      if (willBeAccepted) {
        newStatus = "Accepted";
      } else if (yes + deltaYes + notVoted - delta < abs) {
        newStatus = "Rejected";
      }
    }

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
            {willBeAccepted ? (
              <span className="inline-flex items-center gap-1">
                Accepted
                <FaCheckCircle className="text-green-400" />
              </span>
            ) : (
              `${formatNumber(diff)} More to Accept`
            )}
          </p>
        )}
        {formatNumber(abs)} Total to Accept
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-gray-800">
        <span className="text-xl font-bold mr-1">
          {newVote ? (
            <>
              {formatPercent(participationPercent + deltaPercent)} (
              {formatPercent(deltaPercent, 2, "always")})
            </>
          ) : (
            formatPercent(participationPercent)
          )}
        </span>

        <span className="text-sm uppercase">Participation</span>
      </div>
      <div className="flex justify-between text-sm uppercase">
        <span
          className={classNames("text-green-500", {
            "font-bold": yes + deltaYes > no + deltaNo,
          })}
        >
          {renderCount(yes, "For", deltaYes)}
        </span>
        <span
          className={classNames("text-red-500", {
            "font-bold": yes + deltaYes < no + deltaNo,
          })}
        >
          {renderCount(no, "Against", deltaNo)}
        </span>
      </div>
      <div
        className={classNames("relative h-1 rounded-full w-full bg-gray-200", {
          "mb-6": !acceptanceDisplay,
          "mb-10": !!acceptanceDisplay,
        })}
      >
        <div
          className="bg-green-400 h-full absolute"
          style={{ width: yesPercentMax }}
        />
        <div
          className="bg-red-400 h-full absolute"
          style={{
            left: newVote?.yesNo
              ? formatPercent((yes + deltaYes) / maxVotes)
              : yesPercentMax,
            width: noPercentMax,
          }}
        />
        {newVote && (
          <div
            className={classNames("h-full absolute animate-pulse opacity-100", {
              "bg-green-300 ring-1 ring-green-100": newVote.yesNo,
              "bg-red-300 ring-1 ring-red-100": !newVote.yesNo,
            })}
            style={{
              left: newVote.yesNo
                ? yesPercentMax
                : formatPercent((yes + no) / maxVotes),
              width: formatPercent(deltaPercent),
            }}
          />
        )}
        {acceptanceDisplay}
      </div>
      {newStatus && (
        <div>
          Proposal will be{" "}
          <label
            className={classNames(
              "inline-flex gap-2 items-center rounded-md px-2 py-0.5 text-xs uppercase",
              statusColor(newStatus)
            )}
          >
            {newStatus}
          </label>
        </div>
      )}
    </div>
  );
}
