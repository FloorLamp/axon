import React from "react";
import { canisterId } from "../../declarations/Axon";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import { shortPrincipal } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import ErrorAlert from "../Labels/ErrorAlert";
import { VisibilityLabel } from "../Labels/VisibilityLabel";
import ManageAxonModal from "./ManageAxonModal";

export default function AxonDetails() {
  const { data, error, isFetching, refetch } = useInfo();

  return (
    <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="xs:flex justify-between">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold leading-tight">Axon Canister</h2>
          {data && <VisibilityLabel visibility={data.visibility} />}
          <RefreshButton
            isFetching={isFetching}
            onClick={refetch}
            title="Refresh Axon"
          />
        </div>
        <ManageAxonModal />
      </div>

      <div className="flex flex-col gap-2">
        <IdentifierLabelWithButtons type="Principal" id={canisterId}>
          {canisterId}
        </IdentifierLabelWithButtons>

        {error && <ErrorAlert>{error}</ErrorAlert>}

        <div>
          <h2 className="text-xl font-bold">Owners</h2>
          <ul>
            {data &&
              data.owners.map((p) => (
                <li key={p.toText()}>
                  <IdentifierLabelWithButtons type="Principal" id={p}>
                    <span className="hidden xs:inline leading-tight">
                      {p.toText()}
                    </span>
                    <span className="xs:hidden">{shortPrincipal(p)}</span>
                  </IdentifierLabelWithButtons>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold">Policy</h2>
          {data && data.policy[0] ? (
            <span>
              <strong>{data.policy[0].needed.toString()}</strong> out of{" "}
              <strong>{data.policy[0].total.toString()}</strong> owners need to
              approve
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
