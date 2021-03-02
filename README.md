# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding window.

- Higher x2.0 hit rate of LRU.
- Slower x0.5 of [lru-cache](https://www.npmjs.com/package/lru-cache).

## API

```ts
export interface CacheOptions<K, V = undefined> {
  readonly space?: number;
  readonly disposer?: (key: K, value: V) => void;
  readonly capture?: {
    readonly delete?: boolean;
    readonly clear?: boolean;
  };
}

export class Cache<K, V = undefined> {
  constructor(
    capacity: number,
    opts: CacheOptions<K, V> = {},
  );
  put(key: K, value: V, size?: number): boolean;
  set(key: K, value: V, size?: number): this;
  get(key: K): V | undefined;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  length: number;
  size: number;
  *[Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
```
