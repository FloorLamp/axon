import React from "react";
import { useHideZeroBalances } from "../Store/Store";

export default function SettingsForm() {
  const [hideZeroBalances, setHideZeroBalances] = useHideZeroBalances();

  return (
    <div className="flex flex-col divide-gray-300 divide-y">
      <div className="flex flex-col gap-2 pt-4 pb-16">
        <h2 className="text-lg font-bold">Display</h2>
        <label className="cursor-pointer inline-flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={hideZeroBalances}
            onChange={(e) => setHideZeroBalances(e.target.checked)}
          />
          Hide Zero Balance Neurons
        </label>
      </div>
    </div>
  );
}
