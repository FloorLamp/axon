import React from "react";
import Axons from "../components/Axons/Axons";
import Panel from "../components/Containers/Panel";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <Panel className="p-8 text-xl">
        <strong>Axon</strong> is a multi-user, multi-neuron management canister.
      </Panel>

      <Axons />
    </div>
  );
}
