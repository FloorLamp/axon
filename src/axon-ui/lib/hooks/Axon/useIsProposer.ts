import { useGlobalContext } from "../../../components/Store/Store";
import { principalIsEqual } from "../../utils";
import { useBalance } from "./useBalance";
import { useInfo } from "./useInfo";

export const useIsProposer = () => {
  const { data: info } = useInfo();
  const { data: balance } = useBalance();
  const {
    state: { principal },
  } = useGlobalContext();

  if (!info) {
    return false;
  }

  return (
    balance !== null &&
    balance > BigInt(0) &&
    balance >= info.policy.proposeThreshold &&
    ("Open" in info.policy.proposers ||
      !!info.policy.proposers.Closed.find((proposer) =>
        principalIsEqual(principal, proposer)
      ))
  );
};
