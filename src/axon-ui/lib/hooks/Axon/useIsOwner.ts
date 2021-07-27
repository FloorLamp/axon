import { useGlobalContext } from "../../../components/Store/Store";
import { principalIsEqual } from "../../utils";
import { useBalance } from "./useBalance";
import { useInfo } from "./useInfo";

export const useIsOwner = () => {
  const { data: info } = useInfo();
  const { data: balance } = useBalance();
  const {
    state: { principal },
  } = useGlobalContext();

  if (!info) {
    return false;
  }

  if ("Closed" in info.policy.proposers) {
    return !!info.policy.proposers.Closed.find((proposer) =>
      principalIsEqual(principal, proposer)
    );
  } else {
    return (
      balance !== null && balance > 0 && balance >= info.policy.proposeThreshold
    );
  }
};
