import { AxonProposal } from "../declarations/Axon/Axon.did";
import { StatusKey } from "./types";

export const getStatus = (proposal: AxonProposal) =>
  Object.keys(proposal.status.slice(-1)[0])[0] as StatusKey;
