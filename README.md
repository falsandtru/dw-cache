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
'LRU hit rate even 100', 10.091
'DWC hit rate even 100', 10.039
'LFU ratio even 100', 41, 40
'DWC / LRU hit rate ratio even 100', '99%'

'LRU hit rate uneven 100', 18.739
'DWC hit rate uneven 100', 37.7185
'LFU ratio uneven 100', 99, 97
'DWC / LRU hit rate ratio uneven 100', '201%'

'LRU hit rate uneven 100 transitive distribution', 18.5305
'DWC hit rate uneven 100 transitive distribution', 37.8885
'LFU ratio uneven 100 transitive distribution', 99, 97
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '204%'

'LRU hit rate uneven 100 transitive bias', 17.501
'DWC hit rate uneven 100 transitive bias', 16.414
'LFU ratio uneven 100 transitive bias', 60, 59
'DWC / LRU hit rate ratio uneven 100 transitive bias', '93%'

'LRU hit rate uneven 100 sequential', 13.864
'DWC hit rate uneven 100 sequential', 39.1015
'LFU ratio uneven 100 sequential', 100, 99
'DWC / LRU hit rate ratio uneven 100 sequential', '282%'

'LRU hit rate uneven 100 adversarial', 42.0525
'DWC hit rate uneven 100 adversarial', 42.6635
'LFU ratio uneven 100 adversarial', 10, 10
'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2068648887

### Benchmark

Slower x0.0-0.2 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 4,578,297 ops/sec ±0.55% (66 runs sampled)'

'DW-Cache simulation 100 x 3,735,885 ops/sec ±1.78% (63 runs sampled)'

'LRUCache simulation 1,000 x 4,375,278 ops/sec ±0.56% (66 runs sampled)'

'DW-Cache simulation 1,000 x 4,070,098 ops/sec ±0.42% (68 runs sampled)'

'LRUCache simulation 10,000 x 3,258,604 ops/sec ±2.71% (61 runs sampled)'

'DW-Cache simulation 10,000 x 3,213,437 ops/sec ±1.67% (62 runs sampled)'

'LRUCache simulation 100,000 x 1,789,730 ops/sec ±2.09% (61 runs sampled)'

'DW-Cache simulation 100,000 x 1,681,846 ops/sec ±3.54% (54 runs sampled)'
```

https://github.com/falsandtru/spica/runs/2069026253

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
