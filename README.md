# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

The source code is maintained on the next source repository.

https://github.com/falsandtru/spica

## Abstract

The highest performance constant complexity cache algorithm among the ones taking no large tradeoffs.

## Properties

Generally superior and almost flawless.

- High performance
  - High hit ratio
    - Highest hit ratio among all the eviction algorithms.
    - Highest hit ratio among all the constant complexity algorithms.
    - Near ARC (S3, OLTP).
    - Significantly higher than ARC (DS1, GLI, LOOP).
  - Low overhead (High throughput)
    - Constant time complexity overhead decreasing in linear time.
    - Use of only two lists.
  - Low latency
    - Constant extra time complexity (meaning excluding key search).
    - No batch processing like LIRS and TinyLFU.
  - Parallel suitable
    - Separated lists are suitable for lock-free processing.
- Efficient
  - Low memory usage
    - Constant extra space complexity.
    - Retain only keys of resident entries (No history).
- Total resistance
  - Scan, loop, churn, and burst resistance
- CLOCK suitable
  - Lower overhead than CAR
    - CDW (CLOCK with DWC) has no lists.
  - Higher resistance than CAR and CLOCK-Pro
    - CAR and CLOCK-Pro have no or a few loop resistance.
- Few tradeoffs
  - Not the highest hit-ratio level
  - Substantially no tradeoffs

## Efficiency

Some different cache algorithms require extra memory space to retain evicted keys.
Extra linear time complexity indicates the existence of batch processing.
Note that admission algorithm doesn't work without eviction algorithm.

|Algorithm|Type |Time complexity<br>(Extra, Worst case)|Space complexity<br>(Extra)|Key size|Data structures|
|:-------:|:---:|:------:|:------:|:---------:|:----------------:|
| LRU     |Evict|Constant|Constant|    1x     |1 list            |
| DWC     |Evict|Constant|Constant|    1x     |2 lists           |
| ARC     |Evict|Constant|Linear  |    2x     |4 lists           |
| LIRS    |Evict|Linear  |Linear  |**3-2500x**|2 lists           |
| TinyLFU |Admit|Linear  |Linear  |    0      |5 arrays          |
|W-TinyLFU|Admit|Linear  |Linear  |    0      |1 list<br>4 arrays|

https://github.com/ben-manes/caffeine/wiki/Efficiency<br>
https://github.com/zhongch4g/LIRS2/blob/master/src/replace_lirs_base.cc

## Resistance

Churn resistance is inferred from DS1's result.
LIRS's burst resistance means resistance to continuous cache miss.

|Algorithm|Type |Scan|Loop|Churn|Burst|
|:-------:|:---:|:--:|:--:|:---:|:---:|
| LRU     |Evict|    |    |     |  ✓ |
| DWC     |Evict| ✓ |  ✓ | ✓  |  ✓  |
| ARC     |Evict| ✓ |     |    |  ✓  |
| LIRS    |Evict| ✓ |  ✓ |     |     |
| TinyLFU |Admit| ✓ |  ✓ | ✓  |     |
|W-TinyLFU|Admit| ✓ |  ✓ | ✓  |  ✓  |

## Tradeoffs

Note that LIRS and TinyLFU are not practical cache algorithms.

- LRU
  - Low performance
  - No resistance
    - **Scan access clears all entries.**
- DWC
  - Not the highest hit-ratio level
  - Substantially no tradeoffs
- ARC
  - Middle performance
  - Inefficient
    - 2x key size.
  - High overhead
    - 4 lists.
  - Few resistance
    - No loop resistance.
- LIRS
  - Extremely inefficient
    - ***3-2500x key size.***
  - Latency spikes
    - ***Bulk deletion of low-frequency entries takes linear time.***
  - Vulnerable algorithm
    - ***Continuous cache miss explodes key size.***
      - https://issues.redhat.com/browse/ISPN-7171
      - https://issues.redhat.com/browse/ISPN-7246
- TinyLFU
  - Unreliable performance
    - *Burst access degrades the performance.*
    - Lower hit ratio than LRU at OLTP.
    - Many major benchmarks are lacking in the paper despite the performance of TinyLFU is significantly worse than W-TinyLFU.
  - Latency spikes
    - **Whole reset of Bloom filters takes linear time.**
  - Vulnerable algorithm
    - *Burst access saturates Bloom filters.*
- W-TinyLFU
  - Latency spikes
    - **Whole reset of Bloom filters takes linear time.**
  - (Essentially high overhead)
    - Would not to be convertible to CLOCK.

## Hit ratio

### DS1

W-TinyLFU > (LIRS) > DWC > (TinyLFU) > ARC > LRU

```
DS1 1,000,000
LRU hit ratio 3.0%
DWC hit ratio 6.4%
DWC - LRU hit ratio delta 3.3%
DWC / LRU hit ratio rate  207%

DS1 2,000,000
LRU hit ratio 10.7%
DWC hit ratio 19.0%
DWC - LRU hit ratio delta 8.3%
DWC / LRU hit ratio rate  177%

DS1 3,000,000
LRU hit ratio 18.5%
DWC hit ratio 30.5%
DWC - LRU hit ratio delta 11.9%
DWC / LRU hit ratio rate  164%

DS1 4,000,000
LRU hit ratio 20.2%
DWC hit ratio 35.1%
DWC - LRU hit ratio delta 14.8%
DWC / LRU hit ratio rate  173%

DS1 5,000,000
LRU hit ratio 21.0%
DWC hit ratio 40.1%
DWC - LRU hit ratio delta 19.1%
DWC / LRU hit ratio rate  191%

DS1 6,000,000
LRU hit ratio 33.9%
DWC hit ratio 45.7%
DWC - LRU hit ratio delta 11.7%
DWC / LRU hit ratio rate  134%

DS1 7,000,000
LRU hit ratio 38.8%
DWC hit ratio 51.5%
DWC - LRU hit ratio delta 12.6%
DWC / LRU hit ratio rate  132%

DS1 8,000,000
LRU hit ratio 43.0%
DWC hit ratio 60.0%
DWC - LRU hit ratio delta 17.0%
DWC / LRU hit ratio rate  139%
```

### S3

W-TinyLFU, (TinyLFU) > (LIRS) > ARC, DWC > LRU

```
S3 100,000
LRU hit ratio 2.3%
DWC hit ratio 10.1%
DWC - LRU hit ratio delta 7.8%
DWC / LRU hit ratio rate  435%

S3 200,000
LRU hit ratio 4.6%
DWC hit ratio 17.9%
DWC - LRU hit ratio delta 13.2%
DWC / LRU hit ratio rate  387%

S3 300,000
LRU hit ratio 7.5%
DWC hit ratio 23.9%
DWC - LRU hit ratio delta 16.3%
DWC / LRU hit ratio rate  315%

S3 400,000
LRU hit ratio 12.0%
DWC hit ratio 29.3%
DWC - LRU hit ratio delta 17.3%
DWC / LRU hit ratio rate  243%

S3 500,000
LRU hit ratio 22.7%
DWC hit ratio 37.4%
DWC - LRU hit ratio delta 14.7%
DWC / LRU hit ratio rate  164%

S3 600,000
LRU hit ratio 34.6%
DWC hit ratio 46.1%
DWC - LRU hit ratio delta 11.4%
DWC / LRU hit ratio rate  133%

S3 700,000
LRU hit ratio 46.0%
DWC hit ratio 55.2%
DWC - LRU hit ratio delta 9.2%
DWC / LRU hit ratio rate  120%

S3 800,000
LRU hit ratio 56.5%
DWC hit ratio 63.6%
DWC - LRU hit ratio delta 7.0%
DWC / LRU hit ratio rate  112%
```

### OLTP

W-TinyLFU > ARC, DWC > (LIRS) > LRU > (TinyLFU)

```
OLTP 250
LRU hit ratio 16.4%
DWC hit ratio 18.2%
DWC - LRU hit ratio delta 1.7%
DWC / LRU hit ratio rate  110%

OLTP 500
LRU hit ratio 23.4%
DWC hit ratio 28.9%
DWC - LRU hit ratio delta 5.4%
DWC / LRU hit ratio rate  123%

OLTP 750
LRU hit ratio 28.2%
DWC hit ratio 34.7%
DWC - LRU hit ratio delta 6.4%
DWC / LRU hit ratio rate  122%

OLTP 1,000
LRU hit ratio 32.8%
DWC hit ratio 38.0%
DWC - LRU hit ratio delta 5.1%
DWC / LRU hit ratio rate  115%

OLTP 1,250
LRU hit ratio 36.2%
DWC hit ratio 40.1%
DWC - LRU hit ratio delta 3.9%
DWC / LRU hit ratio rate  110%

OLTP 1,500
LRU hit ratio 38.6%
DWC hit ratio 41.8%
DWC - LRU hit ratio delta 3.1%
DWC / LRU hit ratio rate  108%

OLTP 1,750
LRU hit ratio 40.7%
DWC hit ratio 43.2%
DWC - LRU hit ratio delta 2.5%
DWC / LRU hit ratio rate  106%

OLTP 2,000
LRU hit ratio 42.4%
DWC hit ratio 44.5%
DWC - LRU hit ratio delta 2.0%
DWC / LRU hit ratio rate  104%
```

### LOOP

W-TinyLFU, (LIRS) > (TinyLFU) >= DWC >> ARC > LRU

```
GLI 250
LRU hit ratio 0.9%
DWC hit ratio 11.0%
DWC - LRU hit ratio delta 10.1%
DWC / LRU hit ratio rate  1187%

GLI 500
LRU hit ratio 0.9%
DWC hit ratio 25.2%
DWC - LRU hit ratio delta 24.2%
DWC / LRU hit ratio rate  2617%

GLI 750
LRU hit ratio 1.1%
DWC hit ratio 41.3%
DWC - LRU hit ratio delta 40.1%
DWC / LRU hit ratio rate  3552%

GLI 1,000
LRU hit ratio 11.2%
DWC hit ratio 46.0%
DWC - LRU hit ratio delta 34.8%
DWC / LRU hit ratio rate  410%

GLI 1,250
LRU hit ratio 21.2%
DWC hit ratio 52.0%
DWC - LRU hit ratio delta 30.8%
DWC / LRU hit ratio rate  245%

GLI 1,500
LRU hit ratio 36.5%
DWC hit ratio 54.1%
DWC - LRU hit ratio delta 17.6%
DWC / LRU hit ratio rate  148%

GLI 1,750
LRU hit ratio 45.0%
DWC hit ratio 54.5%
DWC - LRU hit ratio delta 9.4%
DWC / LRU hit ratio rate  120%

GLI 2,000
LRU hit ratio 57.4%
DWC hit ratio 57.4%
DWC - LRU hit ratio delta 0.0%
DWC / LRU hit ratio rate  100%
```

```
LOOP 100
LRU hit ratio 0.0%
DWC hit ratio 9.6%
DWC - LRU hit ratio delta 9.6%
DWC / LRU hit ratio rate  Infinity%

LOOP 250
LRU hit ratio 0.0%
DWC hit ratio 24.0%
DWC - LRU hit ratio delta 24.0%
DWC / LRU hit ratio rate  Infinity%

LOOP 500
LRU hit ratio 0.0%
DWC hit ratio 48.7%
DWC - LRU hit ratio delta 48.7%
DWC / LRU hit ratio rate  Infinity%

LOOP 750
LRU hit ratio 0.0%
DWC hit ratio 70.5%
DWC - LRU hit ratio delta 70.5%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,000
LRU hit ratio 0.0%
DWC hit ratio 98.6%
DWC - LRU hit ratio delta 98.6%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,250
LRU hit ratio 99.8%
DWC hit ratio 99.8%
DWC - LRU hit ratio delta 0.0%
DWC / LRU hit ratio rate  100%
```

https://github.com/dgraph-io/ristretto<br>
https://github.com/dgraph-io/benchmarks

## Throughput

95-70% of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 7,865,510 ops/sec ±1.90% (118 runs sampled)'

'DW-Cache simulation 100 x 7,670,001 ops/sec ±1.84% (121 runs sampled)'

'LRUCache simulation 1,000 x 7,274,767 ops/sec ±1.92% (120 runs sampled)'

'DW-Cache simulation 1,000 x 7,084,134 ops/sec ±1.83% (121 runs sampled)'

'LRUCache simulation 10,000 x 6,667,446 ops/sec ±1.70% (121 runs sampled)'

'DW-Cache simulation 10,000 x 6,249,041 ops/sec ±1.64% (120 runs sampled)'

'LRUCache simulation 100,000 x 3,887,037 ops/sec ±1.44% (116 runs sampled)'

'DW-Cache simulation 100,000 x 3,065,173 ops/sec ±2.48% (109 runs sampled)'

'LRUCache simulation 1,000,000 x 1,855,032 ops/sec ±2.43% (102 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,234,765 ops/sec ±2.05% (113 runs sampled)'
```

https://github.com/falsandtru/spica/actions/runs/3247690934/jobs/5328013465

## Comprehensive evaluation

### Hit ratio

|Rank     |Algorithms    |
|:--------|:-------------|
|Very high|W-TinyLFU     |
|Hight    |(LIRS) > DWC  |
|Middle   |ARC, (TinyLFU)|
|Low      |LRU           |

### Efficiency

|Extra space |Algorithms           |
|:-----------|:--------------------|
|Constant    |LRU, DWC             |
|Linear (< 1)|W-TinyLFU > (TinyLFU)|
|Linear (1)  |ARC                  |
|Linear (> 1)|(LIRS)               |

### Resistance

|Rank        |Algorithms        |
|:-----------|:-----------------|
|Total-high  |W-TinyLFU > (LIRS)|
|Total-middle|(TinyLFU) >= DWC  |
|Few         |ARC               |
|None        |LRU               |

### Throughput

|Class                       |Algorithms        |
|:---------------------------|:-----------------|
|Bloom filter + Static list  |(TinyLFU)         |
|Multiple lists (Lock-free)  |DWC > (LIRS) > ARC|
|Adaptive list + Bloom filter|W-TinyLFU         |
|Static list                 |LRU               |

### Latency

|Extra time  |Algorithms           |
|:-----------|:--------------------|
|Constant    |LRU, DWC, ARC        |
|Linear (1)  |W-TinyLFU > (TinyLFU)|
|Linear (> 1)|(LIRS)               |

### Vulnerability

|Class  |Algorithms|
|:------|:---------|
|Degrade|(TinyLFU) |
|Crush  |(LIRS)    |

## API

```ts
export namespace Cache {
  export interface Options<K, V = undefined> {
    readonly capacity?: number;
    readonly window?: number;
    readonly age?: number;
    readonly earlyExpiring?: boolean;
    readonly disposer?: (value: V, key: K) => void;
    readonly capture?: {
      readonly delete?: boolean;
      readonly clear?: boolean;
    };
    // Mainly for experiments.
    readonly resolution?: number;
    readonly offset?: number;
    readonly entrance?: number;
    readonly threshold?: number;
    readonly sweep?: {
      readonly interval?: number;
      readonly shift?: number;
    };
  }
}
export class Cache<K, V = undefined> {
  constructor(capacity: number, opts?: Cache.Options<K, V>);
  constructor(opts: Cache.Options<K, V>);
  put(key: K, value: V, opts?: { size?: number; age?: number; }): boolean;
  put(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): boolean;
  set(key: K, value: V, opts?: { size?: number; age?: number; }): this;
  set(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): this;
  get(key: K): V | undefined;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  resize(capacity: number): void;
  readonly length: number;
  readonly size: number;
  [Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
```
