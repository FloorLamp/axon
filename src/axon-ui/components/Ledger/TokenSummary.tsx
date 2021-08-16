import Link from "next/link";
import React from "react";
import { FiChevronRight } from "react-icons/fi";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import { useLedger } from "../../lib/hooks/Axon/useLedger";
import useAxonId from "../../lib/hooks/useAxonId";
import { formatNumber, formatPercent } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import ResponseError from "../Labels/ResponseError";
import { DataRow, DataTable } from "../Proposal/DataTable";

export default function TokenSummary() {
  const axonId = useAxonId();
  const { data: info } = useAxonById();
  const { data: ledger, error, isFetching, refetch, isSuccess } = useLedger();
  const topHolders = ledger?.slice(0, 5).filter(([_, bal]) => bal > 0);

  return (
    <Panel className="flex-1 p-4">
      <div className="xs:flex justify-between">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold">Governance Summary</h2>
          <RefreshButton
            isFetching={isFetching}
            onClick={refetch}
            title="Refresh"
          />
        </div>
        <div>
          <Link href={`/axon/${axonId}/ledger`}>
            <a className="text-xs text-gray-800 hover:underline">
              View Ledger
              <FiChevronRight className="inline ml-0.5 text-gray-500" />
            </a>
          </Link>
        </div>
      </div>

      {ledger && info && ledger[0][1] === info.supply ? (
        <div className="flex flex-col gap-4 py-2">
          <div>
            <div className="text-gray-500 text-xs uppercase leading-none">
              Owner
            </div>
            <div className="leading-tight">
              <IdentifierLabelWithButtons type="Principal" id={ledger[0][0]} />
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase leading-none">
              Total Votes
            </div>
            <div>{formatNumber(info.supply)}</div>
          </div>
        </div>
      ) : (
        <>
          <DataTable>
            <DataRow labelClassName="w-32" label="Total Holders">
              {ledger?.length}
            </DataRow>
            <DataRow labelClassName="w-32" label="Total Votes">
              {info && formatNumber(info.supply)}
            </DataRow>
          </DataTable>
          {error && <ResponseError>{error}</ResponseError>}
          {topHolders?.length > 0 ? (
            <ul className="divide-y divide-gray-300">
              <li className="text-gray-500 text-xs flex py-1">
                <div className="flex-2 flex pl-2 overflow-hidden">
                  Principal
                </div>

                <div className="flex-1 text-right">Votes</div>

                <div className="hidden xs:block flex-1 text-right pr-2">
                  Voting Power
                </div>
              </li>
              {topHolders.map(([principal, balance]) => {
                const id = principal.toText();
                const percent = info
                  ? formatPercent(Number(balance) / Number(info.supply))
                  : null;

                return (
                  <li key={id} className="flex py-0.5 leading-tight">
                    <div className="flex-2 flex pl-2 overflow-hidden">
                      <IdentifierLabelWithButtons
                        type="Principal"
                        id={id}
                        isShort={true}
                      />
                    </div>

                    <div className="flex-1 text-right">
                      {formatNumber(balance)}
                    </div>

                    <div className="hidden xs:block flex-1 text-right pr-2">
                      {percent}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            isSuccess && (
              <div className="h-32 flex flex-col items-center justify-center">
                <p className="py-2">No Ledger entries</p>
                <p className="text-gray-500">That's weird.</p>
              </div>
            )
          )}
        </>
      )}
    </Panel>
  );
}
