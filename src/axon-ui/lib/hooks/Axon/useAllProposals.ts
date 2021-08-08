import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { ONE_MINUTES_MS } from "../../constants";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export const useAllProposals = () => {
  const id = useAxonId();
  const axon = useAxon();

  return useQuery(
    ["allProposals", id],
    async () => {
      const result = await tryCall(() => axon.getAllProposals(BigInt(id), []));
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
