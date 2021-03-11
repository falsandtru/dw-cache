# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Performance comparison

### Hit rate

Higher x0.9-2.8 hit rate of LRU.

```
'LRU hit rate even 100', 10.089
'DWC hit rate even 100', 10.009
'LFU ratio even 100', 10, 10
'DWC / LRU hit rate ratio even 100', '99%'

'LRU hit rate uneven 100', 18.567
'DWC hit rate uneven 100', 37.475
'LFU ratio uneven 100', 100, 99
'DWC / LRU hit rate ratio uneven 100', '201%'

'LRU hit rate uneven 100 transitive distribution', 18.244
'DWC hit rate uneven 100 transitive distribution', 38.0445
'LFU ratio uneven 100 transitive distribution', 99, 98
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '208%'

'LRU hit rate uneven 100 transitive bias', 17.3835
'DWC hit rate uneven 100 transitive bias', 16.405
'LFU ratio uneven 100 transitive bias', 48, 47
'DWC / LRU hit rate ratio uneven 100 transitive bias', '94%'

'LRU hit rate uneven 100 sequential', 14.239
'DWC hit rate uneven 100 sequential', 39.681
'LFU ratio uneven 100 sequential', 100, 97
'DWC / LRU hit rate ratio uneven 100 sequential', '278%'

'LRU hit rate uneven 100 adversarial', 42.06
'DWC hit rate uneven 100 adversarial', 42.68
'LFU ratio uneven 100 adversarial', 10, 10
'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2087142721

### Benchmark

Slower x0.0-0.2 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,304,902 ops/sec ±1.28% (62 runs sampled)'

'DW-Cache simulation 100 x 2,457,231 ops/sec ±3.29% (60 runs sampled)'

'LRUCache simulation 1,000 x 3,003,974 ops/sec ±2.36% (63 runs sampled)'

'DW-Cache simulation 1,000 x 2,317,406 ops/sec ±2.76% (57 runs sampled)'

'LRUCache simulation 10,000 x 1,955,054 ops/sec ±3.28% (60 runs sampled)'

'DW-Cache simulation 10,000 x 1,715,706 ops/sec ±2.41% (59 runs sampled)'

'LRUCache simulation 100,000 x 1,306,687 ops/sec ±3.06% (54 runs sampled)'

'DW-Cache simulation 100,000 x 1,292,620 ops/sec ±3.93% (56 runs sampled)'
```

https://github.com/falsandtru/spica/runs/2087166411

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
