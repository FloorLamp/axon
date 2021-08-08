import React from "react";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import { useLedger } from "../../lib/hooks/Axon/useLedger";
import { formatNumber, formatPercent } from "../../lib/utils";
import IdentifierLabelWithButtons, {
  renderResponsiveShortId,
} from "../Buttons/IdentifierLabelWithButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import ResponseError from "../Labels/ResponseError";

export default function Ledger() {
  const { data: info } = useAxonById();
  const { data: entries, error, isFetching, refetch, isSuccess } = useLedger();

  return (
    <div className="flex flex-col gap-4 xs:gap-8">
      <section className="flex flex-col xs:flex-row gap-4 xs:gap-8">
        <Panel className="flex-1 p-4">
          <label className="text-gray-500 uppercase text-sm">
            Total Holders
          </label>
          <h2 className="text-xl font-bold">{entries?.length || "-"}</h2>
        </Panel>

        <Panel className="flex-1 p-4">
          <label className="text-gray-500 uppercase text-sm">Total Votes</label>
          <h2 className="text-xl font-bold">
            {info ? formatNumber(info.supply) : "-"}
          </h2>
        </Panel>
      </section>

      <Panel>
        <div className="xs:flex justify-between">
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-bold">Ledger</h2>
            <RefreshButton
              isFetching={isFetching}
              onClick={refetch}
              title="Refresh"
            />
          </div>
        </div>
        {error && <ResponseError>{error}</ResponseError>}

        {entries?.length > 0 ? (
          <ul className="divide-y divide-gray-300">
            <li className="font-bold flex py-2">
              <div className="flex-3 flex pl-2 overflow-hidden">Principal</div>

              <div className="flex-1 text-right">Total Votes</div>

              <div className="hidden xs:block flex-1 text-right pr-2">
                Vote Power
              </div>
            </li>
            {entries.map(([principal, balance]) => {
              const id = principal.toText();
              const percent = info
                ? formatPercent(Number(balance) / Number(info.supply))
                : null;

              return (
                <li key={id} className="flex py-1 leading-tight">
                  <div className="flex-3 flex pl-2 overflow-hidden">
                    <IdentifierLabelWithButtons
                      type="Principal"
                      id={id}
                      render={renderResponsiveShortId}
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
      </Panel>
    </div>
  );
}
