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
'LRU hit rate even 100', 9.97
'DWC hit rate even 100', 9.973
'LFU ratio even 100', 36, 36
'DWC / LRU hit rate ratio even 100', '100%'

'LRU hit rate uneven 100', 18.5465
'DWC hit rate uneven 100', 37.235
'LFU ratio uneven 100', 100, 99
'DWC / LRU hit rate ratio uneven 100', '200%'

'LRU hit rate uneven 100 transitive distribution', 18.2985
'DWC hit rate uneven 100 transitive distribution', 37.7805
'LFU ratio uneven 100 transitive distribution', 99, 98
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '206%'

'LRU hit rate uneven 100 transitive bias', 17.563
'DWC hit rate uneven 100 transitive bias', 16.6145
'LFU ratio uneven 100 transitive bias', 46, 45
'DWC / LRU hit rate ratio uneven 100 transitive bias', '94%'

'LRU hit rate uneven 100 sequential', 14.0395
'DWC hit rate uneven 100 sequential', 39.1375
'LFU ratio uneven 100 sequential', 100, 97
'DWC / LRU hit rate ratio uneven 100 sequential', '278%'

'LRU hit rate uneven 100 adversarial', 42.0305
'DWC hit rate uneven 100 adversarial', 42.635
'LFU ratio uneven 100 adversarial', 10, 10
'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2107011452

### Benchmark

Slower x0.0-0.2 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,334,131 ops/sec ±0.49% (67 runs sampled)'

'DW-Cache simulation 100 x 2,339,294 ops/sec ±2.74% (55 runs sampled)'

'LRUCache simulation 1,000 x 3,186,070 ops/sec ±0.32% (65 runs sampled)'

'DW-Cache simulation 1,000 x 2,308,224 ops/sec ±3.47% (58 runs sampled)'

'LRUCache simulation 10,000 x 2,214,603 ops/sec ±3.59% (60 runs sampled)'

'DW-Cache simulation 10,000 x 1,976,012 ops/sec ±3.26% (57 runs sampled)'

'LRUCache simulation 100,000 x 1,375,549 ops/sec ±3.33% (52 runs sampled)'

'DW-Cache simulation 100,000 x 1,284,223 ops/sec ±4.85% (53 runs sampled)'
```

https://github.com/falsandtru/spica/runs/2107019303

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
