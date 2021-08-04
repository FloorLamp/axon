import { Principal } from "@dfinity/principal";
import React from "react";
import { useCanisterStatus } from "../../lib/hooks/Axon/useCanisterStatus";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import useAxonId from "../../lib/hooks/useAxonId";
import { formatNumber } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import ResponseError from "../Labels/ResponseError";
import { VisibilityLabel } from "../Labels/VisibilityLabel";
import { DataRow, DataTable } from "../Proposal/DataTable";
import ManageAxonModal from "./ManageAxonModal";
import PolicySummary from "./PolicySummary";

export default function AxonDetails() {
  const id = useAxonId();
  const status = useCanisterStatus();
  const { data, error, isFetching, refetch } = useInfo();

  return (
    <Panel className="flex-1 p-4">
      <div className="xs:flex justify-between mb-2 xs:mb-0 ">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold leading-tight">
            {data && data.name}
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
        {error && <ResponseError>{error}</ResponseError>}

        {data ? (
          <>
            <DataTable>
              <DataRow labelClassName="w-16" label="Axon ID">
                {id}
              </DataRow>
              <DataRow labelClassName="w-16" label="Proxy">
                <IdentifierLabelWithButtons
                  type="Principal"
                  id={data.proxy as unknown as Principal}
                  showName={false}
                />
              </DataRow>
              <DataRow labelClassName="w-16" label="Cycles">
                {status.data &&
                  `${formatNumber(Number(status.data.cycles) / 1e12)}T`}
              </DataRow>
            </DataTable>
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
