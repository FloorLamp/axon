import React, { useState } from "react";
import { AxonService } from "../lib/types";
import { errorToString } from "../lib/utils";

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
    if ("ok" in result) {
      refresh();
    } else {
      setError(errorToString(result.err));
    }
  };

  return (
    <form onSubmit={register}>
      <div className="flex gap-2 pt-4 text-sm">
        <input
          type="number"
          className="px-2 py-1 border border-gray-300 rounded"
          placeholder="Neuron ID"
          onChange={(e) => setNeuronId(e.target.value)}
          value={neuronId}
        />
        <button
          className="px-2 py-1 cursor-pointer bg-gray-200 rounded hover:shadow-lg transition-shadow transition-300"
          disabled={isLoading}
        >
          {isLoading ? "Loading" : "Register"}
        </button>
      </div>
      {error}
    </form>
  );
}
