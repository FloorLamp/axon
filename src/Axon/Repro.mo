import GT "./GovernanceTypes";

actor Repro {
  public shared func foo(blob: GT.ProposalInfo) : async () {
    ignore debug_show(blob)
  };
};
