# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

The source code is maintained on the next source repository.

https://github.com/falsandtru/spica

## Abstract

The highest performance constant complexity cache algorithm.

## Strategies

- Dynamic partition
- Sliding window
- Transitive wide MRU with round replacement

## Properties

Generally superior and almost flawless.

- High performance
  - High hit ratio (DS1, S3, OLTP, GLI)
    - Highest hit ratio among all the eviction algorithms taking no large tradeoffs.
    - Highest hit ratio among all the constant complexity algorithms.
    - Near ARC (S3, OLTP).
    - Significantly higher than ARC (DS1, GLI).
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
- Few tradeoffs
  - Not the highest hit-ratio level
  - Substantially no tradeoffs
- Compatible with ARC
  - Comprehensively higher performance
- Upward compatible with Segmented LRU
  - Totally higher performance
  - Suitable for TinyLFU
    - Better for (W-)TinyLFU's eviction algorithm
- CLOCK adaptive
  - Low overhead
    - CDW (CLOCK with DWC) requires no lists (for history).
  - High resistance
    - CAR has no loop resistance.
    - CLOCK-Pro would have no churn resistance.
  - Possibly better than CLOCK-Pro
    - CDW may be better for strict requirements.
    - Comprehensive comparison of CDW and CLOCK-Pro is uncertain.

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

Note that LIRS and TinyLFU are risky cache algorithms.

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
  - Spike latency
    - ***Bulk deletion of low-frequency entries takes linear time.***
  - Vulnerable algorithm
    - ***Continuous cache miss explodes key size.***
      - https://issues.redhat.com/browse/ISPN-7171
      - https://issues.redhat.com/browse/ISPN-7246
      - https://clojure.atlassian.net/browse/CCACHE-32
- TinyLFU
  - Unreliable performance
    - *Burst access degrades the performance.*
    - Lower hit ratio than LRU at OLTP.
    - Many major benchmarks are lacking in the paper despite the performance of TinyLFU is significantly worse than W-TinyLFU.
  - Spike latency
    - **Whole reset of Bloom filters takes linear time.**
  - Vulnerable algorithm
    - *Burst access saturates Bloom filters.*
- W-TinyLFU
  - Spike latency
    - **Whole reset of Bloom filters takes linear time.**
  - (Essentially high overhead)
    - Would not to be convertible to CLOCK.

## Hit ratio

Note that another cache algorithm sometimes changes the parameter values per workload to get a favorite result as the paper of TinyLFU has changed the window size of W-TinyLFU.
All the results of DWC are measured by the same default parameter values.

### DS1

W-TinyLFU > (LIRS) > DWC > (TinyLFU) > ARC > LRU

- In 4,000,000 to 5,000,000, LIRS and ARC have stopped increasing, but DWC has consistently increased.
- At 5,000,000, DWC is slightly better than LIRS.
- At 8,000,000, DWC is significantly better than ARC and TinyLFU.

```
DS1 1,000,000
LRU hit ratio 3.08%
DWC hit ratio 6.40%
DWC - LRU hit ratio delta 3.31%
DWC / LRU hit ratio rate  207%

DS1 2,000,000
LRU hit ratio 10.74%
DWC hit ratio 19.09%
DWC - LRU hit ratio delta 8.34%
DWC / LRU hit ratio rate  177%

DS1 3,000,000
LRU hit ratio 18.59%
DWC hit ratio 30.53%
DWC - LRU hit ratio delta 11.94%
DWC / LRU hit ratio rate  164%

DS1 4,000,000
LRU hit ratio 20.24%
DWC hit ratio 35.14%
DWC - LRU hit ratio delta 14.89%
DWC / LRU hit ratio rate  173%

DS1 5,000,000
LRU hit ratio 21.03%
DWC hit ratio 40.19%
DWC - LRU hit ratio delta 19.15%
DWC / LRU hit ratio rate  191%

DS1 6,000,000
LRU hit ratio 33.95%
DWC hit ratio 45.70%
DWC - LRU hit ratio delta 11.75%
DWC / LRU hit ratio rate  134%

DS1 7,000,000
LRU hit ratio 38.89%
DWC hit ratio 51.55%
DWC - LRU hit ratio delta 12.65%
DWC / LRU hit ratio rate  132%

DS1 8,000,000
LRU hit ratio 43.03%
DWC hit ratio 60.07%
DWC - LRU hit ratio delta 17.03%
DWC / LRU hit ratio rate  139%
```

### S3

W-TinyLFU, (TinyLFU) > (LIRS) > ARC, DWC > LRU

- DWC is an approximation of ARC.

```
S3 100,000
LRU hit ratio 2.32%
DWC hit ratio 10.14%
DWC - LRU hit ratio delta 7.81%
DWC / LRU hit ratio rate  435%

S3 200,000
LRU hit ratio 4.63%
DWC hit ratio 17.92%
DWC - LRU hit ratio delta 13.29%
DWC / LRU hit ratio rate  387%

S3 300,000
LRU hit ratio 7.58%
DWC hit ratio 23.92%
DWC - LRU hit ratio delta 16.33%
DWC / LRU hit ratio rate  315%

S3 400,000
LRU hit ratio 12.03%
DWC hit ratio 29.34%
DWC - LRU hit ratio delta 17.30%
DWC / LRU hit ratio rate  243%

S3 500,000
LRU hit ratio 22.76%
DWC hit ratio 37.49%
DWC - LRU hit ratio delta 14.72%
DWC / LRU hit ratio rate  164%

S3 600,000
LRU hit ratio 34.63%
DWC hit ratio 46.12%
DWC - LRU hit ratio delta 11.49%
DWC / LRU hit ratio rate  133%

S3 700,000
LRU hit ratio 46.04%
DWC hit ratio 55.25%
DWC - LRU hit ratio delta 9.21%
DWC / LRU hit ratio rate  120%

S3 800,000
LRU hit ratio 56.59%
DWC hit ratio 63.66%
DWC - LRU hit ratio delta 7.06%
DWC / LRU hit ratio rate  112%
```

### OLTP

W-TinyLFU > ARC, DWC > (LIRS) > LRU > (TinyLFU)

- DWC is an approximation of ARC.

```
OLTP 250
LRU hit ratio 16.47%
DWC hit ratio 18.24%
DWC - LRU hit ratio delta 1.77%
DWC / LRU hit ratio rate  110%

OLTP 500
LRU hit ratio 23.44%
DWC hit ratio 28.99%
DWC - LRU hit ratio delta 5.55%
DWC / LRU hit ratio rate  123%

OLTP 750
LRU hit ratio 28.28%
DWC hit ratio 34.71%
DWC - LRU hit ratio delta 6.43%
DWC / LRU hit ratio rate  122%

OLTP 1,000
LRU hit ratio 32.83%
DWC hit ratio 38.01%
DWC - LRU hit ratio delta 5.18%
DWC / LRU hit ratio rate  115%

OLTP 1,250
LRU hit ratio 36.20%
DWC hit ratio 40.13%
DWC - LRU hit ratio delta 3.92%
DWC / LRU hit ratio rate  110%

OLTP 1,500
LRU hit ratio 38.69%
DWC hit ratio 41.81%
DWC - LRU hit ratio delta 3.11%
DWC / LRU hit ratio rate  108%

OLTP 1,750
LRU hit ratio 40.78%
DWC hit ratio 43.28%
DWC - LRU hit ratio delta 2.50%
DWC / LRU hit ratio rate  106%

OLTP 2,000
LRU hit ratio 42.46%
DWC hit ratio 44.55%
DWC - LRU hit ratio delta 2.08%
DWC / LRU hit ratio rate  104%
```

### LOOP

W-TinyLFU, (LIRS) > (TinyLFU) >= DWC >> ARC > LRU

- DWC is almost the same as TinyLFU.

```
GLI 250
LRU hit ratio 0.93%
DWC hit ratio 13.84%
DWC - LRU hit ratio delta 12.91%
DWC / LRU hit ratio rate  1487%

GLI 500
LRU hit ratio 0.96%
DWC hit ratio 25.03%
DWC - LRU hit ratio delta 24.06%
DWC / LRU hit ratio rate  2596%

GLI 750
LRU hit ratio 1.16%
DWC hit ratio 41.33%
DWC - LRU hit ratio delta 40.17%
DWC / LRU hit ratio rate  3552%

GLI 1,000
LRU hit ratio 11.22%
DWC hit ratio 45.99%
DWC - LRU hit ratio delta 34.77%
DWC / LRU hit ratio rate  409%

GLI 1,250
LRU hit ratio 21.25%
DWC hit ratio 52.12%
DWC - LRU hit ratio delta 30.86%
DWC / LRU hit ratio rate  245%

GLI 1,500
LRU hit ratio 36.56%
DWC hit ratio 54.20%
DWC - LRU hit ratio delta 17.63%
DWC / LRU hit ratio rate  148%

GLI 1,750
LRU hit ratio 45.04%
DWC hit ratio 54.52%
DWC - LRU hit ratio delta 9.47%
DWC / LRU hit ratio rate  121%

GLI 2,000
LRU hit ratio 57.41%
DWC hit ratio 57.41%
DWC - LRU hit ratio delta 0.00%
DWC / LRU hit ratio rate  100%
```

```
LOOP 100
LRU hit ratio 0.00%
DWC hit ratio 9.67%
DWC - LRU hit ratio delta 9.67%
DWC / LRU hit ratio rate  Infinity%

LOOP 250
LRU hit ratio 0.00%
DWC hit ratio 24.06%
DWC - LRU hit ratio delta 24.06%
DWC / LRU hit ratio rate  Infinity%

LOOP 500
LRU hit ratio 0.00%
DWC hit ratio 49.03%
DWC - LRU hit ratio delta 49.03%
DWC / LRU hit ratio rate  Infinity%

LOOP 750
LRU hit ratio 0.00%
DWC hit ratio 73.81%
DWC - LRU hit ratio delta 73.81%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,000
LRU hit ratio 0.00%
DWC hit ratio 98.61%
DWC - LRU hit ratio delta 98.61%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,250
LRU hit ratio 99.80%
DWC hit ratio 99.80%
DWC - LRU hit ratio delta 0.00%
DWC / LRU hit ratio rate  100%
```

https://github.com/dgraph-io/ristretto<br>
https://github.com/dgraph-io/benchmarks

## Throughput

100-80% of [lru-cache](https://www.npmjs.com/package/lru-cache).

No result with 10,000,000 because lru-cache crushes with the next error on the next machine of GitHub Actions.
It is verified that the error was thrown also when benchmarking only lru-cache.
Of course it is verified that DWC works fine under the same condition.

> Error: Uncaught RangeError: Map maximum size exceeded

> System:<br>
  OS: Linux 5.15 Ubuntu 20.04.5 LTS (Focal Fossa)<br>
  CPU: (2) x64 Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz<br>
  Memory: 5.88 GB / 6.78 GB

```
'LRUCache new x 82,642 ops/sec ±0.75% (121 runs sampled)'

'DW-Cache new x 6,390,636 ops/sec ±1.25% (123 runs sampled)'

'LRUCache simulation 100 x 8,026,811 ops/sec ±1.94% (120 runs sampled)'

'DW-Cache simulation 100 x 7,159,318 ops/sec ±1.73% (121 runs sampled)'

'LRUCache simulation 1,000 x 7,278,385 ops/sec ±1.88% (120 runs sampled)'

'DW-Cache simulation 1,000 x 7,269,285 ops/sec ±1.91% (120 runs sampled)'

'LRUCache simulation 10,000 x 6,850,788 ops/sec ±1.81% (121 runs sampled)'

'DW-Cache simulation 10,000 x 6,582,627 ops/sec ±1.60% (122 runs sampled)'

'LRUCache simulation 100,000 x 3,729,514 ops/sec ±1.91% (114 runs sampled)'

'DW-Cache simulation 100,000 x 3,548,031 ops/sec ±2.57% (111 runs sampled)'

'LRUCache simulation 1,000,000 x 1,760,670 ops/sec ±2.39% (99 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,438,769 ops/sec ±2.32% (112 runs sampled)'
```

https://github.com/falsandtru/spica/actions/runs/3266826046/jobs/5371240053

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

|Class                      |Algorithms        |
|:--------------------------|:-----------------|
|Bloom filter + Static list |(TinyLFU)         |
|Multiple lists (Lock-free) |DWC > (LIRS) > ARC|
|Dynamic list + Bloom filter|W-TinyLFU         |
|Static list                |LRU               |

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
