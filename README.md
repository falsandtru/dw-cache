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
'LRU hit rate', 10.13
'DWC hit rate', 10.13
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100'
'LRU hit rate', 18.44
'DWC hit rate', 36.94
'DWC ratio', 95, 94
'DWC / LRU hit rate ratio', '200%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 19.2
'DWC hit rate', 37.55
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '195%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 10.75
'DWC hit rate', 10.75
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100 sequential'
'LRU hit rate', 14.39
'DWC hit rate', 38.34
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '266%'

'Cache uneven 100 adversarial'
'LRU hit rate', 41.58
'DWC hit rate', 49.58
'DWC ratio', 92, 91
'DWC / LRU hit rate ratio', '119%'
```

https://github.com/falsandtru/spica/runs/4997367975

### Benchmark

±10% speed of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,492,847 ops/sec ±0.94% (65 runs sampled)'

'DW-Cache simulation 100 x 3,415,062 ops/sec ±0.55% (66 runs sampled)'

'LRUCache simulation 1,000 x 3,304,101 ops/sec ±0.47% (67 runs sampled)'

'DW-Cache simulation 1,000 x 2,767,648 ops/sec ±3.77% (55 runs sampled)'

'LRUCache simulation 10,000 x 2,257,419 ops/sec ±3.30% (59 runs sampled)'

'DW-Cache simulation 10,000 x 2,455,625 ops/sec ±3.14% (63 runs sampled)'

'LRUCache simulation 100,000 x 1,235,246 ops/sec ±3.40% (55 runs sampled)'

'DW-Cache simulation 100,000 x 1,194,966 ops/sec ±6.72% (53 runs sampled)'

'LRUCache simulation 1,000,000 x 769,860 ops/sec ±7.67% (58 runs sampled)'

'DW-Cache simulation 1,000,000 x 681,607 ops/sec ±7.97% (57 runs sampled)'
```

https://github.com/falsandtru/spica/runs/4997379775

## API

```ts
export class Cache<K, V = undefined> {
  constructor(capacity: number, opts?: Cache.Options<K, V>);
  constructor(opts: Cache.Options<K, V>);
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
