import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { tryCall } from "../../utils";

export const useMyAxons = () => {
  const axon = useAxon();
  return useQuery(
    "myAxons",
    async () => {
      return await tryCall(axon.myAxons);
    },
    {
      staleTime: Infinity,
    }
  );
};
