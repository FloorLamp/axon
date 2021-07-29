import { useRouter } from "next/dist/client/router";
import React from "react";
import Breadcrumbs from "../../../../components/Navigation/Breadcrumbs";
import { ProposalDetails } from "../../../../components/Proposal/ProposalDetails";
import useAxonId from "../../../../lib/hooks/useAxonId";

export default function ProposalPage() {
  const router = useRouter();
  const { proposalId } = router.query as { proposalId: string };
  const id = useAxonId();

  return (
    <>
      <Breadcrumbs
        path={[
          { path: `axon/${id}`, label: `Axon ${id}` },
          { path: `/proposal/${proposalId}`, label: `Proposal ${proposalId}` },
        ]}
      />
      <div className="pt-4">
        <ProposalDetails proposalId={proposalId} />
      </div>
    </>
  );
}
