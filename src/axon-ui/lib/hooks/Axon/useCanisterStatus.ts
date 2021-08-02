import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export const useCanisterStatus = () => {
  const id = useAxonId();
  const axon = useAxon();
  return useQuery(
    ["status", id],
    async () => {
      return await tryCall(() => axon.axonStatusById(BigInt(id)));
    },
    {
      enabled: !!id,
    }
  );
};
