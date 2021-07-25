import { Principal } from "@dfinity/principal";
import React from "react";
import { useFindMemo } from "../../lib/hooks/useFindMemo";
import useRefresh from "../../lib/hooks/useRefresh";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";

export default function TopupForm({
  account,
  controller,
  closeModal,
}: {
  account: string;
  controller: Principal;
  closeModal: () => void;
}) {
  const {
    mutate,
    isLoading,
    error: refreshError,
  } = useRefresh({ account, controller });
  const { error: memoError, isSuccess: hasMemo } = useFindMemo(account);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(null, {
      onSuccess: closeModal,
    });
  };

  return (
    <div className="flex flex-col divide-gray-300 divide-y">
      <div className="flex flex-col gap-2 py-4">
        <label className="hidden">
          Top Up Neuron
          <input
            type="number"
            placeholder="Amount"
            className="w-full mt-1"
            disabled
          />
        </label>
        <label>Send ICP to:</label>

        <strong className="leading-tight">
          <IdentifierLabelWithButtons type="Account" id={account} />
        </strong>
        <p className="leading-tight">
          Then, click the button to refresh the neuron.
        </p>
      </div>

      <div className="flex flex-col py-4 gap-2">
        <SpinnerButton
          className="w-20 p-2"
          isLoading={isLoading}
          isDisabled={!hasMemo}
          onClick={handleSubmit}
        >
          Refresh
        </SpinnerButton>

        {(memoError ?? refreshError) && (
          <ErrorAlert>{memoError ?? refreshError}</ErrorAlert>
        )}
      </div>
    </div>
  );
}
