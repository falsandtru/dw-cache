# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Performance comparison

### Hit rate

Higher x0.9-2.7 hit rate of LRU.

```
'Cache even 100'
'LRU hit rate', 9.7
'DWC hit rate', 9.75
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100'
'LRU hit rate', 18.01
'DWC hit rate', 36.68
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '203%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 17.82
'DWC hit rate', 36.61
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '205%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 11.36
'DWC hit rate', 10.96
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '96%'

'Cache uneven 100 sequential'
'LRU hit rate', 14.24
'DWC hit rate', 38.59
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '270%'

'Cache uneven 100 adversarial'
'LRU hit rate', 42.4
'DWC hit rate', 49.83
'DWC ratio', 93, 92
'DWC / LRU hit rate ratio', '117%'
```

https://github.com/falsandtru/spica/runs/4787339290

### Benchmark

Slower x0.0-0.1 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,561,699 ops/sec ±1.15% (62 runs sampled)'

'DW-Cache simulation 100 x 3,629,918 ops/sec ±0.96% (62 runs sampled)'

'LRUCache simulation 1,000 x 3,528,968 ops/sec ±1.05% (64 runs sampled)'

'DW-Cache simulation 1,000 x 3,330,516 ops/sec ±1.13% (63 runs sampled)'

'LRUCache simulation 10,000 x 2,187,388 ops/sec ±2.53% (41 runs sampled)'

'DW-Cache simulation 10,000 x 2,090,280 ops/sec ±2.73% (59 runs sampled)'

'LRUCache simulation 100,000 x 1,316,016 ops/sec ±2.80% (53 runs sampled)'

'DW-Cache simulation 100,000 x 1,270,312 ops/sec ±7.06% (52 runs sampled)'
```

https://github.com/falsandtru/spica/runs/4787363067

## API

```ts
export interface CacheOptions<K, V = undefined> {
  readonly space?: number;
  readonly age?: number;
  readonly life?: number;
  readonly limit?: number;
  readonly disposer?: (value: V, key: K) => void;
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
  put(key: K, value: V, size?: number, age?: number): boolean;
  set(key: K, value: V, size?: number, age?: number): this;
  get(key: K): V | undefined;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  readonly length: number;
  readonly size: number;
  [Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
```
