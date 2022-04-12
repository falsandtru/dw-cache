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
'LRU hit rate', 10.03
'DWC hit rate', 10.01
'DWC ratio', 8, 8
'DWC / LRU hit rate ratio', '99%'

'Cache uneven 100'
'LRU hit rate', 18.74
'DWC hit rate', 36.53
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '194%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 18.39
'DWC hit rate', 38.27
'DWC ratio', 95, 94
'DWC / LRU hit rate ratio', '208%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 10.7
'DWC hit rate', 10.71
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100 sequential'
'LRU hit rate', 13.65
'DWC hit rate', 37.51
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '274%'

'Cache uneven 100 adversarial'
'LRU hit rate', 41.81
'DWC hit rate', 49.61
'DWC ratio', 93, 92
'DWC / LRU hit rate ratio', '118%'
```

https://github.com/falsandtru/spica/runs/5989250278

### Benchmark

±10% speed of [lru-cache](https://www.npmjs.com/package/lru-cache)@6(basic implementation using a linked list).

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

Slower x2.0 of [lru-cache](https://www.npmjs.com/package/lru-cache)@7(optimized implementation using an indexed list).

```
'LRUCache simulation 100 x 5,666,841 ops/sec ±1.28% (64 runs sampled)'

'DW-Cache simulation 100 x 4,626,708 ops/sec ±0.41% (68 runs sampled)'

'LRUCache simulation 1,000 x 5,839,056 ops/sec ±0.76% (68 runs sampled)'

'DW-Cache simulation 1,000 x 3,705,258 ops/sec ±4.05% (60 runs sampled)'

'LRUCache simulation 10,000 x 5,319,518 ops/sec ±1.70% (64 runs sampled)'

'DW-Cache simulation 10,000 x 2,795,605 ops/sec ±3.43% (60 runs sampled)'

'LRUCache simulation 100,000 x 3,085,476 ops/sec ±1.79% (56 runs sampled)'

'DW-Cache simulation 100,000 x 1,300,118 ops/sec ±6.17% (55 runs sampled)'

'LRUCache simulation 1,000,000 x 1,248,436 ops/sec ±3.81% (55 runs sampled)'

'DW-Cache simulation 1,000,000 x 717,300 ops/sec ±11.12% (55 runs sampled)'
```

https://github.com/falsandtru/spica/runs/5989284811

## API

```ts
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
namespace Cache {
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
```
