import { Principal } from "@dfinity/principal";
import React, { useState } from "react";
import useRefresh from "../../lib/hooks/Governance/useRefresh";
import { useFindMemo } from "../../lib/hooks/Ledger/useFindMemo";
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
  const [amount, setAmount] = useState("");
  const [transferError, setTransferError] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(null, {
      onSuccess: closeModal,
    });
  };

  const handlePlugTransfer = async () => {
    setTransferError("");
    try {
      setIsTransferring(true);
      const result = await window.ic.plug.requestTransfer({
        to: account,
        amount: Number(amount) * 1e8,
      });
      if ("height" in result) {
        mutate(null, {
          onSuccess: closeModal,
        });
      }
    } catch (error) {
      setTransferError(error.message);
    }
    setIsTransferring(false);
  };

  return (
    <div className="flex flex-col divide-gray-300 divide-y">
      <div className="flex flex-col gap-2 py-4">
        <label>Send ICP to:</label>

        <strong className="leading-tight">
          <IdentifierLabelWithButtons type="Account" id={account} />
        </strong>

        {window.ic?.plug?.agent && (
          <>
            <label className="block">
              Amount to Top Up
              <div className="mt-1 xs:flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  className="flex-1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={0}
                  maxLength={20}
                />
                <div className="flex-1">
                  <SpinnerButton
                    className="p-3 w-full"
                    activeClassName="btn-cta cursor-pointer"
                    disabledClassName="btn-cta-disabled"
                    onClick={handlePlugTransfer}
                    isLoading={isTransferring}
                    isDisabled={!amount}
                  >
                    Transfer with Plug
                  </SpinnerButton>
                </div>
              </div>
            </label>

            {transferError && <ErrorAlert>{transferError}</ErrorAlert>}
          </>
        )}

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
          <ErrorAlert>
            {memoError && memoError instanceof Error
              ? memoError.message
              : refreshError}
          </ErrorAlert>
        )}
      </div>
    </div>
  );
}
