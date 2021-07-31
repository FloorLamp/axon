import { DateTime } from "luxon";
import { AxonProposal } from "../declarations/Axon/Axon.did";
import { dateTimeFromNanos } from "./datetime";
import { StatusKey } from "./types";

export const getStatus = (proposal: AxonProposal) =>
  Object.keys(proposal.status.slice(-1)[0])[0] as StatusKey;

export const getActionTime = (proposal: AxonProposal): DateTime | null => {
  const currentStatus = proposal.status.slice(-1)[0];
  if (
    status === "ExecutionQueued" ||
    status === "ExecutionStarted" ||
    status === "ExecutionFinished" ||
    status === "Rejected" ||
    status === "Accepted" ||
    status === "Expired"
  ) {
    const ts = Object.values(currentStatus)[0];
    return dateTimeFromNanos(ts);
  } else if (status === "Created") {
    return dateTimeFromNanos(proposal.timeStart);
  } else if (status === "Active") {
    return dateTimeFromNanos(proposal.timeEnd);
  }
  return null;
};
