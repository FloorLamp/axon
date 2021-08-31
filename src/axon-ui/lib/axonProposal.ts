import { DateTime } from "luxon";
import { AxonProposal } from "../declarations/Axon/Axon.did";
import { dateTimeFromNanos } from "./datetime";
import { StatusKey } from "./types";

export const getStatus = (proposal: AxonProposal) =>
  Object.keys(proposal.status.slice(-1)[0])[0] as StatusKey;

export const getActionTime = (proposal: AxonProposal): DateTime | null => {
  const status = getStatus(proposal);
  if (
    status === "ExecutionQueued" ||
    status === "ExecutionStarted" ||
    status === "ExecutionFinished" ||
    status === "ExecutionTimedOut" ||
    status === "Rejected" ||
    status === "Accepted" ||
    status === "Expired" ||
    status === "Cancelled"
  ) {
    const ts = Object.values(proposal.status.slice(-1)[0])[0];
    return dateTimeFromNanos(ts);
  } else if (status === "Created") {
    return dateTimeFromNanos(proposal.timeStart);
  } else if (status === "Active") {
    return dateTimeFromNanos(proposal.timeEnd);
  }
  return null;
};
