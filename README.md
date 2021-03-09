# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Performance comparison

### Hit rate (%)

Higher x0.9-2.8 hit rate of LRU.

```
'LRU hit rate even 100', 10.148
'DWC hit rate even 100', 10.1365
'LFU ratio even 100', 10, 10
'DWC / LRU hit rate ratio even 100', '99%'

'LRU hit rate uneven 100', 18.5135
'DWC hit rate uneven 100', 37.4355
'LFU ratio uneven 100', 100, 97
'DWC / LRU hit rate ratio uneven 100', '202%'

'LRU hit rate uneven 100 transitive distribution', 18.3445
'DWC hit rate uneven 100 transitive distribution', 37.869
'LFU ratio uneven 100 transitive distribution', 99, 95
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '206%'

'LRU hit rate uneven 100 transitive bias', 17.4255
'DWC hit rate uneven 100 transitive bias', 16.398
'LFU ratio uneven 100 transitive bias', 39, 39
'DWC / LRU hit rate ratio uneven 100 transitive bias', '94%'

'LRU hit rate uneven 100 sequential', 14.03
'DWC hit rate uneven 100 sequential', 39.202
'LFU ratio uneven 100 sequential', 100, 98
'DWC / LRU hit rate ratio uneven 100 sequential', '279%'

'LRU hit rate uneven 100 adversarial', 42.0645
'DWC hit rate uneven 100 adversarial', 42.6775
'LFU ratio uneven 100 adversarial', 10, 10
'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2061824226

### Benchmark

Slower x0.0-0.2 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache get/set 100 x 4,363,797 ops/sec ±0.86% (61 runs sampled)'

'DW-Cache get/set 100 x 3,309,959 ops/sec ±0.62% (65 runs sampled)'

'LRUCache get/set 1,000 x 3,052,910 ops/sec ±6.82% (49 runs sampled)'

'DW-Cache get/set 1,000 x 3,409,339 ops/sec ±0.94% (62 runs sampled)'

'LRUCache get/set 10,000 x 2,718,037 ops/sec ±3.98% (50 runs sampled)'

'DW-Cache get/set 10,000 x 2,595,130 ops/sec ±3.02% (58 runs sampled)'

'LRUCache get/set 100,000 x 1,463,442 ops/sec ±2.76% (56 runs sampled)'

'DW-Cache get/set 100,000 x 1,454,421 ops/sec ±4.33% (56 runs sampled)'
```

https://github.com/falsandtru/spica/runs/2061836649

## API

```ts
export interface CacheOptions<K, V = undefined> {
  readonly space?: number;
  readonly age?: number;
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
