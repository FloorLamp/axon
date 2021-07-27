import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import TrieSet "mo:base/TrieSet";

import Arr "./Array";
import T "./Types";

module {
  public func _countVotes(ballots: [T.Ballot]): T.Votes {
    Array.foldLeft<T.Ballot, T.Votes>(
      ballots, { yes = 0; no = 0; notVoted = 0}, func(sums, {vote; votingPower}) {
        if (vote == ?#Yes) {
          { yes = sums.yes + votingPower; no = sums.no; notVoted = sums.notVoted }
        } else if (vote == ?#No) {
          { yes = sums.yes; no = sums.no + votingPower; notVoted = sums.notVoted }
        } else {
          { yes = sums.yes; no = sums.no; notVoted = sums.notVoted + votingPower }
        }
      }
    );
  };

  // Applies a status like Accepted, Rejected or Expired based on current conditions
  public func _applyNewStatus(proposal: T.AxonProposal): T.AxonProposal {
    let now = Time.now();
    _applyNewStatusWithTime(proposal, now);
  };

  public func _applyNewStatusWithTime(proposal: T.AxonProposal, now: Int): T.AxonProposal {
    switch (currentStatus(proposal.status)) {
      case (#Created(_)) {
        if (now >= proposal.timeStart) {
          // Activate voting and check ballots
          return _applyNewStatusWithTime({
            id = proposal.id;
            totalVotes = proposal.totalVotes;
            ballots = proposal.ballots;
            timeStart = proposal.timeStart;
            timeEnd = proposal.timeEnd;
            creator = proposal.creator;
            proposal = proposal.proposal;
            status = Array.append(proposal.status, [#Active(now)]);
            policy = proposal.policy;
          }, now)
        } else {
          return proposal;
        }
      };
      case (#Active(_)) {};
      case _ {
        return proposal;
      }
    };

    let { yes; no; notVoted } = proposal.totalVotes;
    let totalVotingPower = yes + no + notVoted;

    // First, calculate quorum if required, and the absolute threshold
    let (quorumVotes, absoluteThresholdVotes) = switch (proposal.policy.acceptanceThreshold) {
      case (#Percent({ percent; quorum })) {
        switch (quorum) {
          case (?quorum_) {
            let quorumVotes = percentOf(quorum_, totalVotingPower);
            (quorumVotes, percentOf(percent, quorumVotes))
          };
          case _ { (0, percentOf(percent, totalVotingPower)) };
        }
      };
      case (#Absolute(amount)) { (0, amount) };
    };
    Debug.print("totalVotes: " # debug_show(proposal.totalVotes) # " quorumVotes: " # debug_show(quorumVotes) # " absoluteThresholdVotes: " # debug_show(absoluteThresholdVotes));
    let maybeNewStatus = if (yes >= absoluteThresholdVotes and (yes + no) >= quorumVotes) {
      // Accept if we have exceeded the absolute threshold
      ?[#Accepted(now)];
    } else {
      switch (proposal.policy.acceptanceThreshold) {
        case (#Percent({ percent; quorum })) {
          if (now >= proposal.timeEnd) {
            // Voting has ended, accept if yes votes exceed the required threshold
            let totalVotes = no + yes;
            let thresholdOfVoted = percentOf(percent, totalVotes);
            Debug.print("thresholdOfVoted: " # debug_show(thresholdOfVoted));
            if (totalVotes >= quorumVotes and yes >= thresholdOfVoted) {
              ?[#Accepted(now)];
            } else {
              ?[#Expired(now)];
            }
          } else if (absoluteThresholdVotes > yes + notVoted) {
            // Reject if we cannot reach the absolute threshold
            ?[#Rejected(now)];
          } else {
            null
          }
        };
        case _ {
          if (absoluteThresholdVotes > yes + notVoted) {
            // Reject if we cannot reach the absolute threshold
            ?[#Rejected(now)];
          } else if (now >= proposal.timeEnd) {
            ?[#Expired(now)];
          } else {
            null
          }
        }
      }
    };
    {
      id = proposal.id;
      totalVotes = proposal.totalVotes;
      ballots = proposal.ballots;
      timeStart = proposal.timeStart;
      timeEnd = proposal.timeEnd;
      creator = proposal.creator;
      proposal = proposal.proposal;
      status = Array.append(proposal.status, Option.get(maybeNewStatus, []));
      policy = proposal.policy;
    }
  };

  // If proposal is accepted and conditions are met, return it with status Executing
  public func _applyExecutingStatusConditionally(proposal: T.AxonProposal, conditions: Bool) : T.AxonProposal {
    switch (currentStatus(proposal.status), conditions) {
      case (#Accepted(_), true) {
        {
          id = proposal.id;
          totalVotes = proposal.totalVotes;
          ballots = proposal.ballots;
          timeStart = proposal.timeStart;
          timeEnd = proposal.timeEnd;
          creator = proposal.creator;
          proposal = proposal.proposal;
          status = Array.append(proposal.status, [#Executing(Time.now())]);
          policy = proposal.policy;
        };
      };
      case _ { proposal }
    };
  };

  public func _applyAxonCommand(axon: T.AxonFull, request: T.AxonCommandRequest) : T.Result<T.AxonFull> {
    switch(request) {
      case (#SetPolicy(policy)) {
        switch (policy.proposers) {
          case (#Closed(current)) {
            if (current.size() == 0) {
              return #err(#CannotExecute);
            };
          };
          case _ {}
        };
        #ok({
          id = axon.id;
          proxy = axon.proxy;
          name = axon.name;
          visibility = axon.visibility;
          supply = axon.supply;
          ledger = axon.ledger;
          policy = policy;
          neurons = axon.neurons;
          allProposals = axon.allProposals;
          activeProposals = axon.activeProposals;
          lastProposalId = axon.lastProposalId;
        })
      };
      case (#SetVisibility(visibility)) {
        #ok({
          id = axon.id;
          proxy = axon.proxy;
          name = axon.name;
          visibility = visibility;
          supply = axon.supply;
          ledger = axon.ledger;
          policy = axon.policy;
          neurons = axon.neurons;
          allProposals = axon.allProposals;
          activeProposals = axon.activeProposals;
          lastProposalId = axon.lastProposalId;
        })
      };
      case (#AddMembers(principals)) {
        switch (axon.policy.proposers) {
          case (#Closed(current)) {
            let diff = Array.filter<Principal>(principals, func(p) {
              not Arr.contains<Principal>(current, p, Principal.equal)
            });
            Debug.print(" diff " # debug_show(diff));
            #ok({
              id = axon.id;
              proxy = axon.proxy;
              name = axon.name;
              visibility = axon.visibility;
              supply = axon.supply;
              ledger = axon.ledger;
              policy = {
                // set to current + diff
                proposers = #Closed(Array.append(current, diff));
                proposeThreshold = axon.policy.proposeThreshold;
                acceptanceThreshold = axon.policy.acceptanceThreshold;
              };
              neurons = axon.neurons;
              allProposals = axon.allProposals;
              activeProposals = axon.activeProposals;
              lastProposalId = axon.lastProposalId;
            })

          };
          case _ {
            #err(#InvalidProposal);
          }
        }
      };
      case (#RemoveMembers(principals)) {
        switch (axon.policy.proposers) {
          case (#Closed(current)) {
            let diff = Array.filter<Principal>(current, func(c) {
              not Arr.contains<Principal>(principals, c, Principal.equal)
            });
            if (diff.size() == 0) {
              return #err(#CannotExecute)
            };

            #ok({
              id = axon.id;
              proxy = axon.proxy;
              name = axon.name;
              visibility = axon.visibility;
              supply = axon.supply;
              ledger = axon.ledger;
              policy = {
                proposers = #Closed(diff);
                proposeThreshold = axon.policy.proposeThreshold;
                acceptanceThreshold = axon.policy.acceptanceThreshold;
              };
              neurons = axon.neurons;
              allProposals = axon.allProposals;
              activeProposals = axon.activeProposals;
              lastProposalId = axon.lastProposalId;
            })

          };
          case _ {
            #err(#InvalidProposal);
          }
        }
      };
      case (#Redenominate(params)) {
        Prelude.nyi()
      }
    };
  };

  func percentOf(percent: Nat, n: Nat): Nat { (percent * n) / 100_000_000 };

  public func currentStatus(s: [T.Status]): T.Status {
    s[s.size() - 1]
  };
}
