import React from "react";
import { CgSpinner } from "react-icons/cg";
import { canisterId } from "../declarations/Axon";
import { useInfo } from "../lib/hooks/useInfo";
import IdentifierLabelWithButtons from "./Buttons/IdentifierLabelWithButtons";
import ErrorAlert from "./Labels/ErrorAlert";

export default function AxonDetails() {
  const { data, error, isFetching } = useInfo();

  return (
    <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-xl font-bold">Axon Canister</h2>
          <IdentifierLabelWithButtons type="Principal" id={canisterId}>
            {canisterId}
          </IdentifierLabelWithButtons>
        </div>

        {error && <ErrorAlert>{error}</ErrorAlert>}

        <div>
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-bold">Operators</h2>
            {isFetching && <CgSpinner className="inline-block animate-spin" />}
          </div>
          <ul>
            {data &&
              data.operators.map((p) => (
                <li key={p.toText()}>
                  <IdentifierLabelWithButtons type="Principal" id={p}>
                    {p.toText()}
                  </IdentifierLabelWithButtons>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-bold">Policy</h2>
            {isFetching && <CgSpinner className="inline-block animate-spin" />}
          </div>
          {data && data.policy[0] ? (
            <span>
              <strong>{data.policy[0].needed}</strong> out of{" "}
              <strong>{data.policy[0].total}</strong> operators need to approve
            </span>
          ) : (
            <span>
              <strong>No policy set</strong> — any operator can manage
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
