import { Execute } from "../../declarations/Axon/Axon.did";
import {
  errorToString,
  governanceErrorToString,
  stringify,
} from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";

export default function Results({ results }: { results: Execute }) {
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex gap-2">
        {results.responses.map(([neuronId, res]) => {
          const id = neuronId.toString();
          let error;
          if ("err" in res) {
            error = errorToString(res.err);
          } else {
            if ("Error" in res.ok.command[0]) {
              error = governanceErrorToString(res.ok.command[0].Error);
            }
          }
          return (
            <li key={id}>
              <div>
                <strong>{id}</strong>
              </div>
              {error ? <ErrorAlert>{error}</ErrorAlert> : stringify(res)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
