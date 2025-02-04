import { DependencyList, useEffect } from 'react';
import { isAbortError } from '../isAbortError';

type Destructor = () => void;

/**
 * `fn` during its' execution should check for cancelRef value and abort early if it's true.
 */
export function useAsyncEffect(
  fn: (signal: AbortSignal) => Promise<void | Destructor>,
  deps?: DependencyList
) {
  useAsyncEffectF((bind, signal) => fromPromise(fn(signal)), deps);
}

export type FunctorAbort<a = unknown> = Promise<
  | {
      aborted: true;
      cleanups?: Destructor[];
      err?: unknown;
    }
  | {
      aborted: false;
      cleanups?: Destructor[];
      result: a;
    }
>;
export type Bind = <a, b>(
  fn: (x: a) => FunctorAbort<b>
) => (elevatedX: FunctorAbort<a>) => FunctorAbort<b>;

const fromError = <a>(err: unknown): FunctorAbort<a> =>
  Promise.resolve({
    aborted: true,
    err,
  });

const makeBind: (signal: AbortSignal) => Bind =
  (signal: AbortSignal) =>
  <a, b>(fn: (x: a) => FunctorAbort<b>) =>
  async (elevatedX: FunctorAbort<a>): FunctorAbort<b> => {
    const x = await elevatedX;
    if (x.aborted) return x;
    if (signal.aborted) {
      return {
        aborted: true,
        cleanups: x.cleanups,
      };
    }
    const y = await fn(x.result).catch(fromError<b>);
    return {
      ...y,
      cleanups: y.cleanups?.length
        ? x.cleanups?.length
          ? [...x.cleanups, ...y.cleanups]
          : y.cleanups
        : x.cleanups,
    };
  };

/**
 * "Fancy" functional programming style implementation for useAsyncEffect with cancellation built into FunctorAbort.
 */
export function useAsyncEffectF(
  fn: (bind: Bind, signal: AbortSignal) => FunctorAbort,
  deps?: DependencyList
) {
  useEffect(() => {
    const controller = new AbortController();

    const bind = makeBind(controller.signal);
    const promise = fn(bind, controller.signal);
    return () => {
      controller.abort(new Error('dependencies changed'));
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      promise.then((r) => {
        if (r.aborted && r.err !== undefined && !isAbortError(r.err)) {
          console.error(r.err);
        }

        const revCleanups = r.cleanups ? r.cleanups.reverse() : [];
        // last cleanup should be executed first
        for (const cleanup of revCleanups) {
          cleanup();
        }
      });
    };
  }, deps);
}

export const fromValue = <a>(x: a): FunctorAbort<a> =>
  Promise.resolve({
    aborted: false,
    cleanups: [],
    result: x,
  });

export const fromPromise = <a>(x: Promise<a>): FunctorAbort<a> =>
  x.then(fromValue, fromError<a>);
