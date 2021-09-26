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
'LRU hit rate', 9.854
'DWC hit rate', 9.8395
'LFU ratio', 0, 0
'DWC / LRU hit rate ratio', '99%'

'Cache uneven 100'
'LRU hit rate', 18.681
'DWC hit rate', 37.7065
'LFU ratio', 98, 98
'DWC / LRU hit rate ratio', '201%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 18.4035
'DWC hit rate', 38.5675
'LFU ratio', 98, 98
'DWC / LRU hit rate ratio', '209%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 17.5595
'DWC hit rate', 16.6515
'LFU ratio', 57, 57
'DWC / LRU hit rate ratio', '94%'

'Cache uneven 100 sequential'
'LRU hit rate', 13.908
'DWC hit rate', 39.0085
'LFU ratio', 98, 98
'DWC / LRU hit rate ratio', '280%'

'Cache uneven 100 adversarial'
'LRU hit rate', 42.041
'DWC hit rate', 50.077
'LFU ratio', 98, 98
'DWC / LRU hit rate ratio', '119%'
```

https://github.com/falsandtru/spica/runs/3711171582

### Benchmark

Slower x0.0-0.1 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,390,762 ops/sec ±0.89% (62 runs sampled)'

'DW-Cache simulation 100 x 3,484,549 ops/sec ±0.56% (64 runs sampled)'

'LRUCache simulation 1,000 x 3,210,111 ops/sec ±0.71% (62 runs sampled)'

'DW-Cache simulation 1,000 x 3,067,002 ops/sec ±1.27% (61 runs sampled)'

'LRUCache simulation 10,000 x 2,067,676 ops/sec ±2.80% (60 runs sampled)'

'DW-Cache simulation 10,000 x 2,294,256 ops/sec ±2.79% (62 runs sampled)'

'LRUCache simulation 100,000 x 1,210,463 ops/sec ±2.85% (46 runs sampled)'

'DW-Cache simulation 100,000 x 1,234,972 ops/sec ±6.53% (55 runs sampled)'
```

https://github.com/falsandtru/spica/runs/3711175596

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
