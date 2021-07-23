import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { ActionType } from "../../../declarations/Axon/Axon.did";
import { errorToString } from "../../utils";

export default function useInitiate({
  timeStart,
  durationSeconds,
  execute,
}: {
  timeStart?: string;
  durationSeconds?: string;
  execute?: boolean;
}) {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    async (action: ActionType) => {
      const result = await axon.initiate({
        timeStart: timeStart ? [BigInt(timeStart)] : [],
        durationSeconds: durationSeconds ? [BigInt(durationSeconds)] : [],
        action,
        execute: execute ? [true] : [],
      });
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
      },
    }
  );
}
