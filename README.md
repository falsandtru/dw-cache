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
'LRU hit rate', 9.87
'DWC hit rate', 9.84
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '99%'

'Cache uneven 100'
'LRU hit rate', 19.14
'DWC hit rate', 36.52
'DWC ratio', 95, 93
'DWC / LRU hit rate ratio', '190%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 17.74
'DWC hit rate', 37.15
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '209%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 10.99
'DWC hit rate', 11.02
'DWC ratio', 0, 1
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100 sequential'
'LRU hit rate', 13.47
'DWC hit rate', 37.53
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '278%'

'Cache uneven 100 adversarial'
'LRU hit rate', 41.78
'DWC hit rate', 49.77
'DWC ratio', 94, 93
'DWC / LRU hit rate ratio', '119%'
```

https://github.com/falsandtru/spica/runs/4998610954

### Benchmark

±10% speed of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 4,248,360 ops/sec ±0.96% (64 runs sampled)'

'DW-Cache simulation 100 x 3,814,501 ops/sec ±0.71% (63 runs sampled)'

'LRUCache simulation 1,000 x 3,160,547 ops/sec ±6.42% (51 runs sampled)'

'DW-Cache simulation 1,000 x 3,945,506 ops/sec ±1.11% (61 runs sampled)'

'LRUCache simulation 10,000 x 2,485,636 ops/sec ±2.86% (57 runs sampled)'

'DW-Cache simulation 10,000 x 2,585,085 ops/sec ±3.09% (61 runs sampled)'

'LRUCache simulation 100,000 x 1,334,175 ops/sec ±3.50% (56 runs sampled)'

'DW-Cache simulation 100,000 x 1,317,095 ops/sec ±6.04% (54 runs sampled)'

'LRUCache simulation 1,000,000 x 837,846 ops/sec ±6.75% (55 runs sampled)'

'DW-Cache simulation 1,000,000 x 726,036 ops/sec ±8.35% (56 runs sampled)'
```

https://github.com/falsandtru/spica/runs/4998624993

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
