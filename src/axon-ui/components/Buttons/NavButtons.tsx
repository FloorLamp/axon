import classNames from "classnames";
import React from "react";

export default function NavButtons({
  values,
  selected,
  onChange,
  renderValue,
  itemClassName = "px-3 py-1",
}: {
  values: readonly string[];
  selected: string;
  onChange: (string) => void;
  renderValue?: (string) => JSX.Element;
  itemClassName?: string;
}) {
  return (
    <ul className="flex gap-1 border-b border-gray-300 text-sm">
      {values.map((value) => (
        <li
          key={value}
          className={classNames(
            "cursor-pointer hover:border-indigo-500 hover:border-b-2 transition-all duration-75",
            {
              "border-b-2 border-indigo-500 text-indigo-500":
                value === selected,
            },
            itemClassName
          )}
          onClick={() => onChange(value)}
        >
          {renderValue ? renderValue(value) : value}
        </li>
      ))}
    </ul>
  );
}
