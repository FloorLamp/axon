import React, { useState } from "react";
import { BiListUl } from "react-icons/bi";
import { useQueryClient } from "react-query";
import {
  useActiveProposals,
  useAllProposals,
} from "../lib/hooks/Axon/useProposals";
import NavButtons from "./Buttons/NavButtons";
import { RefreshButton } from "./Buttons/RefreshButton";
import { Proposal } from "./Proposal/Proposal";

const ProposalTypes = ["Queued", "All"] as const;
type ProposalType = typeof ProposalTypes[number];

export default function Proposals() {
  const activeProposalsQuery = useActiveProposals();
  const allProposalsQuery = useAllProposals();
  const [type, setType] = useState<ProposalType>(ProposalTypes[0]);

  const { data, error, isFetching } =
    type === "Queued" ? activeProposalsQuery : allProposalsQuery;

  const queryClient = useQueryClient();
  const handleRefresh = () => {
    queryClient.refetchQueries(["activeProposals"]);
    queryClient.refetchQueries(["allProposals"]);
  };

  const renderTabValue = (t: ProposalType) =>
    t === "Queued" ? (
      <span>
        {t}
        {activeProposalsQuery.data.length > 0 && (
          <span className="ml-2 bg-gray-200 rounded-full text-xs px-2 py-0.5 leading-none text-indigo-500">
            {activeProposalsQuery.data.length}
          </span>
        )}
      </span>
    ) : (
      <>{t}</>
    );

  return (
    <section className="py-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="px-4 grid xs:grid-cols-3 gap-2 items-center mb-2">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold">Actions</h2>
          <RefreshButton
            isFetching={isFetching}
            onClick={handleRefresh}
            title="Refresh actions"
          />
        </div>
        <div className="justify-self-center">
          <NavButtons
            values={ProposalTypes}
            selected={type}
            onChange={(value) => setType(value)}
            renderValue={renderTabValue}
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
