import React from "react";
import { CgSpinner } from "react-icons/cg";
import { useActiveProposals } from "../lib/hooks/useActiveProposals";
import { Proposal } from "./Proposal/Proposal";

export default function ActiveProposals() {
  const { data, error, isFetching } = useActiveProposals();

  return (
    <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="flex gap-2 items-center mb-2">
        <h2 className="text-xl font-bold">Active Proposals</h2>
        {isFetching && <CgSpinner className="inline-block animate-spin" />}
      </div>
      {error}
      {data.length > 0 ? (
        <ul className="divide-y divide-gray-300">
          {data.map((p) => (
            <li key={p.id.toString()} className="py-2">
              <Proposal proposal={p} />
            </li>
          ))}
        </ul>
      ) : (
        "None"
      )}
    </section>
  );
}
