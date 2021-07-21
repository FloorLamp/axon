import classNames from "classnames";
import React from "react";
import { StatusKey } from "../../lib/types";

export default function StatusLabel({ status }: { status: StatusKey }) {
  return (
    <label
      className={classNames(
        "block w-16 text-center py-0.5 rounded text-xs uppercase",
        {
          "bg-green-300 text-green-700":
            status === "Active" ||
            status === "Accepted" ||
            status === "Executed",
          "bg-red-300 text-red-700": status === "Rejected",
          "bg-gray-300 text-gray-700": status === "Expired",
        }
      )}
    >
      {status}
    </label>
  );
}
