import { Disclosure } from "@headlessui/react";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";

function ListButton({
  open = true,
  disabled = false,
  children,
}: {
  open: boolean;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <Disclosure.Button
      as="div"
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
        <div>
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
    </Disclosure.Button>
  );
}

export default ListButton;
