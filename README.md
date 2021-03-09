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
'LRU hit rate even 100', 9.9055
'DWC hit rate even 100', 9.952
'LFU ratio even 100', 25, 25
'DWC / LRU hit rate ratio even 100', '100%'

'LRU hit rate uneven 100', 18.61
'DWC hit rate uneven 100', 37.6625
'LFU ratio uneven 100', 99, 97
'DWC / LRU hit rate ratio uneven 100', '202%'

'LRU hit rate uneven 100 transitive distribution', 18.4585
'DWC hit rate uneven 100 transitive distribution', 37.8625
'LFU ratio uneven 100 transitive distribution', 100, 98
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '205%'

'LRU hit rate uneven 100 transitive bias', 17.553
'DWC hit rate uneven 100 transitive bias', 16.5685
'LFU ratio uneven 100 transitive bias', 53, 53
'DWC / LRU hit rate ratio uneven 100 transitive bias', '94%'

'LRU hit rate uneven 100 sequential', 14.195
'DWC hit rate uneven 100 sequential', 39.3425
'LFU ratio uneven 100 sequential', 100, 97
'DWC / LRU hit rate ratio uneven 100 sequential', '277%'

'LRU hit rate uneven 100 adversarial', 42.0015
'DWC hit rate uneven 100 adversarial', 42.6085
'LFU ratio uneven 100 adversarial', 10, 10
'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2066756277

### Benchmark

Slower x0.0-0.2 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,080,367 ops/sec ±1.70% (64 runs sampled)'

'DW-Cache simulation 100 x 2,469,946 ops/sec ±3.19% (59 runs sampled)'

'LRUCache simulation 1,000 x 2,958,544 ops/sec ±1.29% (65 runs sampled)'

'DW-Cache simulation 1,000 x 2,426,789 ops/sec ±3.66% (58 runs sampled)'

'LRUCache simulation 10,000 x 1,842,352 ops/sec ±3.79% (60 runs sampled)'

'DW-Cache simulation 10,000 x 1,710,835 ops/sec ±3.31% (58 runs sampled)'

'LRUCache simulation 100,000 x 928,464 ops/sec ±3.91% (58 runs sampled)'

'DW-Cache simulation 100,000 x 842,602 ops/sec ±2.69% (57 runs sampled)'
```

https://github.com/falsandtru/spica/runs/2066774887

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
