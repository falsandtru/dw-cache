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
'Cache even 100'
'LRU hit rate', 10.007
'DWC hit rate', 10.08
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '100%'

'Cache uneven 100'
'LRU hit rate', 18.582
'DWC hit rate', 37.734
'DWC ratio', 98, 97
'DWC / LRU hit rate ratio', '203%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 18.316
'DWC hit rate', 38.325
'DWC ratio', 98, 97
'DWC / LRU hit rate ratio', '209%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 11.025
'DWC hit rate', 10.858
'DWC ratio', 0, 0
'DWC / LRU hit rate ratio', '98%'

'Cache uneven 100 sequential'
'LRU hit rate', 14.206
'DWC hit rate', 39.027
'DWC ratio', 98, 98
'DWC / LRU hit rate ratio', '274%'

'Cache uneven 100 adversarial'
'LRU hit rate', 42.035
'DWC hit rate', 49.878
'DWC ratio', 97, 96
'DWC / LRU hit rate ratio', '118%'
```

https://github.com/falsandtru/spica/runs/3739713397

### Benchmark

Slower x0.0-0.1 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,996,426 ops/sec ±0.65% (65 runs sampled)'

'DW-Cache simulation 100 x 3,886,873 ops/sec ±0.95% (64 runs sampled)'

'LRUCache simulation 1,000 x 3,752,274 ops/sec ±1.23% (64 runs sampled)'

'DW-Cache simulation 1,000 x 3,549,733 ops/sec ±1.55% (63 runs sampled)'

'LRUCache simulation 10,000 x 2,377,532 ops/sec ±3.36% (59 runs sampled)'

'DW-Cache simulation 10,000 x 2,716,380 ops/sec ±3.79% (57 runs sampled)'

'LRUCache simulation 100,000 x 1,471,475 ops/sec ±4.99% (49 runs sampled)'

'DW-Cache simulation 100,000 x 1,509,996 ops/sec ±5.97% (55 runs sampled)'
```

https://github.com/falsandtru/spica/runs/3739725422

## API

```ts
export interface CacheOptions<K, V = undefined> {
  readonly space?: number;
  readonly age?: number;
  readonly life?: number;
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
