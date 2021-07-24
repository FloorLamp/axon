import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { errorToString, tryCall } from "../../utils";

export default function useSync() {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    "sync",
    async () => {
      const result = await tryCall(axon.sync);
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: async (data) => {
        console.log(data);
        queryClient.refetchQueries(["neuronIds"]);
        queryClient.refetchQueries(["neurons"]);
      },
    }
  );
}
