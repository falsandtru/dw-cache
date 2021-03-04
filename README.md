# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Performance comparison

### Hit rate (%)

Higher x0.9-2.8 hit rate of LRU.

```
DEBUG: 'LRU hit rate even 100', 10.026
DEBUG: 'DWC hit rate even 100', 10.007
DEBUG: 'LFU ratio even 100', 83, 82
DEBUG: 'DWC / LRU hit rate ratio even 100', '99%'
.
DEBUG: 'LRU hit rate uneven 100', 18.526
DEBUG: 'DWC hit rate uneven 100', 37.309
DEBUG: 'LFU ratio uneven 100', 98, 97
DEBUG: 'DWC / LRU hit rate ratio uneven 100', '201%'
.
DEBUG: 'LRU hit rate uneven 100 transitive distribution', 18.466
DEBUG: 'DWC hit rate uneven 100 transitive distribution', 37.79
DEBUG: 'LFU ratio uneven 100 transitive distribution', 100, 97
DEBUG: 'DWC / LRU hit rate ratio uneven 100 transitive distribution', '204%'
.
DEBUG: 'LRU hit rate uneven 100 transitive bias', 17.526
DEBUG: 'DWC hit rate uneven 100 transitive bias', 16.659
DEBUG: 'LFU ratio uneven 100 transitive bias', 54, 54
DEBUG: 'DWC / LRU hit rate ratio uneven 100 transitive bias', '95%'
.
DEBUG: 'LRU hit rate uneven 100 sequential', 13.963
DEBUG: 'DWC hit rate uneven 100 sequential', 39.154
DEBUG: 'LFU ratio uneven 100 sequential', 100, 97
DEBUG: 'DWC / LRU hit rate ratio uneven 100 sequential', '280%'
.
DEBUG: 'LRU hit rate uneven 100 adversarial', 41.95
DEBUG: 'DWC hit rate uneven 100 adversarial', 42.615
DEBUG: 'LFU ratio uneven 100 adversarial', 10, 10
DEBUG: 'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2031763150

### Benchmark (ops/sec)

Slower x0.2-0.5 of [lru-cache](https://www.npmjs.com/package/lru-cache).

|Operation         |dw-cache |lru-cache|Faster|
|:-----------------|--------:|--------:|-----:|
|set     100 (hit) | 14,363K |  8,945K |  60% |
|set   1,000 (hit) | 14,536K |  8,095K |  79% |
|set  10,000 (hit) | 13,677K |  8,323K |  64% |
|set 100,000 (hit) |  9,465K |  6,783K |  39% |
|set     100 (miss)|  4,450K |  5,358K | -17% |
|set   1,000 (miss)|  4,015K |  5,776K |  -8% |
|set  10,000 (miss)|  2,551K |  2,748K |  -8% |
|set 100,000 (miss)|  1,373K |  1,882K | -28% |
|get     100 (hit) |  8,424K | 16,010K | -48% |
|get   1,000 (hit) | 10,060K | 14,447K | -31% |
|get  10,000 (hit) | 10,537K | 13,663K | -23% |
|get 100,000 (hit) |  7,943K | 10,285K | -23% |
|get     100 (miss)| 25,818K | 25,416K |   1% |
|get   1,000 (miss)| 24,149K | 22,475K |   7% |
|get  10,000 (miss)| 24,027K | 22,894K |   4% |
|get 100,000 (miss)| 13,773K | 13,194K |   4% |

https://github.com/falsandtru/spica/runs/2031798638

## API

```ts
export interface CacheOptions<K, V = undefined> {
  readonly space?: number;
  readonly age?: number;
  readonly disposer?: (key: K, value: V) => void;
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
