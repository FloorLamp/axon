import React from "react";
import { canisterId as AxonCanisterId } from "../../declarations/Axon";
import { Neuron } from "../../declarations/Axon/Axon.did";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
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
  neuron: Neuron | null;
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
      <div className="flex-1 flex flex-col sm:flex-row">
        <div className="flex-1 sm:flex-none sm:w-72 md:w-96 xs:flex gap-2 items-center">
          {neuron && (
            <ControllerTypeLabel
              type={
                neuron.controller[0].toText() === AxonCanisterId
                  ? "Controller"
                  : "Hot Key"
              }
            />
          )}
          <IdentifierLabelWithButtons type="Neuron" id={id} />
        </div>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
          {neuron && (
            <>
              <DissolveStateLabel dissolveState={neuron.dissolve_state[0]} />
              <div className="flex-1 sm:pr-8 sm:text-right">
                <BalanceLabel value={neuron.cached_neuron_stake_e8s} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
