import React, { useState } from "react";
import { BiListUl } from "react-icons/bi";
import { CgSpinner } from "react-icons/cg";
import { useActiveProposals, useAllProposals } from "../lib/hooks/useProposals";
import NavButtons from "./Buttons/NavButtons";
import { Proposal } from "./Proposal/Proposal";

const ProposalTypes = ["Active", "All"] as const;

export default function Proposals() {
  const activeProposalsQuery = useActiveProposals();
  const allProposalsQuery = useAllProposals();
  const [type, setType] = useState<typeof ProposalTypes[number]>(
    ProposalTypes[0]
  );

  const { data, error, isFetching } =
    type === "Active" ? activeProposalsQuery : allProposalsQuery;

  return (
    <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="grid xs:grid-cols-3 gap-2 items-center mb-2">
        <div>
          <h2 className="text-xl font-bold">Proposals</h2>
          {isFetching && <CgSpinner className="inline-block animate-spin" />}
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
              <li key={p.id.toString()} className="py-2">
                <Proposal proposal={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center">
            <BiListUl size={48} className="" />
            <p className="py-2">No proposals</p>
            {type === "Active" && (
              <p className="text-gray-500">Active proposals will appear here</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
