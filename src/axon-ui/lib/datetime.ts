import { Duration } from "luxon";
import { pluralize } from "./utils";

export const secondsToDuration = (n: number | bigint) => {
  let seconds = n;
  if (typeof seconds === "bigint") {
    seconds = Number(n);
  }
  return formatDuration(
    Duration.fromObject({
      seconds,
    }).shiftTo("years", "months", "days", "hours", "minutes")
  );
};

export const formatDuration = (d: Duration) => {
  const parts = [];
  if (d.years > 0) {
    parts.push(`${d.years} ${pluralize("year", d.years)}`);
  }
  if (d.months > 0) {
    parts.push(`${d.months} ${pluralize("month", d.months)}`);
  }
  if (d.days > 0) {
    parts.push(`${Math.floor(d.days)} ${pluralize("day", d.days)}`);
  }
  if (d.hours > 0) {
    parts.push(`${Math.floor(d.hours)} ${pluralize("hour", d.hours)}`);
  }
  if (d.minutes > 0) {
    parts.push(`${Math.floor(d.minutes)} ${pluralize("minute", d.minutes)}`);
  }
  return parts.join(", ");
};
