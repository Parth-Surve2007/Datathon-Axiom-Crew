export * from './api';

// ─── Utility Types ─────────────────────────────────────────────────────────────
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
export type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };

// ─── Repository Result Types ───────────────────────────────────────────────────
export interface FindManyResult<T> {
  data: T[];
  total: number;
}

// ─── Service Result with error ─────────────────────────────────────────────────
export type ServiceResult<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): ServiceResult<T> => ({ ok: true, value });
export const fail = <E extends Error>(error: E): ServiceResult<never, E> => ({
  ok: false,
  error,
});
