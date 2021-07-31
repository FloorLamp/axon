import { Principal } from "@dfinity/principal";
import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export default function useTransfer() {
  const axonId = useAxonId();
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    ["transfer", axonId],
    async ({ recipient, amount }: { recipient: Principal; amount: bigint }) => {
      const result = await tryCall(() =>
        axon.transfer(BigInt(axonId), recipient, amount)
      );
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: (data) => {
        queryClient.refetchQueries(["balance", axonId]);
        queryClient.refetchQueries(["ledger", axonId]);
      },
    }
  );
}
