# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Extra keys

Some cache algorithms require extra memory space to retain evicted keys.

|Algorithm|Key size|Lists|
|:-------:|:------:|:---:|
| LRU     |   x1   |  1  |
| DWC     |   x1   |  2  |
| ARC     |   x2   |  4  |
| LIRS    |   x3   |  2  |

https://github.com/ben-manes/caffeine/wiki/Efficiency

## Benchmark

### Hit rate

+7.0-17.3% hit rate of LRU.

```
S3 100,000
LRU hit rate 2.3%
DWC hit rate 10.1%
DWC - LRU hit rate delta 7.8%
DWC / LRU hit rate ratio 435%

S3 400,000
LRU hit rate 12.0%
DWC hit rate 29.3%
DWC - LRU hit rate delta 17.3%
DWC / LRU hit rate ratio 243%

S3 800,000
LRU hit rate 56.5%
DWC hit rate 63.6%
DWC - LRU hit rate delta 7.0%
DWC / LRU hit rate ratio 112%
```

https://github.com/dgraph-io/ristretto#search

### Throughput

#### Comparison with [lru-cache](https://www.npmjs.com/package/lru-cache)@6 (basic implementation using a linked list).

Equivalent.

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

#### Comparison with [lru-cache](https://www.npmjs.com/package/lru-cache)@7 (optimized implementation using an indexed list).

About 50% throughput.

```
'LRUCache simulation 100 x 5,161,510 ops/sec ±2.47% (58 runs sampled)'

'DW-Cache simulation 100 x 3,699,800 ops/sec ±1.56% (60 runs sampled)'

'LRUCache simulation 1,000 x 4,374,297 ops/sec ±0.62% (61 runs sampled)'

'DW-Cache simulation 1,000 x 3,111,354 ops/sec ±3.63% (58 runs sampled)'

'LRUCache simulation 10,000 x 4,603,830 ops/sec ±2.30% (61 runs sampled)'

'DW-Cache simulation 10,000 x 2,754,571 ops/sec ±3.38% (55 runs sampled)'

'LRUCache simulation 100,000 x 3,059,272 ops/sec ±1.63% (59 runs sampled)'

'DW-Cache simulation 100,000 x 1,625,055 ops/sec ±7.78% (49 runs sampled)'

'LRUCache simulation 1,000,000 x 1,700,876 ops/sec ±5.18% (51 runs sampled)'

'DW-Cache simulation 1,000,000 x 836,083 ops/sec ±8.45% (53 runs sampled)'
```

https://github.com/falsandtru/spica/runs/6751777283

## API

```ts
export namespace Cache {
  export interface Options<K, V = undefined> {
    readonly space?: number;
    readonly age?: number;
    readonly earlyExpiring?: boolean;
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
  put(key: K, value: V, opts?: { size?: number; age?: number; }): boolean;
  put(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): boolean;
  set(key: K, value: V, opts?: { size?: number; age?: number; }): this;
  set(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): this;
  get(key: K): V | undefined;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  readonly length: number;
  readonly size: number;
  [Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
```
