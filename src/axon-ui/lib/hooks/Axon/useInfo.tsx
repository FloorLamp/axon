import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { tryCall } from "../../utils";

export const useInfo = () => {
  const axon = useAxon();
  return useQuery("info", async () => await tryCall(axon.info));
};
