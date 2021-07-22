import React from "react";
import useSync from "../../lib/hooks/Axon/useSync";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";

export default function SyncForm() {
  const { mutate, isLoading, error } = useSync();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col py-4 gap-2">
        <div className="flex flex-col">
          <label>Sync Neurons</label>
          <p className="text-sm text-gray-500">
            Syncs the list of controlled neurons with the NNS.
          </p>
          <div className="pt-2">
            <SpinnerButton className="w-16" isLoading={isLoading}>
              Sync
            </SpinnerButton>
          </div>
        </div>

        {error && <ErrorAlert>{error}</ErrorAlert>}
      </div>
    </form>
  );
}
