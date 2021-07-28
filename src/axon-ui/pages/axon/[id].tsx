import React from "react";
import AxonDetails from "../../components/Axon/AxonDetails";
import Neurons from "../../components/Neuron/Neurons";
import NnsProposals from "../../components/NnsProposal/NnsProposals";
import Proposals from "../../components/Proposal/Proposals";

export default function AxonPage() {
  return (
    <>
      <AxonDetails />

      <Neurons />

      <Proposals />

      <NnsProposals />
    </>
  );
}
