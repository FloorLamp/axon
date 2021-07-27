export const percentToBigInt = (arg: string | number) =>
  BigInt(Math.floor((Number(arg) / 100) * 1e8));

export const percentFromBigInt = (arg: bigint) => (Number(arg) / 1e8) * 100;
