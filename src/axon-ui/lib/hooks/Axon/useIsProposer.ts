import { useGlobalContext } from "../../../components/Store/Store";
import { principalIsEqual } from "../../utils";
import { useAxonById } from "./useAxonById";
import { useBalance } from "./useBalance";

export const useIsProposer = () => {
  const { data: info } = useAxonById();
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
