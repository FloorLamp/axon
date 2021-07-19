import React, { ReactNode, useState } from "react";
import { Command } from "../../declarations/Axon/Axon.did";
import useProposeCommand from "../../lib/hooks/useProposeCommand";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";
import { ProposalOptionsForm } from "../ProposalOptionsForm";

export default function CommandForm({
  makeCommand,
  children,
}: {
  makeCommand: () => Command | null;
  children: ReactNode;
}) {
  const [timeStart, setTimeStart] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");

  const { mutate, error, isError, isLoading } = useProposeCommand({
    timeStart,
    durationSeconds,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const command = makeCommand();
    if (command) {
      mutate(command);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 py-4">
        {children}

        <ProposalOptionsForm
          timeStart={timeStart}
          setTimeStart={setTimeStart}
          durationSeconds={durationSeconds}
          setDurationSeconds={setDurationSeconds}
        />

        <div className="border-t border-gray-300 flex flex-col gap-2 pt-4">
          <div className="flex gap-2">
            <SpinnerButton className="w-20" isLoading={isLoading}>
              Submit
            </SpinnerButton>
          </div>

          {isError && <ErrorAlert>{error}</ErrorAlert>}
        </div>
      </div>
    </form>
  );
}
