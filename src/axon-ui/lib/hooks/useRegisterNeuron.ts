import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../components/Store";
import { errorToString } from "../utils";

export default function useRegisterNeuron() {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    async (neuronId: string) => {
      const result = await axon.registerNeuron(BigInt(neuronId));
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: (data) => {
        console.log(data);
        queryClient.refetchQueries(["neuronIds", "neurons"]);
      },
    }
  );
}
