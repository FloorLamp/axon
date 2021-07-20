import { useQuery } from "react-query";
import { useAxon } from "../../components/Store";
import { FIVE_MINUTES_MS } from "../constants";
import { errorToString } from "../utils";

export const useActiveProposals = () => {
  const axon = useAxon();
  return useQuery(
    "activeProposals",
    async () => {
      const result = await axon.getActiveProposals();
      console.log("activeProposals", result);

      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      placeholderData: [],
      refetchInterval: FIVE_MINUTES_MS,
    }
  );
};

export const useAllProposals = () => {
  const axon = useAxon();
  return useQuery(
    "allProposals",
    async () => {
      const result = await axon.getAllProposals([]);
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      placeholderData: [],
      refetchInterval: FIVE_MINUTES_MS,
    }
  );
};
