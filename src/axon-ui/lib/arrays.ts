export function groupBy<T>(
  xs: T[],
  key: string | ((x: any) => string)
): Record<string, T[]> {
  return xs.reduce((g, x) => {
    const val = typeof key === "function" ? key(x) : x[key];
    if (!g[val]) g[val] = [];
    g[val].push(x);
    return g;
  }, {});
}

export const groupByArray = <T>(xs: T[], key: string) =>
  Object.entries(groupBy(xs, key));
