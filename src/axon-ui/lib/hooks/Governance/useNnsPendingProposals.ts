import { useQuery } from "react-query";
import { governance } from "../../canisters";
import { ONE_MINUTES_MS } from "../../constants";
import {
  Action,
  ErrorType,
  NnsFunction,
  RewardStatus,
  Status,
  Topic,
} from "../../governance";

export type ApiProposal = {
  action: Action;
  decidedDate: string;
  errorMessage: string;
  errorType: ErrorType | null;
  executedDate: string;
  failedDate: string | null;
  id: number;
  nnsFunction: NnsFunction;
  payloadJson: string;
  proposalDate: string;
  proposerId: string;
  rejectCost: string;
  rewardEventRound: number;
  rewardStatus: RewardStatus;
  status: Status;
  summary: string;
  tallyDate: string;
  tallyNo: string;
  tallyTotal: string;
  tallyYes: string;
  topic: Topic;
  url: string;
};

// export const useNnsOpenProposals = () => {
//   return useQuery(
//     "nnsPendingProposals",
//     async () => {
//       const result = await fetch(
//         "https://ic.rocks/api/proposals?" +
//           new URLSearchParams({
//             "status[]": "1",
//           })
//       );
//       const json = await result.json();
//       return json.rows as ApiProposal[];
//     },
//     {
//       placeholderData: [],
//       refetchInterval: FIVE_MINUTES_MS,
//     }
//   );
// };

export const useNnsPendingProposals = () => {
  return useQuery(
    "nnsPendingProposals",
    async () => {
      const result = await governance.get_pending_proposals();
      result.reverse();

      return result;
    },
    {
      placeholderData: [],
      refetchInterval: ONE_MINUTES_MS,
    }
  );
};
