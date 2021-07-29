import React from "react";
import AxonDetails from "../../../components/Axon/AxonDetails";
import Breadcrumbs from "../../../components/Navigation/Breadcrumbs";
import Neurons from "../../../components/Neuron/Neurons";
import NnsProposals from "../../../components/NnsProposal/NnsProposals";
import Proposals from "../../../components/Proposal/Proposals";
import useAxonId from "../../../lib/hooks/useAxonId";

export default function AxonPage() {
  const id = useAxonId();
  return (
    <>
      <Breadcrumbs path={[{ path: `axon/${id}`, label: `Axon ${id}` }]} />
      <div className="flex flex-col gap-8">
        <AxonDetails />

        <Neurons />

        <Proposals />

        <NnsProposals />
      </div>
    </>
  );
}
