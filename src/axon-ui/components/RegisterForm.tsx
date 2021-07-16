import { ActorSubclass } from "@dfinity/agent";
import React, { useState } from "react";
import Axon from "../../declarations/Axon/Axon.did";

type AxonService = ActorSubclass<Axon._SERVICE>;

export default function RegisterForm({
  axon,
  refresh,
}: {
  axon: AxonService;
  refresh: () => void;
}) {
  const [neuronId, setNeuronId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const register = async (e) => {
    e.preventDefault();
    if (!neuronId) return;

    setError("");

    setIsLoading(true);
    const result = await axon.registerNeuron(BigInt(neuronId));
    console.log(result);

    setIsLoading(false);
    if ("Ok" in result) {
      refresh();
    } else {
      setError(JSON.stringify(result.Err));
    }
  };

  return (
    <form onSubmit={register}>
      <div className="flex gap-2">
        <input
          type="number"
          className="px-2 py-1 border border-gray-300 rounded"
          placeholder="Neuron ID"
          onChange={(e) => setNeuronId(e.target.value)}
          value={neuronId}
        />
        <button
          className="px-2 py-1 cursor-pointer hover:shadow-md bg-gray-200 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Loading" : "Register"}
        </button>
      </div>
      {error}
    </form>
  );
}
