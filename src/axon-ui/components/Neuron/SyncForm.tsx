import React from "react";
import useSync from "../../lib/hooks/Axon/useSync";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";

export default function SyncForm({
  buttonClassName,
}: {
  buttonClassName?: string;
}) {
  const { mutate, isLoading, error } = useSync();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col py-4 gap-2">
        <SpinnerButton
          className="w-16 p-2"
          activeClassName={buttonClassName}
          isLoading={isLoading}
        >
          Sync
        </SpinnerButton>

        {error && <ErrorAlert>{error}</ErrorAlert>}
      </div>
    </form>
  );
}
