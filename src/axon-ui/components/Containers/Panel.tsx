import classNames from "classnames";
import { ReactNode } from "react";

export default function Panel({
  className = "p-4",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className={classNames("bg-gray-50 rounded-lg shadow-lg", className)}
    >
      {children}
    </section>
  );
}
