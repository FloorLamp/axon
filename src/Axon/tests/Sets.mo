import Array "mo:base/Array";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import TrieSet "mo:base/TrieSet";

import M "mo:matchers/Matchers";
import Suite "mo:matchers/Suite";
import T "mo:matchers/Testable";

let a = TrieSet.fromArray<Nat>([1, 3], Hash.hash, Nat.equal);
let b = TrieSet.fromArray<Nat>([2, 3], Hash.hash, Nat.equal);

let suite = Suite.suite("TrieSet", [
  Suite.test("diff",
    TrieSet.toArray(TrieSet.diff(a, b, Nat.equal)),
    M.equals(T.array<Nat>(T.natTestable, [1]))
  ),
]);
Suite.run(suite);
