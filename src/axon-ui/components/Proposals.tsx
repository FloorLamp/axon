import classNames from "classnames";
import React, { useState } from "react";
import { BiListUl } from "react-icons/bi";
import { GrRefresh } from "react-icons/gr";
import { useQueryClient } from "react-query";
import {
  useActiveProposals,
  useAllProposals,
} from "../lib/hooks/Axon/useProposals";
import NavButtons from "./Buttons/NavButtons";
import { Proposal } from "./Proposal/Proposal";

const ProposalTypes = ["Queued", "All"] as const;

export default function Proposals() {
  const activeProposalsQuery = useActiveProposals();
  const allProposalsQuery = useAllProposals();
  const [type, setType] = useState<typeof ProposalTypes[number]>(
    ProposalTypes[0]
  );

  const { data, error, isFetching } =
    type === "Queued" ? activeProposalsQuery : allProposalsQuery;

  const queryClient = useQueryClient();
  const handleRefresh = () => {
    queryClient.refetchQueries(["activeProposals"]);
    queryClient.refetchQueries(["allProposals"]);
  };

  return (
    <section className="py-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="px-4 grid xs:grid-cols-3 gap-2 items-center mb-2">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold">Actions</h2>
          <GrRefresh
            className={classNames("", {
              "cursor-pointer filter hover:drop-shadow opacity-50 hover:opacity-100 transition-all":
                !isFetching,
              "inline-block animate-spin": isFetching,
            })}
            onClick={isFetching ? undefined : handleRefresh}
            title={isFetching ? "Loading actions..." : "Refresh actions"}
          />
        </div>
        <div className="justify-self-center">
          <NavButtons
            values={ProposalTypes}
            selected={type}
            onChange={(value) => setType(value)}
          />
        </div>
      </div>
      <div>
        {error}
        {data && data.length > 0 ? (
          <ul className="divide-y divide-gray-300">
            {data.map((p) => (
              <li key={p.id.toString()}>
                <Proposal proposal={p} defaultOpen={type === "Queued"} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center">
            <BiListUl size={48} className="" />
            <p className="py-2">No proposals</p>
            {type === "Queued" && (
              <p className="text-gray-500">Queued proposals will appear here</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
