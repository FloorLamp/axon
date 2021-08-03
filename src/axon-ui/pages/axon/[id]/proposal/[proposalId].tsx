import { useRouter } from "next/dist/client/router";
import React from "react";
import { ProposalDetails } from "../../../../components/Proposal/ProposalDetails";

export default function ProposalPage() {
  const router = useRouter();
  const { proposalId } = router.query as { proposalId: string };

  return <ProposalDetails proposalId={proposalId} />;
}
