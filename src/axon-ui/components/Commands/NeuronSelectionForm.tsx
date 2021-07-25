import { Disclosure } from "@headlessui/react";
import classNames from "classnames";
import React from "react";
import { FiChevronRight } from "react-icons/fi";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";

export default function NeuronSelectionForm({
  neuronIds,
  setNeuronIds,
}: {
  neuronIds: string[];
  setNeuronIds: (string) => void;
}) {
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
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button className="group leading-none inline-flex items-center cursor-pointer px-2 py-1">
            Neurons (
            {neuronIds.length ? `${neuronIds.length} selected` : "All Selected"}
            )
            <FiChevronRight
              className={classNames(
                "transform transition-transform transition-100",
                {
                  "group-hover:translate-x-0.5": !open,
                  "rotate-90": open,
                }
              )}
            />
          </Disclosure.Button>

          <Disclosure.Panel as="ul" className="flex flex-col gap-1 py-2">
            {data.map((nid) => {
              const id = nid.toString();
              return (
                <li key={id}>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={(e) => toggle(id.toString())}
                      checked={set.has(id.toString())}
                    />
                    <IdentifierLabelWithButtons
                      type="Neuron"
                      id={id}
                      showButtons={false}
                    />
                  </label>
                </li>
              );
            })}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
