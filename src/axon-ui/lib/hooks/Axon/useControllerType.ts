import { Neuron } from "../../../declarations/Axon/Axon.did";
import { ControllerType } from "../../neurons";
import { principalIsEqual } from "../../utils";
import { useInfo } from "./useInfo";
import { useNeuronIds } from "./useNeuronIds";
import { useNeurons } from "./useNeurons";

export const useControllerType = (neuron: Neuron): ControllerType => {
  const { data: info } = useInfo();

  if (!info || !neuron) {
    return null;
  }

  if (principalIsEqual(info.proxy, neuron.controller[0])) {
    return "Controller";
  }
  if (neuron.hot_keys.find((p) => principalIsEqual(info.proxy, p))) {
    return "Hot Key";
  }
  return null;
};

export const useManagedNeurons = (): Record<string, string[]> => {
  const { data: neurons } = useNeurons();
  const { data: neuronIds } = useNeuronIds();

  if (!neuronIds?.length || !neurons?.full_neurons.length) {
    return {};
  }

  const entries = neurons.full_neurons
    .map((n): [string, string[]] => {
      const manageNeuronTopic = n.followees.find(([topic, _id]) => topic === 1);
      let managedBy = [];
      if (manageNeuronTopic) {
        managedBy = manageNeuronTopic[1].followees
          .filter(({ id }) => neuronIds.includes(id))
          .map(({ id }) => id.toString());
      }
      return [n.id[0].id.toString(), managedBy];
    })
    .filter(([_, v]) => v.length > 0);
  return Object.fromEntries(entries);
};
