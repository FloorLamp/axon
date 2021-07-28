import { useGlobalContext } from "../../../components/Store/Store";
import { AxonProposal } from "../../../declarations/Axon/Axon.did";

export const useMyBallot = (proposal: AxonProposal) => {
  const {
    state: { principal },
  } = useGlobalContext();

  return proposal.ballots.find(
    (ballot) => principal && ballot.principal.toHex() === principal.toHex()
  );
};
