import { useGlobalContext } from "../../../components/Store";
import { principalIsEqual } from "../../utils";
import { useInfo } from "./useInfo";

export const useIsOwner = () => {
  const { data } = useInfo();
  const {
    state: { principal },
  } = useGlobalContext();

  return data?.operators.find((operator) =>
    principalIsEqual(principal, operator)
  );
};
