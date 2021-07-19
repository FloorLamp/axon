import React, { useState } from "react";
import useRegisterNeuron from "../lib/hooks/useRegisterNeuron";

export default function RegisterForm() {
  const [neuronId, setNeuronId] = useState("");
  const { mutate, isLoading, error } = useRegisterNeuron();

  const register = (e) => {
    e.preventDefault();
    if (!neuronId) return;

    mutate(neuronId);
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
