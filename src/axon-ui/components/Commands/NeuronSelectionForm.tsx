import { Disclosure } from "@headlessui/react";
import classNames from "classnames";
import React from "react";
import { FiChevronRight } from "react-icons/fi";
import { useNeuronIds } from "../../lib/hooks/useNeuronIds";

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
    <Disclosure as="div" className="py-4">
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

          <Disclosure.Panel as="ul" className="flex flex-col gap-2 py-2">
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
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
