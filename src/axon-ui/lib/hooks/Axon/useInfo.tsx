import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";

export const useInfo = () => {
  const axon = useAxon();
  return useQuery("info", async () => {
    let result;
    try {
      result = await axon.info();
    } catch (error) {
      throw error.message;
    }
    return result;
  });
};
