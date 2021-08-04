import classNames from "classnames";
import Link from "next/link";
import React, { Fragment } from "react";
import { FaChevronRight } from "react-icons/fa";

export type Path = { path: string; label: string };

const join = (path: Path[]) => {
  let acc = "";
  return path.map((p) => {
    acc += `/${p.path}`;
    return { ...p, url: acc };
  });
};

export default function Breadcrumbs({ path }: { path: Path[] }) {
  const count = path.length;
  const joined = join(path);

  return (
    <div className="flex items-center gap-2 py-4 overflow-hidden">
      <Link href="/">
        <a
          className={classNames({
            "opacity-50 hover:opacity-100 transition-opacity": path.length > 0,
          })}
        >
          Home
        </a>
      </Link>
      {joined.map((item, i) => (
        <Fragment key={i}>
          <FaChevronRight className="opacity-20 flex-none" />
          {i === count - 1 ? (
            <span className="whitespace-nowrap overflow-hidden overflow-ellipsis">
              {item.label}
            </span>
          ) : (
            <Link href={item.url}>
              <a className="opacity-50 hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.label}
              </a>
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}
