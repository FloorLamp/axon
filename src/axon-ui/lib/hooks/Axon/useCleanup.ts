import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { errorToString } from "../../utils";

export default function useCleanup() {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    async () => {
      const result = await axon.cleanup();
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: async (data) => {
        console.log(data);
        queryClient.refetchQueries(["activeProposals"]);
        queryClient.refetchQueries(["allProposals"]);
      },
    }
  );
}
