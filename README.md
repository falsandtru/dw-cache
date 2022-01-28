# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Performance comparison

### Hit rate

Higher x1.0-2.7 hit rate of LRU.

```
'Cache even 100'
'LRU hit rate', 10.49
'DWC hit rate', 10.49
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100'
'LRU hit rate', 18.67
'DWC hit rate', 36.62
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '196%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 18.49
'DWC hit rate', 37.03
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '200%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 11.37
'DWC hit rate', 11.37
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100 sequential'
'LRU hit rate', 13.64
'DWC hit rate', 37.76
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '276%'

'Cache uneven 100 adversarial'
'LRU hit rate', 42.35
'DWC hit rate', 50
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '118%'
```

https://github.com/falsandtru/spica/runs/4975199942

### Benchmark

±10% speed of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 4,374,051 ops/sec ±0.29% (42 runs sampled)'

'DW-Cache simulation 100 x 4,266,032 ops/sec ±0.34% (40 runs sampled)'

'LRUCache simulation 1,000 x 4,157,006 ops/sec ±0.84% (39 runs sampled)'

'DW-Cache simulation 1,000 x 4,040,645 ops/sec ±5.22% (32 runs sampled)'

'LRUCache simulation 10,000 x 2,812,756 ops/sec ±2.48% (36 runs sampled)'

'DW-Cache simulation 10,000 x 3,123,457 ops/sec ±3.11% (39 runs sampled)'

'LRUCache simulation 100,000 x 1,493,577 ops/sec ±2.45% (39 runs sampled)'

'DW-Cache simulation 100,000 x 1,610,209 ops/sec ±8.14% (30 runs sampled)'
```

https://github.com/falsandtru/spica/runs/4975213482

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
