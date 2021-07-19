import React from "react";
import useSync from "../lib/hooks/useSync";
import SpinnerButton from "./Buttons/SpinnerButton";

export default function SyncForm() {
  const { mutate, isLoading, error } = useSync();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2 pt-4 text-sm">
        <SpinnerButton className="w-12" isLoading={isLoading}>
          Sync
        </SpinnerButton>
      </div>
      {error}
    </form>
  );
}
