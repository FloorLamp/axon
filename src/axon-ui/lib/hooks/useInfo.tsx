import { useQuery } from "react-query";
import { useAxon } from "../../components/Store";

export const useInfo = () => {
  const axon = useAxon();
  return useQuery("info", () => axon.info());
};
