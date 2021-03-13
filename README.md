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
'LRU hit rate even 100', 9.933
'DWC hit rate even 100', 10.014
'LFU ratio even 100', 20, 20
'DWC / LRU hit rate ratio even 100', '100%'

'LRU hit rate uneven 100', 18.6435
'DWC hit rate uneven 100', 37.4895
'LFU ratio uneven 100', 99, 98
'DWC / LRU hit rate ratio uneven 100', '201%'

'LRU hit rate uneven 100 transitive distribution', 18.3595
'DWC hit rate uneven 100 transitive distribution', 37.525
'LFU ratio uneven 100 transitive distribution', 99, 98
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '204%'

'LRU hit rate uneven 100 transitive bias', 17.6045
'DWC hit rate uneven 100 transitive bias', 16.5845
'LFU ratio uneven 100 transitive bias', 63, 63
'DWC / LRU hit rate ratio uneven 100 transitive bias', '94%'

'LRU hit rate uneven 100 sequential', 14.027
'DWC hit rate uneven 100 sequential', 39.0305
'LFU ratio uneven 100 sequential', 100, 99
'DWC / LRU hit rate ratio uneven 100 sequential', '278%'

'LRU hit rate uneven 100 adversarial', 42.0975
'DWC hit rate uneven 100 adversarial', 42.7115
'LFU ratio uneven 100 adversarial', 10, 10
'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2100496879

### Benchmark

Slower x0.0-0.2 of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 3,270,576 ops/sec ±0.95% (66 runs sampled)'

'DW-Cache simulation 100 x 2,735,382 ops/sec ±3.66% (61 runs sampled)'

'LRUCache simulation 1,000 x 3,164,099 ops/sec ±0.87% (66 runs sampled)'

'DW-Cache simulation 1,000 x 2,708,198 ops/sec ±3.27% (61 runs sampled)'

'LRUCache simulation 10,000 x 2,190,796 ops/sec ±2.72% (61 runs sampled)'

'DW-Cache simulation 10,000 x 2,074,956 ops/sec ±3.57% (59 runs sampled)'

'LRUCache simulation 100,000 x 1,205,207 ops/sec ±3.82% (56 runs sampled)'

'DW-Cache simulation 100,000 x 1,191,835 ops/sec ±3.50% (56 runs sampled)'
```

https://github.com/falsandtru/spica/runs/2100504761

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
