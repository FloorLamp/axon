import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { BiListUl } from "react-icons/bi";
import { useActiveProposals as useActiveProposals } from "../../lib/hooks/Axon/useActiveProposals";
import { useAllProposals } from "../../lib/hooks/Axon/useAllProposals";
import useAxonId from "../../lib/hooks/useAxonId";
import NavButtons from "../Buttons/NavButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import { ListButton } from "../ExpandableList/ListButton";
import ResponseError from "../Labels/ResponseError";
import { ProposalSummary } from "./ProposalSummary";

const ProposalTypes = ["Active", "All"] as const;
type ProposalType = typeof ProposalTypes[number];

export default function Proposals() {
  const router = useRouter();
  const axonId = useAxonId();
  const activeProposalsQuery = useActiveProposals();
  const allProposalsQuery = useAllProposals();
  const [type, setType] = useState<ProposalType>(ProposalTypes[0]);

  const { data, error, isFetching, isSuccess } =
    type === "Active" ? activeProposalsQuery : allProposalsQuery;

  const handleRefresh = () => {
    activeProposalsQuery.refetch();
    allProposalsQuery.refetch();
  };

  const renderTabValue = (t: ProposalType) =>
    t === "Active" ? (
      <span>
        {t}
        {activeProposalsQuery.data?.length > 0 && (
          <span className="ml-2 bg-gray-200 rounded-full text-xs px-2 py-0.5 leading-none text-indigo-500">
            {activeProposalsQuery.data.length}
          </span>
        )}
      </span>
    ) : (
      <div className="w-10 text-center">{t}</div>
    );

  return (
    <Panel className="py-4">
      <div className="px-4 grid xs:grid-cols-3 gap-2 items-center mb-2">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold">Proposals</h2>
          <RefreshButton
            isFetching={isFetching}
            onClick={handleRefresh}
            title="Refresh proposals"
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
      {error && (
        <div className="px-4">
          <ResponseError>{error}</ResponseError>
        </div>
      )}
      {data && data.length > 0 ? (
        <ul className="divide-y divide-gray-300">
          {data.map((proposal) => (
            <li key={proposal.id.toString()}>
              <ListButton
                onClick={() =>
                  router.push(
                    `/axon/${axonId}/proposal/${proposal.id.toString()}`
                  )
                }
              >
                <ProposalSummary proposal={proposal} />
              </ListButton>
            </li>
          ))}
        </ul>
      ) : (
        isSuccess && (
          <div className="h-64 flex flex-col items-center justify-center">
            <BiListUl size={48} className="" />
            <p className="py-2">No proposals</p>
            {type === "Active" && (
              <p className="text-gray-500">Active proposals will appear here</p>
            )}
          </div>
        )
      )}
    </Panel>
  );
}
