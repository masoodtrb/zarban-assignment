export function isAbortError(
  err: unknown
): err is DOMException & { name: "AbortError" } {
  return err instanceof DOMException && err.name === "AbortError";
}
