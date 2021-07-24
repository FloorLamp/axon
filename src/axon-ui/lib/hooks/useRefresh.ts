import { Principal } from "@dfinity/principal";
import { useMutation } from "react-query";
import { governance } from "../canisters";
import { governanceErrorToString, tryCall } from "../utils";
import useSync from "./Axon/useSync";
import { useFindMemo } from "./useFindMemo";

export default function useRefresh({
  account,
  controller,
}: {
  account: string;
  controller: Principal;
}) {
  const { mutate } = useSync();
  const { data: memo } = useFindMemo(account);

  return useMutation(
    ["refresh", account],
    async () => {
      const result = await tryCall(() =>
        governance.claim_or_refresh_neuron_from_account({
          controller: [controller],
          memo: BigInt(memo),
        })
      );
      if (result.result[0]) {
        if ("NeuronId" in result.result[0]) {
          return result.result[0].NeuronId;
        } else {
          throw governanceErrorToString(result.result[0].Error);
        }
      } else {
        throw "No response";
      }
    },
    {
      onSuccess: async (data) => {
        console.log("refresh:", data);
        mutate();
      },
    }
  );
}
