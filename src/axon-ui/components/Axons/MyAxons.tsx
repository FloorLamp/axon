import Link from "next/link";
import React from "react";
import { useMyAxons } from "../../lib/hooks/Axons/useMyAxons";
import { formatNumber, pluralize } from "../../lib/utils";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import BalanceLabel from "../Labels/BalanceLabel";
import ResponseError from "../Labels/ResponseError";

export default function MyAxons() {
  const { data, isSuccess, isFetching, refetch, error } = useMyAxons();

  return (
    <Panel>
      <div className="flex gap-2 items-center mb-2">
        <h2 className="text-xl font-bold">My Axons</h2>
        <RefreshButton
          isFetching={isFetching}
          onClick={refetch}
          title="Refresh my Axons"
        />
      </div>
      <div>
        {error && <ResponseError>{error}</ResponseError>}
        {data ? (
          <div className="grid xs:grid-cols-2 md:grid-cols-3 grid-cols-1 gap-8 p-4">
            {data.map(({ id, totalStake, tokenHolders, name }) => (
              <Link key={id.toString()} href={`/axon/${id}`}>
                <a className="p-4 bg-gradient-to-br from-green-300 via-blue-500 to-purple-600 rounded-xl text-xl text-white h-48 hover:shadow-xl transition">
                  <h3 className="text-2xl font-bold">{name}</h3>
                  <p>Axon {id.toString()}</p>
                  <BalanceLabel value={totalStake} />
                  <p>
                    {formatNumber(tokenHolders)}{" "}
                    {pluralize("Holder", Number(tokenHolders))}
                  </p>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          isSuccess && (
            <div className="h-40 flex flex-col items-center justify-center">
              <p className="text-5xl">🤷‍♂️</p>
              <p className="py-4 text-gray-500 text-sm">No Axons found</p>
            </div>
          )
        )}
      </div>
    </Panel>
  );
}
