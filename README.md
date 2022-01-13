# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Performance comparison

### Hit rate

Higher x0.9-2.6 hit rate of LRU.

```
'Cache even 100'
'LRU hit rate', 9.85
'DWC hit rate', 9.85
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100'
'LRU hit rate', 18.53
'DWC hit rate', 36.07
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '194%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 18.57
'DWC hit rate', 36.48
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '196%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 11.33
'DWC hit rate', 11.34
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100 sequential'
'LRU hit rate', 14.05
'DWC hit rate', 38.31
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '272%'

'Cache uneven 100 adversarial'
'LRU hit rate', 42.35
'DWC hit rate', 49.94
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '117%'
```

https://github.com/falsandtru/spica/runs/4797806800

### Benchmark

Slower x0.0-0.1 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 4,955,203 ops/sec ±1.26% (31 runs sampled)'

'DW-Cache simulation 100 x 4,096,862 ops/sec ±0.84% (33 runs sampled)'

'LRUCache simulation 1,000 x 4,623,945 ops/sec ±0.83% (30 runs sampled)'

'DW-Cache simulation 1,000 x 3,000,306 ops/sec ±2.75% (31 runs sampled)'

'LRUCache simulation 10,000 x 2,529,548 ops/sec ±2.67% (31 runs sampled)'

'DW-Cache simulation 10,000 x 2,408,576 ops/sec ±2.64% (29 runs sampled)'

'LRUCache simulation 100,000 x 1,501,336 ops/sec ±3.31% (28 runs sampled)'

'DW-Cache simulation 100,000 x 1,556,012 ops/sec ±5.51% (30 runs sampled)'
```

https://github.com/falsandtru/spica/runs/4797822151

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
