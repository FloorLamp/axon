import React, { ReactNode } from "react";

export const DataRow = ({
  label,
  children,
  emptyValue = <span className="text-gray-400">-</span>,
  labelClassName,
}: {
  label: ReactNode;
  children?: ReactNode;
  emptyValue?: ReactNode;
  labelClassName?: string;
}) => {
  return (
    <div className="xs:flex">
      <div className={labelClassName}>
        <div className="flex h-5 items-center text-gray-500 text-xs uppercase leading-none">
          {label}
        </div>
      </div>
      <div className="flex-1 leading-tight">{children || emptyValue}</div>
    </div>
  );
};
export const DataTable = ({
  label,
  children,
  labelClassName = "font-bold",
}: {
  label?: ReactNode;
  children?: ReactNode;
  labelClassName?: string;
}) => {
  return (
    <div className="flex flex-col xs:gap-0 gap-1">
      {label && <div className={labelClassName}>{label}</div>}
      {children}
    </div>
  );
};
