import React from "react";
import Axons from "../components/Axons/Axons";

export default function Home() {
  return (
    <>
      <section className="p-8 bg-gray-50 rounded-lg shadow-lg text-xl">
        <strong>Axon</strong> is a multi-user, multi-neuron management canister.
      </section>

      <Axons />
    </>
  );
}
