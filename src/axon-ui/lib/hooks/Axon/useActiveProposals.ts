import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { ONE_MINUTES_MS } from "../../constants";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export const useActiveProposals = () => {
  const id = useAxonId();
  const axon = useAxon();

  return useQuery(
    ["activeProposals", id],
    async () => {
      const result = await tryCall(() => axon.getActiveProposals(BigInt(id)));
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      enabled: !!id,
      keepPreviousData: true,
      placeholderData: [],
      refetchInterval: ONE_MINUTES_MS,
    }
  );
};
