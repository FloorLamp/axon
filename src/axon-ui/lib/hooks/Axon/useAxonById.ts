import { Principal } from "@dfinity/principal";
import assert from "assert";
import { useQuery, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { AxonPublic } from "../../../declarations/Axon/Axon.did";
import { AxonWithProxy } from "../../types";
import { tryCall } from "../../utils";
import useAxonId from "../useAxonId";

function isPrincipal(arg: any): asserts arg is Principal {
  assert(arg instanceof Principal);
}

export const useAxonById = () => {
  const id = useAxonId();
  const axon = useAxon();
  const queryClient = useQueryClient();

  return useQuery(
    ["info", id],
    async () => {
      const result = await tryCall(() => axon.axonById(BigInt(id)));
      isPrincipal(result.proxy);
      return {
        ...result,
        proxy: result.proxy,
      } as AxonWithProxy;
    },
    {
      enabled: !!id,
      initialData: () => {
        return (queryClient
          .getQueryData<AxonPublic[]>(["topAxons"])
          ?.find((ap) => ap.id.toString() === id) ??
          queryClient
            .getQueryData<AxonPublic[]>(["myAxons"])
            ?.find(
              (ap) => ap.id.toString() === id
            )) as unknown as AxonWithProxy;
      },
    }
  );
};
