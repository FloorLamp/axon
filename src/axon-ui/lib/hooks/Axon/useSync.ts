import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export default function useSync() {
  const id = useAxonId();
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    ["sync", id],
    async () => {
      const result = await tryCall(() => axon.sync(BigInt(id)));
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: async (data) => {
        console.log(data);
        queryClient.refetchQueries(["neuronIds", id]);
        queryClient.refetchQueries(["neurons", id]);
      },
    }
  );
}
