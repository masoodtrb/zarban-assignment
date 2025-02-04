import { DependencyList, useEffect } from 'react';
import { useAsyncEffect } from './useAsyncEffect';
import { useMethods } from './useMethod';
import { RequestConfig, FetchResponseType } from '../baseApi';
import { HttpException } from '../exceptions/httpException';

export interface QueryLoading<T> {
  loading: true;
  err: undefined;
  data: T | undefined;
}

export interface QueryErrored<T> {
  loading: false;
  err: HttpException;
  data: T | undefined;
}

export interface QuerySuccess<T> {
  loading: false;
  err: undefined;
  data: T;
}

export type QueryResult<T> =
  | QueryLoading<T>
  | QueryErrored<T>
  | QuerySuccess<T>;

export type MutationResult<T> = { mutate(): void } & QueryResult<T>;

type State<T> = QueryResult<T>;

const initialState = {
  loading: false,
  err: undefined,
  data: undefined,
} as const;

function getInitialState<T>(): State<T> {
  return initialState;
}

function createMethods<T>(state: State<T>) {
  return {
    start() {
      return { ...state, loading: true, err: undefined } as QueryLoading<T>;
    },
    error(err: unknown) {
      return { ...state, loading: false, err } as QueryErrored<T>;
    },
    success(result: T) {
      return {
        loading: false,
        err: undefined,
        data: { ...result },
      } as QuerySuccess<T>;
    },
  };
}
export function useQuery<T, M extends 'GET' | 'DELETE'>(
  requestFunction: <R>(
    path: string,
    config: RequestConfig<M>
  ) => Promise<
    FetchResponseType<
      R extends string | number | boolean ? string | number | boolean : R
    >
  >,
  path: string,
  config: RequestConfig<M>,
  deps: DependencyList = []
): QueryResult<FetchResponseType<T>> {
  const [state, methods] = useMethods(
    createMethods,
    getInitialState<FetchResponseType<T>>()
  );

  useAsyncEffect(async (signal) => {
    methods.start();
    try {
      const result = await requestFunction<T>(path, { ...config, signal });
      if (!signal.aborted) {
        methods.success(result); // Ensure only the `result` field is stored in `data`
      }
    } catch (err) {
      if (!signal.aborted) {
        methods.error(err);
      }
    }
  }, deps);

  return state;
}

export function useMutation<T, M extends 'POST' | 'PUT'>(
  requestFunction: <R>(
    path: string,
    config: RequestConfig<M>
  ) => Promise<
    FetchResponseType<
      R extends string | number | boolean ? string | number | boolean : R
    >
  >,
  path: string,
  config: RequestConfig<M>,
  deps: DependencyList = []
): MutationResult<FetchResponseType<T>> & { mutate: () => void } {
  const [state, methods] = useMethods(
    createMethods,
    getInitialState<FetchResponseType<T>>()
  );

  const mutate = () => {
    methods.start();
    const controller = new AbortController();

    requestFunction<T>(path, { ...config, signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) {
          methods.success(result); // Extract only the `result` field
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          methods.error(err);
        }
      });
  };

  // Cleanup for aborting requests
  useEffect(() => {
    const controller = new AbortController();
    return () => {
      controller.abort();
    };
  }, deps);

  return { ...state, mutate };
}
