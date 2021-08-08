import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { tryCall } from "../../utils";

export const useTopAxons = () => {
  const axon = useAxon();
  return useQuery(
    "topAxons",
    async () => {
      return await tryCall(axon.topAxons);
    },
    {
      staleTime: Infinity,
    }
  );
};
