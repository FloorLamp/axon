import classNames from "classnames";
import React, { Fragment, ReactNode } from "react";
import {
  FaCheckCircle,
  FaCircleNotch,
  FaDotCircle,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { AxonProposal, Status } from "../../declarations/Axon/Axon.did";
import { getStatus } from "../../lib/axonProposal";
import { dateTimeFromNanos } from "../../lib/datetime";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
import { TimestampLabel } from "../Labels/TimestampLabel";
import { CommandResponseSummary } from "./CommandResponseSummary";
import ExecuteButton from "./ExecuteButton";

const CIRCLE_SIZE = 18;

const StatusSummary = ({
  circle,
  label,
  children,
  showLine = true,
}: {
  circle: ReactNode;
  label: ReactNode;
  children?: ReactNode;
  showLine?: boolean;
}) => {
  return (
    <li className="flex flex-col text-sm">
      <div className="flex items-center">
        <div className="w-6 flex justify-center">{circle}</div>
        <div className="pl-2 uppercase font-bold leading-none">{label}</div>
      </div>
      <div className="flex items-stretch">
        <div className="w-6 flex justify-center">
          {showLine && <div className="bg-gray-200 w-px h-full -mx-px" />}
        </div>
        <div className={classNames("pl-2", { "pb-3": showLine })}>
          {children}
        </div>
      </div>
    </li>
  );
};

export default function StatusHistory({
  proposal,
}: {
  proposal: AxonProposal;
}) {
  const isOwner = useIsProposer();

  const statuses = proposal.status.length;
  const currentStatus = getStatus(proposal);

  const renderStatus = (status: Status, i) => {
    const isLast = i === statuses - 1;
    if ("Created" in status) {
      return (
        <>
          <StatusSummary
            circle={
              <FaCheckCircle size={CIRCLE_SIZE} className="text-gray-400" />
            }
            label={<span className="text-gray-500">Created</span>}
            showLine={true}
          >
            <TimestampLabel dt={dateTimeFromNanos(status.Created)} />
          </StatusSummary>
          {currentStatus === "Created" && (
            <StatusSummary
              circle={
                <FaDotCircle size={CIRCLE_SIZE} className="text-gray-400" />
              }
              label={<span className={"text-gray-500"}>Pending</span>}
              showLine={!isLast}
            >
              Starts{" "}
              <TimestampLabel dt={dateTimeFromNanos(proposal.timeStart)} />
            </StatusSummary>
          )}
        </>
      );
    } else if ("Active" in status) {
      return (
        <StatusSummary
          circle={
            currentStatus === "Active" ? (
              <FaDotCircle size={CIRCLE_SIZE} className="text-green-400" />
            ) : (
              <FaCheckCircle size={CIRCLE_SIZE} className="text-gray-400" />
            )
          }
          label={
            <span
              className={
                currentStatus === "Active" ? "text-green-700" : "text-gray-500"
              }
            >
              Active
            </span>
          }
          showLine={!isLast}
        >
          <TimestampLabel dt={dateTimeFromNanos(status.Active)} />
        </StatusSummary>
      );
    } else if ("Accepted" in status) {
      return (
        <>
          <StatusSummary
            circle={
              <FaCheckCircle
                size={CIRCLE_SIZE}
                className={
                  currentStatus === "Accepted"
                    ? "text-green-400"
                    : "text-gray-400"
                }
              />
            }
            label={
              <span
                className={
                  currentStatus === "Accepted"
                    ? "text-green-700"
                    : "text-gray-500"
                }
              >
                Accepted
              </span>
            }
          >
            <TimestampLabel dt={dateTimeFromNanos(status.Accepted)} />
          </StatusSummary>
          {currentStatus === "Active" && (
            <StatusSummary
              circle={
                <FaDotCircle size={CIRCLE_SIZE} className="text-gray-300" />
              }
              label={<span className="text-gray-400">Execute</span>}
              showLine={!isLast}
            >
              {isOwner && (
                <div className="mt-2 border-t border-gray-300 pt-3">
                  <ExecuteButton id={proposal.id} />
                </div>
              )}
            </StatusSummary>
          )}
        </>
      );
    } else if ("ExecutionQueued" in status) {
      if (currentStatus === "ExecutionQueued") {
        return (
          <StatusSummary
            circle={
              <FaCircleNotch
                size={CIRCLE_SIZE}
                className="animate-spin text-gray-400"
              />
            }
            label={<span className="text-gray-500">Execution Queued</span>}
            showLine={!isLast}
          >
            <TimestampLabel dt={dateTimeFromNanos(status.ExecutionQueued)} />
          </StatusSummary>
        );
      }
    } else if ("ExecutionStarted" in status) {
      const timestamp = (
        <TimestampLabel dt={dateTimeFromNanos(status.ExecutionStarted)} />
      );
      if (currentStatus === "ExecutionStarted") {
        return (
          <StatusSummary
            circle={
              <FaCircleNotch
                size={CIRCLE_SIZE}
                className="animate-spin text-blue-400"
              />
            }
            label={<span className="text-blue-700">Execution Started</span>}
            showLine={!isLast}
          >
            {timestamp}
          </StatusSummary>
        );
      } else {
        return (
          <StatusSummary
            circle={
              <FaCheckCircle size={CIRCLE_SIZE} className="text-gray-400" />
            }
            label={<span className="text-gray-500">Execution Started</span>}
            showLine={!isLast}
          >
            {timestamp}
          </StatusSummary>
        );
      }
    } else if ("ExecutionFinished" in status) {
      return (
        <StatusSummary
          circle={
            <FaCheckCircle size={CIRCLE_SIZE} className="text-green-400" />
          }
          label={<span className="text-green-700">Execution Finished</span>}
          showLine={!isLast}
        >
          <TimestampLabel dt={dateTimeFromNanos(status.ExecutionFinished)} />
          <CommandResponseSummary proposalType={proposal.proposal} />
        </StatusSummary>
      );
    } else if ("Cancelled" in status) {
      return (
        <StatusSummary
          circle={<FaTimesCircle size={CIRCLE_SIZE} className="text-red-400" />}
          label={<span className="text-red-700">Cancelled</span>}
          showLine={!isLast}
        >
          <TimestampLabel dt={dateTimeFromNanos(status.Cancelled)} />
        </StatusSummary>
      );
    } else if ("Rejected" in status) {
      return (
        <StatusSummary
          circle={<FaTimesCircle size={CIRCLE_SIZE} className="text-red-400" />}
          label={<span className="text-red-700">Rejected</span>}
          showLine={!isLast}
        >
          <TimestampLabel dt={dateTimeFromNanos(status.Rejected)} />
        </StatusSummary>
      );
    } else if ("Expired" in status) {
      return (
        <StatusSummary
          circle={
            <FaExclamationCircle size={CIRCLE_SIZE} className="text-gray-300" />
          }
          label={<span className="text-gray-400">Expired</span>}
          showLine={!isLast}
        />
      );
    } else {
      console.warn("status not rendered", status);
    }
    return null;
  };

  return (
    <ul className="flex flex-col">
      {proposal.status.map((status, i) => (
        <Fragment key={Object.keys(status)[0]}>
          {renderStatus(status, i)}
        </Fragment>
      ))}
    </ul>
  );
}
