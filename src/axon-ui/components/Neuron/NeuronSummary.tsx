import React from "react";
import { BsExclamationCircleFill } from "react-icons/bs";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
import { NeuronWithRelationships } from "../../lib/hooks/Axon/useNeuronRelationships";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import BalanceLabel from "../Labels/BalanceLabel";
import ControllerTypeLabel from "../Labels/ControllerTypeLabel";
import { DissolveStateLabel } from "../Labels/DissolveStateLabel";

export default function NeuronSummary({
  id,
  neuron,
  onSelect,
  isSelected,
}: {
  id: string;
  neuron: NeuronWithRelationships | null;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}) {
  const isProposer = useIsProposer();

  return (
    <div className="flex items-center">
      {isProposer && onSelect && (
        <input
          type="checkbox"
          className="mr-2 cursor-pointer hover:ring-2 hover:ring-opacity-50 hover:ring-indigo-500 hover:border-indigo-500"
          onChange={() => onSelect(id)}
          onClick={(e) => e.stopPropagation()}
          checked={isSelected}
        />
      )}
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 md:flex-none md:w-80 xs:flex gap-2 items-center">
          {neuron._type && <ControllerTypeLabel type={neuron._type} />}
          <IdentifierLabelWithButtons type="Neuron" id={id} />
        </div>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
          {neuron && (
            <>
              <DissolveStateLabel dissolveState={neuron.dissolve_state[0]} />
              <div className="flex-1 sm:pr-8 sm:text-right">
                <BalanceLabel value={neuron.cached_neuron_stake_e8s} />
                {neuron.maturity_e8s_equivalent > BigInt(1e8) && (
                  <span data-balloon-pos="left" aria-label="Can spawn">
                    <BsExclamationCircleFill className="ml-1 inline-block text-green-400" />
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
