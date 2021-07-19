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
    }: {
      proposalId: bigint;
      acceptReject: boolean;
    }) => {
      const result = await axon.vote(
        proposalId,
        acceptReject ? { Yes: null } : { No: null }
      );
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: (data) => {
        queryClient.refetchQueries(["activeProposals"]);
      },
    }
  );
}
