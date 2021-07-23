import classNames from "classnames";
import React from "react";
import { GrRefresh } from "react-icons/gr";

export function RefreshButton({
  isFetching,
  onClick,
  title,
}: {
  isFetching: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <GrRefresh
      className={classNames("opacity-50", {
        "cursor-pointer filter hover:drop-shadow hover:opacity-100 transition-all":
          !isFetching,
        "inline-block animate-spin": isFetching,
      })}
      onClick={isFetching ? undefined : onClick}
      title={title}
    />
  );
}
