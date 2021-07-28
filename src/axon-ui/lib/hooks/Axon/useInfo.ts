import { Principal } from "@dfinity/principal";
import assert from "assert";
import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { AxonWithProxy } from "../../types";
import { tryCall } from "../../utils";
import useAxonId from "../useAxonId";

function isPrincipal(arg: any): asserts arg is Principal {
  assert(arg instanceof Principal);
}

export const useInfo = () => {
  const id = useAxonId();
  const axon = useAxon();
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
    }
  );
};
