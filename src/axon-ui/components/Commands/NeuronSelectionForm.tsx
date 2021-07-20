import classNames from "classnames";
import React, { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useNeuronIds } from "../../lib/hooks/useNeuronIds";

export default function NeuronSelectionForm({
  neuronIds,
  setNeuronIds,
}: {
  neuronIds: string[];
  setNeuronIds: (string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { data } = useNeuronIds();

  const set = new Set(neuronIds);

  const toggle = (id) => {
    if (set.has(id)) {
      setNeuronIds(neuronIds.filter((n) => n !== id));
    } else {
      setNeuronIds(neuronIds.concat(id));
    }
  };

  return (
    <div className="py-4">
      <label
        className={classNames(
          "group leading-none inline-flex items-center cursor-pointer"
        )}
        onClick={() => setIsVisible(!isVisible)}
      >
        Neurons (
        {neuronIds.length ? `${neuronIds.length} selected` : "All Selected"})
        {isVisible ? (
          <FiChevronDown />
        ) : (
          <FiChevronRight className="transform group-hover:translate-x-0.5 transition-transform transition-100" />
        )}
      </label>

      {isVisible && (
        <ul className="flex flex-col gap-2 py-2">
          {data.map((nid) => {
            const id = nid.toString();
            return (
              <li key={id}>
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    onChange={(e) => toggle(id.toString())}
                    checked={set.has(id.toString())}
                  />
                  {id}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
