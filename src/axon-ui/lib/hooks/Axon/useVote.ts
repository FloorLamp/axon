import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export default function useVote(proposalId: bigint) {
  const axonId = useAxonId();
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    ["vote", axonId, proposalId],
    async ({ yesNo }: { yesNo: boolean }) => {
      const result = await tryCall(() =>
        axon.vote({
          axonId: BigInt(axonId),
          proposalId,
          vote: yesNo ? { Yes: null } : { No: null },
        })
      );
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: (data) => {
        console.log("vote", data);
        queryClient.refetchQueries(["proposal", axonId, proposalId]);
        queryClient.refetchQueries(["activeProposals", axonId]);
        queryClient.refetchQueries(["allProposals", axonId]);
      },
    }
  );
}
