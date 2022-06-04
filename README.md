# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Extra key size

Some algorithms require extra memory space to retain evicted keys.

|Algorithm|Key size|
|---------|-|
|LRU      |x1|
|DWC      |x1<br>x1.25 (Enabled ages and overlap tracking)|
|ARC      |x2|
|LIRS     |x3|

## Benchmark

### Hit rate

Higher x1.1-4.3 hit rate of LRU.

```
S3 100,000
LRU hit rate 2.3%
DWC hit rate 10.1%
DWC - LRU hit rate delta 7.8%
DWC / LRU hit rate ratio 435%

S3 500,000
LRU hit rate 22.7%
DWC hit rate 37.4%
DWC - LRU hit rate delta 14.7%
DWC / LRU hit rate ratio 164%

S3 800,000
LRU hit rate 56.5%
DWC hit rate 63.5%
DWC - LRU hit rate delta 6.9%
DWC / LRU hit rate ratio 112%
```

https://github.com/ben-manes/caffeine/wiki/Efficiency#search

### Throughput

±10% speed of [lru-cache](https://www.npmjs.com/package/lru-cache)@6 (basic implementation using a linked list).

```
'LRUCache simulation 100 x 4,408,911 ops/sec ±0.50% (67 runs sampled)'

'DW-Cache simulation 100 x 4,068,709 ops/sec ±0.35% (65 runs sampled)'

'LRUCache simulation 1,000 x 4,011,794 ops/sec ±0.35% (66 runs sampled)'

'DW-Cache simulation 1,000 x 4,099,809 ops/sec ±0.35% (68 runs sampled)'

'LRUCache simulation 10,000 x 2,619,249 ops/sec ±2.96% (62 runs sampled)'

'DW-Cache simulation 10,000 x 2,834,672 ops/sec ±3.40% (61 runs sampled)'

'LRUCache simulation 100,000 x 1,392,207 ops/sec ±3.19% (58 runs sampled)'

'DW-Cache simulation 100,000 x 1,366,786 ops/sec ±6.48% (54 runs sampled)'

'LRUCache simulation 1,000,000 x 830,577 ops/sec ±7.29% (55 runs sampled)'

'DW-Cache simulation 1,000,000 x 788,118 ops/sec ±6.14% (58 runs sampled)'
```

https://github.com/falsandtru/spica/runs/5132776032

Slower x2.0 of [lru-cache](https://www.npmjs.com/package/lru-cache)@7 (optimized implementation using an indexed list).

```
'LRUCache simulation 100 x 6,278,213 ops/sec ±0.18% (69 runs sampled)'

'DW-Cache simulation 100 x 4,838,019 ops/sec ±0.85% (66 runs sampled)'

'LRUCache simulation 1,000 x 5,643,045 ops/sec ±1.55% (52 runs sampled)'

'DW-Cache simulation 1,000 x 3,732,200 ops/sec ±4.46% (58 runs sampled)'

'LRUCache simulation 10,000 x 5,398,721 ops/sec ±2.11% (65 runs sampled)'

'DW-Cache simulation 10,000 x 2,718,213 ops/sec ±3.46% (57 runs sampled)'

'LRUCache simulation 100,000 x 3,329,175 ops/sec ±1.31% (61 runs sampled)'

'DW-Cache simulation 100,000 x 1,506,367 ops/sec ±7.53% (52 runs sampled)'

'LRUCache simulation 1,000,000 x 1,290,187 ops/sec ±5.52% (52 runs sampled)'

'DW-Cache simulation 1,000,000 x 761,712 ops/sec ±6.02% (55 runs sampled)'
```

https://github.com/falsandtru/spica/runs/6739256193

## API

```ts
export namespace Cache {
  export interface Options<K, V = undefined> {
    readonly space?: number;
    readonly age?: number;
    readonly overlap?: boolean;
    readonly limit?: number;
    readonly disposer?: (value: V, key: K) => void;
    readonly capture?: {
      readonly delete?: boolean;
      readonly clear?: boolean;
    };
  }
}
export class Cache<K, V = undefined> {
  constructor(capacity: number, opts?: Cache.Options<K, V>);
  constructor(opts: Cache.Options<K, V>);
  put(key: K, value: V, size?: number, age?: number): boolean;
  put(this: Cache<K, undefined>, key: K, value?: V, size?: number, age?: number): boolean;
  set(key: K, value: V, size?: number, age?: number): this;
  set(this: Cache<K, undefined>, key: K, value?: V, size?: number, age?: number): this;
  get(key: K): V | undefined;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  readonly length: number;
  readonly size: number;
  [Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
```
