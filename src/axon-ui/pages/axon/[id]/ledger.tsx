import React from "react";
import Ledger from "../../../components/Ledger/Ledger";
import Breadcrumbs from "../../../components/Navigation/Breadcrumbs";
import useAxonId from "../../../lib/hooks/useAxonId";

export default function LedgerPage() {
  const id = useAxonId();
  return (
    <>
      <Breadcrumbs
        path={[
          { path: `axon/${id}`, label: `Axon ${id}` },
          { path: "ledger", label: "Ledger" },
        ]}
      />
      <div className="pt-4">
        <Ledger />
      </div>
    </>
  );
}
