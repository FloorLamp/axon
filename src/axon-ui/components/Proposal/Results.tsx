import React, { ReactNode } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Command_1, Execute } from "../../declarations/Axon/Axon.did";
import { errorToString, governanceErrorToString } from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";
import SuccessAlert from "../Labels/SuccessAlert";

const ErrorDisplay = ({
  neuronId,
  children,
}: {
  neuronId: string;
  children: ReactNode;
}) => {
  return (
    <ErrorAlert>
      <div className="p-1">
        <div className="flex items-center">
          <FaTimesCircle className="w-4 text-red-500" />
          <div className="pl-1 font-bold">{neuronId}</div>
        </div>
        <div className="flex pt-0.5">
          <div className="w-5" />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </ErrorAlert>
  );
};

const Result = ({
  neuronId,
  result,
}: {
  neuronId: string;
  result: Command_1;
}) => {
  if ("Error" in result) {
    return (
      <ErrorDisplay neuronId={neuronId}>
        {governanceErrorToString(result.Error)}
      </ErrorDisplay>
    );
  }

  let message;
  if ("Follow" in result) {
    message = "Successfully set followees";
  }

  return (
    <SuccessAlert>
      <div className="p-1">
        <div className="flex items-center">
          <FaCheckCircle className="w-4 text-green-500" />
          <div className="pl-1 font-bold">{neuronId}</div>
        </div>
        {message && (
          <div className="flex pt-0.5">
            <div className="w-5" />
            <div className="flex-1">{message}</div>
          </div>
        )}
      </div>
    </SuccessAlert>
  );
};

export default function Results({ results }: { results: Execute }) {
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex gap-2">
        {results.responses.map(([neuronId, res]) => {
          const id = neuronId.toString();
          let display;
          if ("err" in res) {
            display = (
              <ErrorDisplay neuronId={id}>
                {errorToString(res.err)}
              </ErrorDisplay>
            );
          } else {
            display = <Result neuronId={id} result={res.ok.command[0]} />;
          }
          return (
            <li key={id} className="flex flex-col gap-1">
              {display}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
