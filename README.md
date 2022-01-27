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
'LRU hit rate', 9.79
'DWC hit rate', 10.28
'DWC ratio', 51, 50
'DWC / LRU hit rate ratio', '105%'

'Cache uneven 100'
'LRU hit rate', 17.59
'DWC hit rate', 34.36
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '195%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 17.8
'DWC hit rate', 36.11
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '202%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 11.44
'DWC hit rate', 11.34
'DWC ratio', 4, 4
'DWC / LRU hit rate ratio', '99%'

'Cache uneven 100 sequential'
'LRU hit rate', 14.53
'DWC hit rate', 38.56
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '265%'

'Cache uneven 100 adversarial'
'LRU hit rate', 41.85
'DWC hit rate', 50.2
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '119%'
```

https://github.com/falsandtru/spica/runs/4964436570

### Benchmark

Faster 0-5% of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,783,174 ops/sec ±1.21% (61 runs sampled)'

'DW-Cache simulation 100 x 3,884,868 ops/sec ±0.92% (63 runs sampled)'

'LRUCache simulation 1,000 x 3,686,511 ops/sec ±1.07% (64 runs sampled)'

'DW-Cache simulation 1,000 x 3,851,667 ops/sec ±0.87% (63 runs sampled)'

'LRUCache simulation 10,000 x 2,443,805 ops/sec ±3.62% (53 runs sampled)'

'DW-Cache simulation 10,000 x 2,637,761 ops/sec ±3.11% (61 runs sampled)'

'LRUCache simulation 100,000 x 1,420,836 ops/sec ±2.85% (56 runs sampled)'

'DW-Cache simulation 100,000 x 1,424,037 ops/sec ±6.24% (55 runs sampled)'
```

https://github.com/falsandtru/spica/runs/4964461101

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
