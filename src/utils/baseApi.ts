import { HttpException, HttpExceptionOptions } from './exeptions/httpException';
import mapObjectValues from './mapObjectValues';

export const baseApi = 'https://jsonplaceholder.typicode.com';

type MethodType = 'GET' | 'POST' | 'PUT' | 'DELETE';

type BodyType<M extends MethodType> = M extends 'POST' | 'PUT'
  ? Record<string, unknown> | FormData | null
  : never;

export type UrlQueryType =
  | string[][]
  | Record<string, string | number | boolean>
  | string
  | URLSearchParams;

export type RequestConfig<M extends MethodType> = {
  method: M;
  query?: UrlQueryType;
  body?: BodyType<M>;
  signal?: AbortSignal;
} & Omit<RequestInit, 'body' | 'method'>;

export const makePath = (path: string, query?: UrlQueryType) => {
  const queryString = query
    ? `?${new URLSearchParams(mapObjectValues(query as Record<string, string | number | boolean>, (value) => `${value}`)).toString()}`
    : '';
  return `${baseApi}${path}${queryString}`;
};
export interface FetchResponseType<T> {
  result: T;
  err: unknown;
  statusCode: number;
}
export const makeRequest = async <
  T,
  M extends MethodType = 'GET',
  E extends HttpExceptionOptions = HttpExceptionOptions,
  R = T extends string | number | boolean ? string | number | boolean : T,
>(
  path: string,
  config: RequestConfig<M>
): Promise<FetchResponseType<R>> => {
  const { method, query, body, signal, ...init } = config;

  const headers: HeadersInit = {
    ...init.headers,
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
  };

  if ((method === 'GET' || method === 'DELETE') && body !== undefined) {
    throw new TypeError(`Method ${method} does not support a body.`);
  }

  const requestBody =
    body instanceof FormData ? body : body ? JSON.stringify(body) : undefined;

  try {
    const res = await fetch(makePath(path, query), {
      ...init,
      method,
      body: requestBody,
      signal,
      headers,
    });

    if (!res.ok) {
      return Promise.reject(
        new HttpException(`HTTP Response Code: ${res?.status}`, {
          description: `Status code of response of the request is ${res?.status} and it means this request has error.`,
          statusCode: res.status,
          data: (await res.json()) ?? null
        })
      );
    }

    const contentType = res.headers.get('Content-Type') ?? '';
    if (contentType.includes('application/json')) {
      const json = (await res.json()) as R;
      return {
        result: json,
        err: null,
        statusCode: res.status,
      };
    }

    const text = await res.text();
    try {
      const parsed = JSON.parse(text) as R;
      return {
        result: parsed,
        err: null,
        statusCode: res.status,
      };
    } catch {
      return {
        result: text as R,
        err: null,
        statusCode: res.status,
      };
    }
  } catch (error) {
    if (signal?.aborted) {
      throw new HttpException('Request was aborted', {
        description: 'The request may have been called several times in a row.',
      });
    }
    throw error;
  }
};

export const useInterceptedRequest = () => {
  return async <T, M extends MethodType>(
    path: string,
    config: RequestConfig<M>
  ): Promise<
    FetchResponseType<
      T extends string | number | boolean ? string | number | boolean : T
    >
  > => {
    const updatedConfig = {
      ...config,
      headers: {
        ...config.headers,
      },
    };

    try {
      return await makeRequest<
        T,
        M,
        HttpExceptionOptions,
        T extends string | number | boolean ? string | number | boolean : T
      >(path, updatedConfig as RequestConfig<M>);
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  };
};
