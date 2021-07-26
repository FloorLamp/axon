import React from "react";
import { stringify } from "../../lib/utils";
import ErrorAlert from "./ErrorAlert";

export default function ResponseError({ children }) {
  let display = children;
  if (children instanceof Error) {
    display = stringify(children);
  }
  return (
    <ErrorAlert>
      <pre className="text-xs whitespace-pre-wrap break-all">{display}</pre>
    </ErrorAlert>
  );
}
