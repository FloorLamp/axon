import { useMemo } from "react";
import { Neuron } from "../../../declarations/Axon/Axon.did";
import { ControllerType } from "../../neurons";
import { principalIsEqual } from "../../utils";
import { useAxonById } from "./useAxonById";
import { useNeurons } from "./useNeurons";

export type NeuronWithRelationships = Neuron & {
  _id: string;
  _managedBy: string[];
  _managerOf: string[];
  _type: ControllerType;
};

export const useNeuronRelationships = () => {
  const { data: info } = useAxonById();
  const { data: neurons } = useNeurons();
  return useMemo(() => {
    if (!info || !neurons) {
      return [];
    }

    const neuronsWithIdString = neurons.response.full_neurons.map((neuron) => ({
      ...neuron,
      _id: neuron.id[0].id.toString(),
    }));
    const neuronIds = neuronsWithIdString.map(({ _id }) => _id);

    const managers = new Set<string>();
    const entries = neuronsWithIdString
      .map((n): [string, string[]] => {
        const manageNeuronTopic = n.followees.find(
          ([topic, _id]) => topic === 1
        );
        let managedBy = [];
        if (manageNeuronTopic) {
          managedBy = manageNeuronTopic[1].followees
            .filter(({ id }) => neuronIds.includes(id.toString()))
            .map(({ id }) => {
              const str = id.toString();
              managers.add(str);
              return str;
            });
        }

        return [n.id[0].id.toString(), managedBy];
      })
      .filter(([_, v]) => v.length > 0);
    const targetToManagers = Object.fromEntries(entries);

    return neuronsWithIdString.map((neuron): NeuronWithRelationships => {
      const _managedBy = targetToManagers[neuron._id] || [];
      const _managerOf = entries
        .filter(([k, v]) => v.includes(neuron._id))
        .map(([k]) => k);
      return {
        ...neuron,
        _managedBy,
        _managerOf,
        _type: principalIsEqual(info.proxy, neuron.controller[0])
          ? // Not possible yet
            "Controller"
          : _managerOf.length > 0
          ? "Manager"
          : _managedBy.length > 0
          ? "Delegated"
          : neuron.hot_keys.find((p) => principalIsEqual(info.proxy, p))
          ? "Hot Key"
          : null,
      };
    });
  }, [neurons, info]);
};
