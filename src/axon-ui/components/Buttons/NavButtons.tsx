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
    <ul className="flex gap-1 border-b border-gray-300 text-sm">
      {values.map((value) => (
        <li
          key={value}
          className={classNames(
            "px-3 py-1 cursor-pointer hover:border-indigo-500 hover:border-b-2 transition-all duration-75",
            {
              "border-b-2 border-indigo-500 text-indigo-500":
                value === selected,
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
