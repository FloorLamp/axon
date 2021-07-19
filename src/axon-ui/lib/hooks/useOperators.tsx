import { useQuery } from "react-query";
import { useAxon } from "../../components/Store";

export const useOperators = () => {
  const axon = useAxon();
  return useQuery("operators", () => axon.getOperators(), {
    placeholderData: [],
  });
};
