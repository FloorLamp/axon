import { Neuron } from "../../../declarations/Axon/Axon.did";
import { ControllerType } from "../../neurons";
import { principalIsEqual } from "../../utils";
import { useAxonById } from "./useAxonById";
import { useNeuronIds } from "./useNeuronIds";
import { useNeurons } from "./useNeurons";

export const useControllerType = (neuron: Neuron): ControllerType => {
  const { data: info } = useAxonById();

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

export type ManagedNeurons = Record<string, string[]>;
export const useManagedNeurons = (): ManagedNeurons => {
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
