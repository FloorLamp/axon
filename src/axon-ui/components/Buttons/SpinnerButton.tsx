import classNames from "classnames";
import React, { MouseEventHandler, ReactNode } from "react";
import { CgSpinner } from "react-icons/cg";

const SpinnerButton = ({
  isLoading,
  className,
  onClick,
  children,
}: {
  isLoading?: boolean;
  className?: string;
  onClick?: MouseEventHandler;
  children: ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "p-2 bg-gray-200 rounded hover:shadow-md transition-shadow transition-300 leading-none inline-flex items-center justify-center",
        className
      )}
      disabled={isLoading}
    >
      {isLoading ? (
        <CgSpinner className="inline-block animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

export default SpinnerButton;
