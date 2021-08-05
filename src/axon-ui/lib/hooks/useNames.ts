import { useGlobalContext } from "../../components/Store/Store";
import { canisterId as AxonCanisterId } from "../../declarations/Axon";
import { DEFAULT_NEURONS } from "../names";
import { useInfo } from "./Axon/useInfo";

/** Stub for address book */
export default function useNames() {
  const {
    state: { principal },
  } = useGlobalContext();
  const { data } = useInfo();

  const neurons = DEFAULT_NEURONS;
  const principals = {
    [AxonCanisterId]: "Axon Service",
    ...(data?.proxy ? { [data.proxy.toText()]: `Axon ${data.id}` } : {}),
    ...(principal
      ? {
          [principal.toText()]: "You",
        }
      : {}),
  };

  const neuronName = (id: string): string | undefined => neurons[id];
  const principalName = (id: string): string | undefined => principals[id];
  return { neuronName, principalName };
}
