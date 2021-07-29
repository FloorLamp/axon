import React from "react";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import { useLedger } from "../../lib/hooks/Axon/useLedger";
import useAxonId from "../../lib/hooks/useAxonId";
import { formatNumber, formatPercent } from "../../lib/utils";
import IdentifierLabelWithButtons, {
  IdentifierRenderProps,
} from "../Buttons/IdentifierLabelWithButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import ResponseError from "../Labels/ResponseError";

const renderPrincipal = ({
  rawId,
  shortId,
  displayId,
  name,
}: IdentifierRenderProps) => {
  const display = name ?? displayId;
  return (
    <>
      <span className="hidden sm:inline" title={rawId}>
        {display}
      </span>
      <span className="inline sm:hidden" title={rawId}>
        {name ?? shortId}
      </span>
    </>
  );
};

export default function Ledger() {
  const id = useAxonId();
  const { data: info } = useInfo();
  const { data: entries, error, isFetching, refetch, isSuccess } = useLedger();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col xs:flex-row gap-4">
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
            <h2 className="text-xl font-bold">Top Voters</h2>
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
                      render={renderPrincipal}
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
