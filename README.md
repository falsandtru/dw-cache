# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

This repository is maintained on the following source repository.

https://github.com/falsandtru/spica

## Performance comparison

### Hit rate (%)

Higher x0.9-2.8 hit rate of LRU.

```
'LRU hit rate even 100', 9.9
'DWC hit rate even 100', 9.98
'LFU ratio even 100', 31, 31
'DWC / LRU hit rate ratio even 100', '100%'

'LRU hit rate uneven 100', 18.562
'DWC hit rate uneven 100', 37.5645
'LFU ratio uneven 100', 98, 97
'DWC / LRU hit rate ratio uneven 100', '202%'

'LRU hit rate uneven 100 transitive distribution', 18.3415
'DWC hit rate uneven 100 transitive distribution', 37.9475
'LFU ratio uneven 100 transitive distribution', 98, 97
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '206%'

'LRU hit rate uneven 100 transitive bias', 17.527
'DWC hit rate uneven 100 transitive bias', 16.3925
'LFU ratio uneven 100 transitive bias', 54, 54
'DWC / LRU hit rate ratio uneven 100 transitive bias', '93%'

'LRU hit rate uneven 100 sequential', 14.1095
'DWC hit rate uneven 100 sequential', 39.128
'LFU ratio uneven 100 sequential', 100, 99
'DWC / LRU hit rate ratio uneven 100 sequential', '277%'

'LRU hit rate uneven 100 adversarial', 42.074
'DWC hit rate uneven 100 adversarial', 42.649
'LFU ratio uneven 100 adversarial', 10, 10
'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2051018534

### Benchmark (ops/sec)

Slower x0.2-0.5 of [lru-cache](https://www.npmjs.com/package/lru-cache).

|Operation         |dw-cache |lru-cache|Faster|
|:-----------------|--------:|--------:|-----:|
|set     100 (hit) | 11,404K |  7,523K |  51% |
|set   1,000 (hit) | 13,133K |  7,299K |  79% |
|set  10,000 (hit) | 11,907K |  7,905K |  50% |
|set 100,000 (hit) |  8,204K |  6,326K |  29% |
|set     100 (miss)|  4,139K |  2,693K |  53% |
|set   1,000 (miss)|  3,726K |  5,126K | -28% |
|set  10,000 (miss)|  2,467K |  3,161K | -22% |
|set 100,000 (miss)|  1,362K |  1,771K | -24% |
|get     100 (hit) |  7,633K | 12,656K | -40% |
|get   1,000 (hit) |  9,189K | 11,638K | -22% |
|get  10,000 (hit) | 10,022K | 11,439K | -13% |
|get 100,000 (hit) |  7,639K |  8,563K | -11% |
|get     100 (miss)| 20,562K | 20,484K |   0% |
|get   1,000 (miss)| 19,942K | 18,580K |   7% |
|get  10,000 (miss)| 20,401K | 19,310K |   5% |
|get 100,000 (miss)| 14,883K | 14,011K |   6% |

https://github.com/falsandtru/spica/runs/2051028115

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
