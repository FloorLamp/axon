import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { errorToString } from "../../utils";

export default function useVote(id: bigint) {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    ["vote", id],
    async ({ yesNo, execute }: { yesNo: boolean; execute: boolean }) => {
      const result = await axon.vote({
        id: id,
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
        queryClient.refetchQueries(["pendingActions"]);
        queryClient.refetchQueries(["allActions"]);
      },
    }
  );
}
