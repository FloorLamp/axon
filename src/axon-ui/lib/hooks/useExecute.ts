import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../components/Store";
import { errorToString } from "../utils";

export default function useExecute() {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    async ({ proposalId }: { proposalId: bigint }) => {
      const result = await axon.execute(proposalId);
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: (data) => {
        console.log(data);
        setTimeout(() => {
          queryClient.refetchQueries(["activeProposals", "allProposals"]);
        }, 2000);
      },
    }
  );
}
