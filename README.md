# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Performance comparison

### Hit rate (%)

Higher x0.9-2.8 hit rate of LRU.

```
'LRU hit rate even 100', 10.0505
'DWC hit rate even 100', 10.113
'LFU ratio even 100', 43, 43
'DWC / LRU hit rate ratio even 100', '100%'

'LRU hit rate uneven 100', 18.5265
'DWC hit rate uneven 100', 37.7265
'LFU ratio uneven 100', 100, 98
'DWC / LRU hit rate ratio uneven 100', '203%'

'LRU hit rate uneven 100 transitive distribution', 18.362
'DWC hit rate uneven 100 transitive distribution', 38.055
'LFU ratio uneven 100 transitive distribution', 99, 97
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '207%'

'LRU hit rate uneven 100 transitive bias', 17.606
'DWC hit rate uneven 100 transitive bias', 16.445
'LFU ratio uneven 100 transitive bias', 56, 56
'DWC / LRU hit rate ratio uneven 100 transitive bias', '93%'

'LRU hit rate uneven 100 sequential', 14.0175
'DWC hit rate uneven 100 sequential', 39.122
'LFU ratio uneven 100 sequential', 100, 98
'DWC / LRU hit rate ratio uneven 100 sequential', '279%'

'LRU hit rate uneven 100 adversarial', 42.024
'DWC hit rate uneven 100 adversarial', 42.6485
'LFU ratio uneven 100 adversarial', 10, 10
'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2047781229

### Benchmark (ops/sec)

Slower x0.2-0.5 of [lru-cache](https://www.npmjs.com/package/lru-cache).

|Operation         |dw-cache |lru-cache|Faster|
|:-----------------|--------:|--------:|-----:|
|set     100 (hit) | 20,549K | 12,378K |  66% |
|set   1,000 (hit) | 18,664K | 11,697K |  59% |
|set  10,000 (hit) | 17,992K | 11,648K |  54% |
|set 100,000 (hit) | 11,126K |  8,709K |  27% |
|set     100 (miss)|  3,454K |  7,765K | -66% |
|set   1,000 (miss)|  4,921K |  7,185K | -32% |
|set  10,000 (miss)|  3,041K |  3,704K | -18% |
|set 100,000 (miss)|  1,820K |  2,275K | -20% |
|get     100 (hit) | 12,187K | 25,068K | -52% |
|get   1,000 (hit) | 15,451K | 21,783K | -30% |
|get  10,000 (hit) | 14,723K | 19,179K | -24% |
|get 100,000 (hit) | 10,548K | 13,161K | -20% |
|get     100 (miss)| 44,823K | 43,858K |   2% |
|get   1,000 (miss)| 38,587K | 38,482K |   0% |
|get  10,000 (miss)| 41,334K | 39,888K |   3% |
|get 100,000 (miss)| 22,200K | 21,821K |   1% |

https://github.com/falsandtru/spica/runs/2047788861

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
