import React from "react";
import AxonDetails from "../../../components/Axon/AxonDetails";
import Panel from "../../../components/Containers/Panel";
import TokenSummary from "../../../components/Ledger/TokenSummary";
import Breadcrumbs from "../../../components/Navigation/Breadcrumbs";
import Neurons from "../../../components/Neuron/Neurons";
import NnsProposals from "../../../components/NnsProposal/NnsProposals";
import Proposals from "../../../components/Proposal/Proposals";
import { useAxonById } from "../../../lib/hooks/Axon/useAxonById";
import useAxonId from "../../../lib/hooks/useAxonId";

export default function AxonPage() {
  const id = useAxonId();
  const { isLoadingError } = useAxonById();

  return (
    <>
      <Breadcrumbs path={[{ path: `axon/${id}`, label: `Axon ${id}` }]} />
      {isLoadingError ? (
        <Panel className="py-16 text-center text-gray-500 text-sm">
          Axon {id} not found
        </Panel>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-8">
            <AxonDetails />
            <TokenSummary />
          </div>

          <Neurons />

          <Proposals />

          <NnsProposals />
        </div>
      )}
    </>
  );
}
