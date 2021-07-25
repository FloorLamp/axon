import { useGlobalContext } from "../../../components/Store/Store";
import { principalIsEqual } from "../../utils";
import { useInfo } from "./useInfo";

export const useIsOwner = () => {
  const { data } = useInfo();
  const {
    state: { principal },
  } = useGlobalContext();

  return data?.owners.find((owner) => principalIsEqual(principal, owner));
};
