export const compact = <T>(collection: (T | undefined)[]) =>
  Array.from(new Set(collection)).filter((value): value is T => Boolean(value));

export const uniqueByProperty = <T, K extends keyof T>(arr: T[], property: K): T[] => {
  const uniqueValues = new Set<T[K]>();
  return arr.filter(obj => {
    if (uniqueValues.has(obj[property])) return false;
    uniqueValues.add(obj[property]);
    return true;
  });
};

export const forEachChunkedAsync = async <T>(
  array: T[],
  chunkSize: number,
  callbackFn: (chunk: T[]) => Promise<void>
) => {
  const arrayLength = array.length;
  let startIndex = 0;
  while (startIndex < arrayLength) {
    const endIndex = Math.min(startIndex + chunkSize, arrayLength);
    const chunk = array.slice(startIndex, endIndex);
    await callbackFn(chunk);
    startIndex = endIndex;
  }
};
