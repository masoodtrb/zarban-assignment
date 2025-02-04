/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Reducer, useMemo, useReducer } from 'react';

interface Action {
  type: string;
  payload?: any;
}

type CreateMethods<M, T> = (state: T) => {
  [P in keyof M]: (payload?: any) => T;
};

type WrappedMethods<M> = {
  [P in keyof M]: (...payload: any) => void;
};

export const useMethods = <M, T>(
  createMethods: CreateMethods<M, T>,
  initialState: T
): [T, WrappedMethods<M>] => {
  const reducer = useMemo<Reducer<T, Action>>(
    () => (reducerState: T, action: Action) => {
      const methods = createMethods(reducerState);
      return methods[action.type as keyof ReturnType<CreateMethods<M, T>>](
        action.payload
      );
    },
    [createMethods]
  );

  const [state, dispatch] = useReducer(reducer, { ...initialState });

  const wrappedMethods: WrappedMethods<M> = useMemo(() => {
    const actionTypes = Object.keys(createMethods({ ...initialState }));

    return actionTypes.reduce((acc, type) => {
      acc[type as keyof typeof acc] = (payload: any) =>
        dispatch({ type, payload });
      return acc;
    }, {} as WrappedMethods<M>);
  }, [createMethods, initialState]);

  return [state, wrappedMethods];
};
