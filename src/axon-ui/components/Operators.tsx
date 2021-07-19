import React from "react";
import { CgSpinner } from "react-icons/cg";
import { useOperators } from "../lib/hooks/useOperators";

export default function Operators() {
  const { data, error, isFetching } = useOperators();

  return (
    <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="flex gap-2 items-center mb-2">
        <h2 className="text-xl font-bold">Operators</h2>
        {isFetching && <CgSpinner className="inline-block animate-spin" />}
      </div>
      {error}
      {data.length > 0 ? (
        <ul>
          {data.map((p) => (
            <li key={p.toText()}>{p.toText()}</li>
          ))}
        </ul>
      ) : (
        "None"
      )}
    </section>
  );
}
