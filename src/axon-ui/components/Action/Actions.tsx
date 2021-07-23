import React, { useState } from "react";
import { BiListUl } from "react-icons/bi";
import {
  useAllActions,
  usePendingActions,
} from "../../lib/hooks/Axon/useActions";
import NavButtons from "../Buttons/NavButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import ErrorAlert from "../Labels/ErrorAlert";
import { ActionDetails } from "./ActionDetails";

const ProposalTypes = ["Pending", "All"] as const;
type ProposalType = typeof ProposalTypes[number];

export default function Actions() {
  const activeActionsQuery = usePendingActions();
  const allActionsQuery = useAllActions();
  const [type, setType] = useState<ProposalType>(ProposalTypes[0]);

  const { data, error, isFetching } =
    type === "Pending" ? activeActionsQuery : allActionsQuery;

  const handleRefresh = () => {
    activeActionsQuery.refetch();
    allActionsQuery.refetch();
  };

  const renderTabValue = (t: ProposalType) =>
    t === "Pending" ? (
      <span>
        {t}
        {activeActionsQuery.data?.length > 0 && (
          <span className="ml-2 bg-gray-200 rounded-full text-xs px-2 py-0.5 leading-none text-indigo-500">
            {activeActionsQuery.data.length}
          </span>
        )}
      </span>
    ) : (
      <div className="w-10 text-center">{t}</div>
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
      {error && (
        <div className="px-4">
          <ErrorAlert>{error}</ErrorAlert>
        </div>
      )}
      {data && data.length > 0 ? (
        <ul className="divide-y divide-gray-300">
          {data.map((action) => (
            <li key={action.id.toString()}>
              <ActionDetails action={action} defaultOpen={type === "Pending"} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center">
          <BiListUl size={48} className="" />
          <p className="py-2">No actions</p>
          {type === "Pending" && (
            <p className="text-gray-500">Pending actions will appear here</p>
          )}
        </div>
      )}
    </section>
  );
}
