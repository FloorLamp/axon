import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export default function useCancel(proposalId: bigint) {
  const axonId = useAxonId();
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    ["cancel", axonId, proposalId],
    async () => {
      const result = await tryCall(() =>
        axon.cancel(BigInt(axonId), proposalId)
      );
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: (data) => {
        console.log("cancelled", data);
        queryClient.refetchQueries(["activeProposals", axonId]);
        queryClient.refetchQueries(["allProposals", axonId]);
      },
    }
  );
}
