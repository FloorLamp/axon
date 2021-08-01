import { useMutation, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { LedgerEntry, Policy } from "../../../declarations/Axon/Axon.did";
import { errorToString, tryCall } from "../../utils";

export default function useCreate() {
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useMutation(
    "create",
    async ({
      ledgerEntries,
      name,
      policy,
    }: {
      ledgerEntries: LedgerEntry[];
      name: string;
      policy: Policy;
    }) => {
      const result = await tryCall(() =>
        axon.create({
          ledgerEntries,
          name,
          visibility: { Public: null },
          policy,
        })
      );
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      onSuccess: (data) => {
        console.log("create", data);
        queryClient.refetchQueries(["count"]);
      },
    }
  );
}
