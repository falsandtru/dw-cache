# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Performance comparison

### Hit rate

Higher x0.9-2.6 hit rate of LRU.

```
'Cache even 100'
'LRU hit rate', 9.77
'DWC hit rate', 10.04
'DWC ratio', 70, 69
'DWC / LRU hit rate ratio', '102%'

'Cache uneven 100'
'LRU hit rate', 18.48
'DWC hit rate', 35.85
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '193%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 18.25
'DWC hit rate', 36.41
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '199%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 10.57
'DWC hit rate', 10.55
'DWC ratio', 1, 1
'DWC / LRU hit rate ratio', '99%'

'Cache uneven 100 sequential'
'LRU hit rate', 13.51
'DWC hit rate', 37.15
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '274%'

'Cache uneven 100 adversarial'
'LRU hit rate', 42.25
'DWC hit rate', 49.89
'DWC ratio', 94, 93
'DWC / LRU hit rate ratio', '118%'
```

https://github.com/falsandtru/spica/runs/4800911644

### Benchmark

Slower x0.0-0.1 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 4,713,953 ops/sec ±1.06% (65 runs sampled)'

'DW-Cache simulation 100 x 2,966,041 ops/sec ±3.13% (57 runs sampled)'

'LRUCache simulation 1,000 x 2,868,502 ops/sec ±2.80% (46 runs sampled)'

'DW-Cache simulation 1,000 x 2,864,095 ops/sec ±2.99% (59 runs sampled)'

'LRUCache simulation 10,000 x 2,975,807 ops/sec ±3.11% (59 runs sampled)'

'DW-Cache simulation 10,000 x 2,213,014 ops/sec ±3.04% (59 runs sampled)'

'LRUCache simulation 100,000 x 1,747,886 ops/sec ±3.25% (53 runs sampled)'

'DW-Cache simulation 100,000 x 1,538,661 ops/sec ±4.95% (56 runs sampled)'
```

https://github.com/falsandtru/spica/runs/4800947409

## API

```ts
export interface CacheOptions<K, V = undefined> {
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
