import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../components/Store";
import { Command } from "../../declarations/Axon/Axon.did";
import { errorToString } from "../utils";

export default function useProposeCommand({
  timeStart,
  durationSeconds,
}: {
  timeStart?: string;
  durationSeconds?: string;
}) {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    async (proposal: Command) => {
      const result = await axon.proposeCommand({
        timeStart: timeStart ? [BigInt(timeStart)] : [],
        durationSeconds: durationSeconds ? [BigInt(durationSeconds)] : [],
        proposal,
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
        queryClient.refetchQueries(["activeProposals"]);
      },
    }
  );
}
