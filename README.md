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
'LRU hit rate even 100', 10.024
'DWC hit rate even 100', 9.9915
'LFU ratio even 100', 10, 10
'DWC / LRU hit rate ratio even 100', '99%'

'LRU hit rate uneven 100', 18.6375
'DWC hit rate uneven 100', 38.374
'LFU ratio uneven 100', 100, 98
'DWC / LRU hit rate ratio uneven 100', '205%'

'LRU hit rate uneven 100 transitive distribution', 18.4425
'DWC hit rate uneven 100 transitive distribution', 38.279
'LFU ratio uneven 100 transitive distribution', 99, 96
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '207%'

'LRU hit rate uneven 100 transitive bias', 17.6445
'DWC hit rate uneven 100 transitive bias', 16.703
'LFU ratio uneven 100 transitive bias', 45, 44
'DWC / LRU hit rate ratio uneven 100 transitive bias', '94%'

'LRU hit rate uneven 100 sequential', 14.067
'DWC hit rate uneven 100 sequential', 39.226
'LFU ratio uneven 100 sequential', 100, 98
'DWC / LRU hit rate ratio uneven 100 sequential', '278%'

'LRU hit rate uneven 100 adversarial', 42.1185
'DWC hit rate uneven 100 adversarial', 49.814
'LFU ratio uneven 100 adversarial', 96, 93
'DWC / LRU hit rate ratio uneven 100 adversarial', '118%'
```

https://github.com/falsandtru/spica/runs/2158086653

### Benchmark

Slower x0.0-0.2 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,424,702 ops/sec ±1.24% (64 runs sampled)'

'DW-Cache simulation 100 x 2,702,646 ops/sec ±3.15% (58 runs sampled)'

'LRUCache simulation 1,000 x 3,328,666 ops/sec ±0.63% (66 runs sampled)'

'DW-Cache simulation 1,000 x 2,701,732 ops/sec ±3.95% (58 runs sampled)'

'LRUCache simulation 10,000 x 2,240,699 ops/sec ±3.42% (62 runs sampled)'

'DW-Cache simulation 10,000 x 2,359,943 ops/sec ±3.91% (59 runs sampled)'

'LRUCache simulation 100,000 x 1,337,542 ops/sec ±3.97% (55 runs sampled)'

'DW-Cache simulation 100,000 x 1,475,735 ops/sec ±5.69% (55 runs sampled)'
```

https://github.com/falsandtru/spica/runs/2158095040

## API

```ts
export interface CacheOptions<K, V = undefined> {
  readonly space?: number;
  readonly age?: number;
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
