import classNames from "classnames";
import React from "react";

export default function NavButtons({
  values,
  selected,
  onChange,
}: {
  values: readonly string[];
  selected: string;
  onChange: (string) => void;
}) {
  return (
    <ul className="flex gap-2">
      {values.map((value) => (
        <li
          key={value}
          className={classNames(
            "px-4 py-1 rounded cursor-pointer hover:bg-indigo-200 transition-colors transition-300",
            {
              "bg-indigo-200 text-indigo-500": value === selected,
            }
          )}
          onClick={() => onChange(value)}
        >
          {value}
        </li>
      ))}
    </ul>
  );
}
