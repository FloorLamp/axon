import classNames from "classnames";
import React from "react";
import { StatusKey } from "../../lib/types";

export const statusColor = (status: StatusKey, hasExecutionError?: boolean) => {
  switch (status) {
    case "Created":
      return "bg-gray-300 text-gray-700";
    case "Active":
    case "Accepted":
      return "bg-green-300 text-green-700";
    case "ExecutionQueued":
    case "ExecutionStarted":
      return "bg-blue-200 text-blue-700";
    case "ExecutionFinished":
      if (hasExecutionError) {
        return "bg-yellow-300 text-yellow-700";
      } else {
        return "bg-green-300 text-green-700";
      }
    case "Rejected":
      return "bg-red-300 text-red-700";
    case "Cancelled":
    case "Expired":
      return "bg-gray-300 text-gray-700";
  }
};

const statusDisplay = (status: StatusKey, hasExecutionError?: boolean) => {
  switch (status) {
    case "Created":
      return "Pending";
    case "ExecutionQueued":
      return "Queued";
    case "ExecutionStarted":
      return "Executing";
    case "ExecutionFinished": {
      if (hasExecutionError) {
        return "Executed*";
      }
      return "Executed";
    }
    default:
      return status;
  }
};

export default function StatusLabel({
  status,
  hasExecutionError,
}: {
  status: StatusKey;
  hasExecutionError?: boolean;
}) {
  return (
    <label
      className={classNames(
        "block w-20 text-center py-0.5 rounded text-xs uppercase pointer-events-none",
        statusColor(status, hasExecutionError)
      )}
      title={hasExecutionError ? "Executed with errors" : undefined}
    >
      {statusDisplay(status)}
    </label>
  );
}
