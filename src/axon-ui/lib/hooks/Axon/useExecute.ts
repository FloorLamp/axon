import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { errorToString } from "../../utils";

export default function useExecute() {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id }: { id: bigint }) => {
      let result;
      try {
        result = await axon.execute(id);
      } catch (error) {
        if (/assertion failed/.test(error.message)) {
          // Already executing, refetch
          return;
        } else {
          throw error.message;
        }
      }
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: (data) => {
        console.log(data);
        queryClient.refetchQueries(["pendingActions"]);
        queryClient.refetchQueries(["allActions"]);
      },
    }
  );
}
