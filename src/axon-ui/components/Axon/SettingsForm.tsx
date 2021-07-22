import React from "react";
import CleanupForm from "./CleanupForm";
import SyncForm from "./SyncForm";

export default function SettingsForm() {
  return (
    <div className="flex flex-col divide-gray-300 divide-y">
      <SyncForm />

      <CleanupForm />
    </div>
  );
}
