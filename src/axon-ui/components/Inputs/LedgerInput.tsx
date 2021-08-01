import { del, get, set } from "object-path-immutable";
import React from "react";
import { BiMinus, BiPlus } from "react-icons/bi";

const DELETE_ITEM = Symbol("DELETE_ITEM");

export type LedgerItem = {
  id: string;
  amount: string;
};

export const LedgerInput = ({
  values,
  onChange,
}: {
  values: LedgerItem[];
  onChange: (value: LedgerItem[]) => void;
}) => {
  const handleInput = (value: any, path: Path) => {
    const newValues =
      value === DELETE_ITEM ? del(values, path) : set(values, path, value);
    console.log({ newValues });

    onChange(newValues);
  };

  return (
    <>
      <ul className="flex flex-col gap-1">
        <li className="flex items-stretch gap-1">
          <span className="w-8" />
          <label className="pl-3 flex-1">Principal ID</label>
          <label className="pl-3 flex-1">Amount</label>
        </li>
        {values.map((_, i) => (
          <li className="flex items-center gap-1" key={i}>
            <button
              type="button"
              className="w-8 py-2 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800"
              onClick={(e) => {
                e.preventDefault();
                handleInput(DELETE_ITEM, [i]);
              }}
            >
              <BiMinus />
            </button>
            <input
              type="text"
              className="flex-1"
              placeholder="Principal"
              maxLength={64}
              onChange={(e) => handleInput(e.target.value, [i, "id"])}
              value={get<any>(values, [i, "id"])}
              required
            />
            <input
              type="number"
              className="flex-1"
              placeholder="Amount"
              min={0}
              onChange={(e) => handleInput(e.target.value, [i, "amount"])}
              value={get<any>(values, [i, "amount"])}
              required
            />
          </li>
        ))}
        <li className="flex items-center gap-2">
          <button
            type="button"
            className="w-8 py-2 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800"
            onClick={(e) => {
              e.preventDefault();
              handleInput({ id: "", amount: "" }, [values.length]);
            }}
          >
            <BiPlus />
          </button>
          <label>Add item</label>
        </li>
      </ul>
    </>
  );
};
