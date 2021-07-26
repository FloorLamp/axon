import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export const useInfo = () => {
  const id = useAxonId();
  const axon = useAxon();
  return useQuery(["info", id], async () => {
    if (!id) {
      return null;
    }
    return await tryCall(() => axon.axonById(BigInt(id)));
  });
};
