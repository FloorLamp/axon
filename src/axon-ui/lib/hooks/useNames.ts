import { useGlobalContext } from "../../components/Store/Store";
import { canisterId as AxonCanisterId } from "../../declarations/Axon";
import { DEFAULT_NEURONS } from "../names";

/** Stub for address book */
export default function useNames() {
  const {
    state: { principal },
  } = useGlobalContext();

  const neurons = DEFAULT_NEURONS;
  const principals = principal
    ? {
        [principal.toText()]: "You",
        [AxonCanisterId]: "Axon",
      }
    : {};

  const neuronName = (id: string): string | undefined => neurons[id];
  const principalName = (id: string): string | undefined => principals[id];
  return { neuronName, principalName };
}
