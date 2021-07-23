import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";

export const useInfo = () => {
  const axon = useAxon();
  return useQuery("info", () => axon.info());
};
