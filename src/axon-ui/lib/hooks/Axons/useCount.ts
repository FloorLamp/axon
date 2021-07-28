import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { tryCall } from "../../utils";

export const useCount = () => {
  const axon = useAxon();
  return useQuery(
    "count",
    async () => {
      const result = await tryCall(axon.count);
      return Number(result);
    },
    {
      staleTime: Infinity,
    }
  );
};
