# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Performance comparison

### Hit rate (%)

Higher x0.9-2.8 hit rate of LRU.

```
'LRU hit rate even 100', 10.0265
'DWC hit rate even 100', 10.004
'LFU ratio even 100', 18, 17
'DWC / LRU hit rate ratio even 100', '99%'

'LRU hit rate uneven 100', 18.64
'DWC hit rate uneven 100', 37.5535
'LFU ratio uneven 100', 100, 98
'DWC / LRU hit rate ratio uneven 100', '201%'

'LRU hit rate uneven 100 transitive distribution', 18.4455
'DWC hit rate uneven 100 transitive distribution', 37.708
'LFU ratio uneven 100 transitive distribution', 99, 98
'DWC / LRU hit rate ratio uneven 100 transitive distribution', '204%'

'LRU hit rate uneven 100 transitive bias', 17.566
'DWC hit rate uneven 100 transitive bias', 16.5355
'LFU ratio uneven 100 transitive bias', 55, 54
'DWC / LRU hit rate ratio uneven 100 transitive bias', '94%'

'LRU hit rate uneven 100 sequential', 13.9335
'DWC hit rate uneven 100 sequential', 39.2995
'LFU ratio uneven 100 sequential', 100, 99
'DWC / LRU hit rate ratio uneven 100 sequential', '282%'

'LRU hit rate uneven 100 adversarial', 42.0535
'DWC hit rate uneven 100 adversarial', 42.6685
'LFU ratio uneven 100 adversarial', 10, 10
'DWC / LRU hit rate ratio uneven 100 adversarial', '101%'
```

https://github.com/falsandtru/spica/runs/2046523894

### Benchmark (ops/sec)

Slower x0.1-0.5 of [lru-cache](https://www.npmjs.com/package/lru-cache).

|Operation         |dw-cache |lru-cache|Faster|
|:-----------------|--------:|--------:|-----:|
|set     100 (hit) | 10,604K |  7,172K |  47% |
|set   1,000 (hit) |  9,833K |  6,756K |  45% |
|set  10,000 (hit) | 11,168K |  6,618K |  68% |
|set 100,000 (hit) |  6,263K |  5,364K |  16% |
|set     100 (miss)|  3,592K |  5,101K | -30% |
|set   1,000 (miss)|  3,263K |  4,571K | -29% |
|set  10,000 (miss)|  2,026K |  2,462K | -18% |
|set 100,000 (miss)|  1,163K |  1,387K | -17% |
|get     100 (hit) |  7,130K | 12,999K | -46% |
|get   1,000 (hit) |  9,022K | 11,545K | -12% |
|get  10,000 (hit) |  9,215K | 10,954K | -16% |
|get 100,000 (hit) |  6,505K |  7,082K |  -9% |
|get     100 (miss)| 20,872K | 19,983K |   4% |
|get   1,000 (miss)| 18,974K | 18,196K |   4% |
|get  10,000 (miss)| 20,027K | 17,870K |  12% |
|get 100,000 (miss)| 10,543K |  9,738K |   8% |

https://github.com/falsandtru/spica/runs/2046532617

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
