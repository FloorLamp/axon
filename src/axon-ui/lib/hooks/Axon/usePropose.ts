import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { NewProposal, ProposalType } from "../../../declarations/Axon/Axon.did";
import { ProposalOptions } from "../../types";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export default function usePropose({
  timeStart,
  durationSeconds,
  execute,
}: ProposalOptions) {
  const axon = useAxon();
  const id = useAxonId();
  const queryClient = useQueryClient();

  return useMutation(
    async (proposal: ProposalType) => {
      const result = await tryCall(() => {
        const args = {
          axonId: BigInt(id),
          timeStart: timeStart ? [timeStart] : [],
          durationSeconds: durationSeconds ? [durationSeconds] : [],
          proposal,
          execute: execute ? [true] : [],
        } as NewProposal;
        console.log({ args });

        return axon.propose(args);
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
        queryClient.refetchQueries(["pendingProposals", id]);
      },
    }
  );
}
