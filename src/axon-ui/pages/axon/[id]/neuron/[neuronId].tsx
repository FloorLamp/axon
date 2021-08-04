import { useRouter } from "next/dist/client/router";
import React from "react";
import Breadcrumbs from "../../../../components/Navigation/Breadcrumbs";
import ManageNeuronModal from "../../../../components/Neuron/ManageNeuronModal";
import NeuronDetails from "../../../../components/Neuron/NeuronDetails";
import useAxonId from "../../../../lib/hooks/useAxonId";

export default function NeuronPage() {
  const router = useRouter();
  const { neuronId } = router.query as { neuronId: string };
  const id = useAxonId();

  return (
    <>
      <div className="xs:flex justify-between items-center">
        <Breadcrumbs
          path={[
            { path: `axon/${id}`, label: `Axon ${id}` },
            { path: `/neuron/${neuronId}`, label: `Neuron ${neuronId}` },
          ]}
        />
        <ManageNeuronModal
          defaultNeuronIds={[neuronId]}
          buttonClassName="btn-cta px-2 py-1"
        />
      </div>

      <div className="pt-4">
        <NeuronDetails neuronId={neuronId} />
      </div>
    </>
  );
}
