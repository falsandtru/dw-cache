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
'LRU hit rate', 10.28
'DWC hit rate', 10.49
'DWC ratio', 74, 73
'DWC / LRU hit rate ratio', '102%'

'Cache uneven 100'
'LRU hit rate', 19.3
'DWC hit rate', 36.91
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '191%'

'Cache uneven 100 transitive distribution'
'LRU hit rate', 18.84
'DWC hit rate', 37.07
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '196%'

'Cache uneven 100 transitive bias'
'LRU hit rate', 11.67
'DWC hit rate', 11.63
'DWC ratio', 5, 5
'DWC / LRU hit rate ratio', '99%'

'Cache uneven 100 sequential'
'LRU hit rate', 13.62
'DWC hit rate', 37.15
'DWC ratio', 95, 95
'DWC / LRU hit rate ratio', '272%'

'Cache uneven 100 adversarial'
'LRU hit rate', 42.22
'DWC hit rate', 49.81
'DWC ratio', 94, 93
'DWC / LRU hit rate ratio', '117%'
```

https://github.com/falsandtru/spica/runs/4958547921

### Benchmark

Slower x0.0-0.1 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,409,743 ops/sec ±0.88% (61 runs sampled)'

'DW-Cache simulation 100 x 3,383,173 ops/sec ±1.00% (61 runs sampled)'

'LRUCache simulation 1,000 x 3,318,113 ops/sec ±1.37% (59 runs sampled)'

'DW-Cache simulation 1,000 x 3,075,874 ops/sec ±1.11% (60 runs sampled)'

'LRUCache simulation 10,000 x 2,018,025 ops/sec ±3.01% (54 runs sampled)'

'DW-Cache simulation 10,000 x 1,975,316 ops/sec ±3.24% (60 runs sampled)'

'LRUCache simulation 100,000 x 1,263,983 ops/sec ±2.99% (59 runs sampled)'

'DW-Cache simulation 100,000 x 1,147,544 ops/sec ±5.18% (53 runs sampled)'
```

https://github.com/falsandtru/spica/runs/4958568364

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
