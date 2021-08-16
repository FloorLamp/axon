import classNames from "classnames";
import React, { ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";

export function ListButton({
  open = false,
  disabled = false,
  onClick,
  children,
}: {
  open?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={classNames(
        "group flex items-center px-4 py-2 transition-colors duration-75",
        {
          "hover:bg-gray-100 cursor-pointer": !disabled,
          "border-b border-gray-300": open,
        }
      )}
    >
      <div className="flex-1">{children}</div>
      {!disabled && (
        <div className="hidden xs:block">
          <FiChevronRight
            className={classNames(
              "transform transition-transform duration-75",
              {
                "group-hover:translate-x-1": !open,
                "rotate-90": open,
              }
            )}
          />
        </div>
      )}
    </div>
  );
}
