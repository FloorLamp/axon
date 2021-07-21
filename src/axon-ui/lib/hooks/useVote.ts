import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../components/Store";
import { errorToString } from "../utils";

export default function useVote() {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      proposalId,
      acceptReject,
      execute,
    }: {
      proposalId: bigint;
      acceptReject: boolean;
      execute: boolean;
    }) => {
      const result = await axon.vote({
        id: proposalId,
        vote: acceptReject ? { Yes: null } : { No: null },
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
        setTimeout(() => {
          queryClient.refetchQueries(["activeProposals", "allProposals"]);
        }, 2000);
      },
    }
  );
}
