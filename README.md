# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Performance comparison

### Hit rate

Higher x1.1-4.3 hit rate of LRU.

```
S3 100,000
LRU hit rate 2.3%
DWC hit rate 10.0%
DWC - LRU hit rate delta 7.7%
DWC / LRU hit rate ratio 432%

S3 500,000
LRU hit rate 22.7%
DWC hit rate 37.3%
DWC - LRU hit rate delta 14.6%
DWC / LRU hit rate ratio 164%

S3 800,000
LRU hit rate 56.5%
DWC hit rate 63.2%
DWC - LRU hit rate delta 6.6%
DWC / LRU hit rate ratio 111%
```

https://github.com/dgraph-io/ristretto#search

### Benchmark

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
'LRUCache simulation 100 x 4,913,554 ops/sec ±1.34% (61 runs sampled)'

'DW-Cache simulation 100 x 3,941,044 ops/sec ±1.24% (59 runs sampled)'

'LRUCache simulation 1,000 x 5,025,781 ops/sec ±1.24% (61 runs sampled)'

'DW-Cache simulation 1,000 x 3,014,158 ops/sec ±3.83% (49 runs sampled)'

'LRUCache simulation 10,000 x 3,664,603 ops/sec ±1.34% (61 runs sampled)'

'DW-Cache simulation 10,000 x 2,190,182 ops/sec ±2.79% (58 runs sampled)'

'LRUCache simulation 100,000 x 3,046,952 ops/sec ±1.77% (60 runs sampled)'

'DW-Cache simulation 100,000 x 1,319,007 ops/sec ±6.32% (50 runs sampled)'

'LRUCache simulation 1,000,000 x 1,066,116 ops/sec ±5.85% (51 runs sampled)'

'DW-Cache simulation 1,000,000 x 615,281 ops/sec ±9.13% (52 runs sampled)'
```

https://github.com/falsandtru/spica/runs/6717209474

## API

```ts
export namespace Cache {
  export interface Options<K, V = undefined> {
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
