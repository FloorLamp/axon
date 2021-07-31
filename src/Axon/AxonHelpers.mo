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
          Debug.print("Proposal " # debug_show(proposal.id) # " new status=" # debug_show(#Active(now)));
          return _applyNewStatusWithTime(
            withNewStatus(proposal, #Active(now)),
            now
          )
        } else {
          return proposal;
        }
      };
      case (#Active(_)) {};
      case _ {
        return proposal;
      }
    };

    // If proposal is active: Count votes and update status if needed

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
    // Debug.print("totalVotes: " # debug_show(proposal.totalVotes) # " quorumVotes: " # debug_show(quorumVotes) # " absoluteThresholdVotes: " # debug_show(absoluteThresholdVotes));
    let maybeNewStatus = if (yes >= absoluteThresholdVotes and (yes + no) >= quorumVotes) {
      // Accept if we have exceeded the absolute threshold
      ?(#Accepted(now));
    } else {
      switch (proposal.policy.acceptanceThreshold) {
        case (#Percent({ percent; quorum })) {
          if (now >= proposal.timeEnd) {
            // Voting has ended, accept if yes votes exceed the required threshold
            let totalVotes = no + yes;
            let thresholdOfVoted = percentOf(percent, totalVotes);
            if (totalVotes >= quorumVotes and yes >= thresholdOfVoted) {
              ?(#Accepted(now));
            } else {
              ?(#Expired(now));
            }
          } else if (absoluteThresholdVotes > yes + notVoted) {
            // Reject if we cannot reach the absolute threshold
            ?(#Rejected(now));
          } else {
            // Voting still active
            null
          }
        };
        case _ {
          // We don't need to check for Accept here, since that is always checked immediately after voting
          if (absoluteThresholdVotes > yes + notVoted) {
            // Reject if we cannot reach the absolute threshold
            ?(#Rejected(now));
          } else if (now >= proposal.timeEnd) {
            ?(#Expired(now));
          } else {
            // Voting still active
            null
          }
        }
      }
    };
    switch (maybeNewStatus) {
      case (?status) {
        Debug.print("Proposal " # debug_show(proposal.id) # " new status=" # debug_show(status));
        withNewStatus(proposal, status);
      };
      case _ { proposal }
    };
  };

  // If proposal is accepted and conditions are met, return it with status ExecutionQueued
  public func _applyExecutingStatusConditionally(proposal: T.AxonProposal, conditions: Bool) : T.AxonProposal {
    switch (currentStatus(proposal.status), conditions) {
      case (#Accepted(_), true) {
        withNewStatus(proposal, #ExecutionQueued(Time.now()));
      };
      case _ { proposal }
    };
  };

  public func withNewStatus(proposal: T.AxonProposal, status: T.Status): T.AxonProposal {
    {
      id = proposal.id;
      totalVotes = proposal.totalVotes;
      ballots = proposal.ballots;
      timeStart = proposal.timeStart;
      timeEnd = proposal.timeEnd;
      creator = proposal.creator;
      proposal = proposal.proposal;
      status = Array.append(proposal.status, [status]);
      policy = proposal.policy;
    }
  };

  public func isCancellable(s: T.Status): Bool {
    switch (s) {
      case (#Created(_)) { true };
      case (#Active(_)) { true };
      case _ { false };
    }
  };

  public func currentStatus(s: [T.Status]): T.Status {
    s[s.size() - 1]
  };

  func percentOf(percent: Nat, n: Nat): Nat { (percent * n) / 100_000_000 };

  public func scaleByFraction(n: Nat, numerator: Nat, denominator: Nat): Nat {
    n * numerator / denominator
  };
}
