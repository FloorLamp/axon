import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store";
import { errorToString } from "../../utils";

export default function useVote(proposalId: bigint) {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    ["vote", proposalId],
    async ({ yesNo, execute }: { yesNo: boolean; execute: boolean }) => {
      const result = await axon.vote({
        id: proposalId,
        vote: yesNo ? { Yes: null } : { No: null },
        execute,
      });
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: (data) => {
        console.log("vote", data);
        queryClient.refetchQueries(["activeProposals"]);
        queryClient.refetchQueries(["allProposals"]);
      },
    }
  );
}
