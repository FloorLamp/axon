import { Disclosure, Transition } from "@headlessui/react";
import React, { Fragment, ReactNode } from "react";

function ListPanel({ children }: { children?: ReactNode }) {
  return (
    <Transition
      enter="transition duration-50 ease-in"
      enterFrom="transform -translate-y-1 opacity-0"
      enterTo="transform translate-y-0 opacity-100"
      leave="transition duration-50 ease-out"
      leaveFrom="transform translate-y-0 opacity-100"
      leaveTo="transform -translate-y-1 opacity-0"
    >
      <Disclosure.Panel as={Fragment}>{children}</Disclosure.Panel>
    </Transition>
  );
}

export default ListPanel;
