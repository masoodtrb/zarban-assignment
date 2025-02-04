function mapObjectValues<T, U>(
  obj: Record<string, T>,
  callback: (value: T, key: string) => U
): Record<string, U> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[key] = callback(obj[key], key);
      return acc;
    },
    {} as Record<string, U>
  );
}

export default mapObjectValues;
