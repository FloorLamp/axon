import { DateTime } from "luxon";
import React from "react";

export function TimestampLabel({
  dt,
  showRelative = true,
}: {
  dt: DateTime;
  showRelative?: boolean;
}) {
  return (
    <>
      {dt.toUTC().toLocaleString({
        ...DateTime.DATETIME_FULL_WITH_SECONDS,
        hour12: false,
      })}
      {showRelative && ` (${dt.toRelative()})`}
    </>
  );
}
