import classNames from "classnames";
import React, { MouseEventHandler, ReactNode } from "react";
import { CgSpinner } from "react-icons/cg";

const SpinnerButton = ({
  isLoading,
  isDisabled,
  className,
  activeClassName = "btn-secondary",
  disabledClassName = "btn-secondary-disabled",
  onClick,
  children,
}: {
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  activeClassName?: string;
  disabledClassName?: string;
  onClick?: MouseEventHandler;
  children: ReactNode;
}) => {
  const disabled = isDisabled || isLoading;
  return (
    <button
      onClick={onClick}
      className={classNames(
        "p-2 rounded-md leading-none inline-flex items-center justify-center",
        {
          [activeClassName]: !disabled,
          [disabledClassName]: disabled,
          "cursor-pointer": !disabled,
          "cursor-not-allowed": disabled,
        },
        className
      )}
      disabled={disabled}
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
