import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export default function useCleanup() {
  const axonId = useAxonId();
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    ["cleanup", axonId],
    async () => {
      console.log("cleanup...");

      const result = await tryCall(() => axon.cleanup(BigInt(axonId)));
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: async (data) => {
        queryClient.refetchQueries(["activeProposals", axonId]);
        queryClient.refetchQueries(["allProposals", axonId]);
      },
    }
  );
}
