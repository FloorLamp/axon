import { Principal } from "@dfinity/principal";
import React from "react";
import { canisterId } from "../../declarations/Axon";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import useAxonId from "../../lib/hooks/useAxonId";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import ResponseError from "../Labels/ResponseError";
import { VisibilityLabel } from "../Labels/VisibilityLabel";
import ManageAxonModal from "./ManageAxonModal";
import PolicySummary from "./PolicySummary";

export default function AxonDetails() {
  const id = useAxonId();
  const { data, error, isFetching, refetch } = useInfo();

  return (
    <Panel>
      <div className="xs:flex justify-between">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold leading-tight">
            Axon #{id}
            {data?.name ? ` — ${data.name}` : null}
          </h2>
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
        <IdentifierLabelWithButtons type="Principal" id={canisterId} />

        {error && <ResponseError>{error}</ResponseError>}

        {data ? (
          <>
            <div>
              <h2 className="text-xl font-bold">Proxy</h2>
              <IdentifierLabelWithButtons
                type="Principal"
                id={data.proxy as unknown as Principal}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold">Policy</h2>
              <PolicySummary policy={data.policy} />
            </div>
          </>
        ) : (
          <strong>Axon not found</strong>
        )}
      </div>
    </Panel>
  );
}
