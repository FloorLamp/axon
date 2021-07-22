import React from "react";
import useCleanup from "../../lib/hooks/Axon/useCleanup";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";

export default function CleanupForm() {
  const { mutate, isLoading, error } = useCleanup();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col py-4 gap-2">
        <div className="flex flex-col">
          <label>Cleanup Neurons</label>
          <p className="text-sm text-gray-500">Remove expired neurons.</p>
          <div className="pt-2">
            <SpinnerButton className="w-20" isLoading={isLoading}>
              Cleanup
            </SpinnerButton>
          </div>
        </div>

        {error && <ErrorAlert>{error}</ErrorAlert>}
      </div>
    </form>
  );
}
