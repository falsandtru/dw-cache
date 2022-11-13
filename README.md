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
    - Highest hit ratio among all the general-purpose cache algorithms.
    - Near ARC (S3, OLTP).
    - Significantly higher than ARC (DS1, GLI).
  - Low overhead (High throughput)
    - Constant time complexity overhead decreasing in linear time.
    - Use of only two lists.
  - Low latency
    - Constant time complexity.
    - No batch processing like LIRS and TinyLFU.
  - Parallel suitable
    - Separated lists are suitable for lock-free processing.
- Efficient
  - Low memory usage
    - Constant extra space complexity.
    - Retain only keys of resident entries (No history).
  - Immediate release of evicted keys
    - Primary standard cache library have to be possible to release memory immediately.
- High resistance
  - Scan, loop, and burst resistance
- Few tradeoffs
  - Not the highest hit ratio
  - Substantially no tradeoffs
    - Namely the highest baseline of cache algorithms.
- Compatible with ARC
  - Comprehensively higher performance
- Upward compatible with Segmented LRU
  - Totally higher performance
  - Suitable for TinyLFU
    - Better for (W-)TinyLFU's eviction algorithm.
- CLOCK adaptive
  - Low overhead
    - CDW (CLOCK with DWC) requires no lists (for history).
  - High resistance
    - CAR has no loop resistance.

## Efficiency

Some different cache algorithms require extra memory space to retain evicted keys.
Linear time complexity indicates the existence of batch processing.
Note that admission algorithm doesn't work without eviction algorithm.

|Algorithm|Type |Time complexity<br>(Worst case)|Space complexity<br>(Extra)|Key size|Data structures|
|:-------:|:---:|:------:|:------:|:---------:|:-----:|
| LRU     |Evict|Constant|Constant|    1x     |1 list |
| DWC     |Evict|Constant|Constant|    1x     |2 lists|
| ARC     |Evict|Constant|Linear  |    2x     |4 lists|
| LIRS    |Evict|Linear  |Linear  |**3-2500x**|2 lists|
| TinyLFU |Admit|Linear  |Linear  |8bit * 10N * 4|5 arrays|
|W-TinyLFU|Admit|Linear  |Linear  |8bit * 10N * 4|1 list<br>4 arrays|

https://github.com/ben-manes/caffeine/wiki/Efficiency<br>
https://github.com/zhongch4g/LIRS2/blob/master/src/replace_lirs_base.cc

## Resistance

LIRS's burst resistance means resistance to continuous cache miss.

|Algorithm|Type |Scan|Loop|Burst|
|:-------:|:---:|:--:|:--:|:---:|
| LRU     |Evict|    |    |  ✓ |
| DWC     |Evict| ✓ |  ✓ | ✓  |
| ARC     |Evict| ✓ |     | ✓  |
| LIRS    |Evict| ✓ |  ✓ |     |
| TinyLFU |Admit| ✓ |  ✓ |     |
|W-TinyLFU|Admit| ✓ |  ✓ | ✓  |

## Tradeoffs

Note that LIRS and TinyLFU are risky cache algorithms.

- LRU
  - Low performance
  - No resistance
    - **Scan access clears all entries.**
- DWC
  - Not the highest hit ratio
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
- TinyLFU
  - Unreliable performance
    - *Burst access degrades performance.*
    - Lower hit ratio than LRU at OLTP.
    - Many major benchmarks are lacking in the paper despite performance of TinyLFU is significantly worse than W-TinyLFU.
  - Restricted delete operation
    - Bloom filters don't support delete operation.
    - *Frequent delete operations degrade performance.*
  - Spike latency
    - **Whole reset of Bloom filters takes linear time.**
  - Vulnerable algorithm
    - *Burst access saturates Bloom filters.*
- W-TinyLFU
  - Restricted delete operation
    - Bloom filters don't support delete operation.
    - *Frequent delete operations degrade performance.*
  - Spike latency
    - **Whole reset of Bloom filters takes linear time.**

## Hit ratio

Note that another cache algorithm sometimes changes the parameter values per workload to get a favorite result as the paper of TinyLFU has changed the window size of W-TinyLFU.
All the results of DWC are measured by the same default parameter values.
Graphs are approximate.

1. Set the datasets to `./benchmark/trace` (See `./benchmark/ratio.ts`).
2. Run `npm i`
3. Run `npm run bench`
4. Click the DEBUG button to open a debug tab.
5. Close the previous tab.
6. Press F12 key to open devtools.
7. Select the console tab.

https://github.com/ben-manes/caffeine/wiki/Efficiency<br>
https://github.com/dgraph-io/ristretto<br>
https://github.com/dgraph-io/benchmarks

<!--
// https://www.chartjs.org/docs/latest/charts/line.html

const config = {
  type: 'line',
  data: data,
  options: {
    scales: {
        y: {
            min: 0,
        },
    },
    plugins: {
      title: {
        display: true,
        text: 'WL'
      }
    }
  },
};
-->

### DS1

W-TinyLFU > (LIRS) > DWC, (TinyLFU) > ARC > LRU

- DWC is significantly better than ARC.

<!--
const data = {
  labels: [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000],
  datasets: [
    {
      label: 'Optimal',
      data: [20, 31, 41, 48, 55, 62, 69, 76],
    },
    {
      label: 'LRU',
      data: [3, 11, 19, 20, 21, 34, 39, 43],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [5, 22, 23, 29, 28, 36, 46, 50],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [12, 26, 38, 42, 47, 48, 54, 65],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [13, 25, 38, 38, 38, 47, 60, 71],
      borderColor: Utils.color(3),
    },
    {
      label: 'TinyLFU',
      data: [11, 25, 32, 38, 44, 48, 52, 55],
      borderColor: Utils.color(4),
    },
    {
      label: 'W-TinyLFU',
      data: [15, 27, 40, 45, 51, 58, 64, 70],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://user-images.githubusercontent.com/3143368/201526750-e0711cbe-2cd7-4a24-ae2f-3bb9938e29f1.png)

```
DS1 1,000,000
LRU hit ratio 3.08%
DWC hit ratio 11.82%
DWC - LRU hit ratio delta 8.73%
DWC / LRU hit ratio rate  383%

DS1 2,000,000
LRU hit ratio 10.74%
DWC hit ratio 25.72%
DWC - LRU hit ratio delta 14.98%
DWC / LRU hit ratio rate  239%

DS1 3,000,000
LRU hit ratio 18.59%
DWC hit ratio 38.32%
DWC - LRU hit ratio delta 19.72%
DWC / LRU hit ratio rate  206%

DS1 4,000,000
LRU hit ratio 20.24%
DWC hit ratio 42.02%
DWC - LRU hit ratio delta 21.78%
DWC / LRU hit ratio rate  207%

DS1 5,000,000
LRU hit ratio 21.03%
DWC hit ratio 46.46%
DWC - LRU hit ratio delta 25.43%
DWC / LRU hit ratio rate  220%

DS1 6,000,000
LRU hit ratio 33.95%
DWC hit ratio 48.28%
DWC - LRU hit ratio delta 14.33%
DWC / LRU hit ratio rate  142%

DS1 7,000,000
LRU hit ratio 38.89%
DWC hit ratio 53.51%
DWC - LRU hit ratio delta 14.61%
DWC / LRU hit ratio rate  137%

DS1 8,000,000
LRU hit ratio 43.03%
DWC hit ratio 64.55%
DWC - LRU hit ratio delta 21.52%
DWC / LRU hit ratio rate  150%
```

### S3

W-TinyLFU, (TinyLFU) > (LIRS) > ARC, DWC > LRU

- DWC is an approximation of ARC.

<!--
const data = {
  labels: [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000],
  datasets: [
    {
      label: 'Optimal',
      data: [25, 38, 51, 60, 67, 73, 77, 80],
    },
    {
      label: 'LRU',
      data: [2, 5, 8, 12, 23, 35, 46, 57],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [12, 22, 27, 30, 37, 45, 52, 59],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [10, 18, 24, 29, 38, 46, 55, 64],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [12, 15, 25, 35, 44, 53, 60, 66],
      borderColor: Utils.color(3),
    },
    {
      label: 'TinyLFU',
      data: [6, 18, 27, 37, 48, 56, 62, 68],
      borderColor: Utils.color(4),
    },
    {
      label: 'W-TinyLFU',
      data: [12, 23, 33, 42, 51, 59, 65, 70],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://user-images.githubusercontent.com/3143368/200155166-9c003b80-1fff-4292-8f4c-9bd41e4dcacc.png)

```
S3 100,000
LRU hit ratio 2.32%
DWC hit ratio 10.16%
DWC - LRU hit ratio delta 7.83%
DWC / LRU hit ratio rate  436%

S3 200,000
LRU hit ratio 4.63%
DWC hit ratio 17.90%
DWC - LRU hit ratio delta 13.27%
DWC / LRU hit ratio rate  386%

S3 300,000
LRU hit ratio 7.58%
DWC hit ratio 23.89%
DWC - LRU hit ratio delta 16.30%
DWC / LRU hit ratio rate  314%

S3 400,000
LRU hit ratio 12.03%
DWC hit ratio 29.32%
DWC - LRU hit ratio delta 17.28%
DWC / LRU hit ratio rate  243%

S3 500,000
LRU hit ratio 22.76%
DWC hit ratio 37.48%
DWC - LRU hit ratio delta 14.71%
DWC / LRU hit ratio rate  164%

S3 600,000
LRU hit ratio 34.63%
DWC hit ratio 46.12%
DWC - LRU hit ratio delta 11.49%
DWC / LRU hit ratio rate  133%

S3 700,000
LRU hit ratio 46.04%
DWC hit ratio 55.26%
DWC - LRU hit ratio delta 9.22%
DWC / LRU hit ratio rate  120%

S3 800,000
LRU hit ratio 56.59%
DWC hit ratio 63.74%
DWC - LRU hit ratio delta 7.14%
DWC / LRU hit ratio rate  112%
```

### OLTP

W-TinyLFU > ARC, DWC > (LIRS) > LRU > (TinyLFU)

- DWC is an approximation of ARC.

<!--
const data = {
  labels: [250, 500, 750, 1000, 1250, 1500, 1750, 2000],
  datasets: [
    {
      label: 'Optimal',
      data: [39, 45, 50, 52, 54, 56, 58, 60],
    },
    {
      label: 'LRU',
      data: [17, 23, 28, 33, 36, 39, 41, 43],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [22, 30, 35, 40, 41, 43, 44, 45],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [18, 29, 35, 38, 40, 42, 43, 45],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [19, 25, 30, 35, 37, 39, 41, 43],
      borderColor: Utils.color(3),
    },
    {
      label: 'TinyLFU',
      data: [16, 22, 23, 26, 29, 29, 31, 32],
      borderColor: Utils.color(4),
    },
    {
      label: 'W-TinyLFU',
      data: [25, 32, 37, 40, 42, 43, 44, 45],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://user-images.githubusercontent.com/3143368/200601395-55e379b1-d423-4fcb-9a04-29d2b4d7c3fc.png)

```
OLTP 250
LRU hit ratio 16.47%
DWC hit ratio 17.93%
DWC - LRU hit ratio delta 1.45%
DWC / LRU hit ratio rate  108%

OLTP 500
LRU hit ratio 23.44%
DWC hit ratio 28.81%
DWC - LRU hit ratio delta 5.37%
DWC / LRU hit ratio rate  122%

OLTP 750
LRU hit ratio 28.28%
DWC hit ratio 34.70%
DWC - LRU hit ratio delta 6.42%
DWC / LRU hit ratio rate  122%

OLTP 1,000
LRU hit ratio 32.83%
DWC hit ratio 38.02%
DWC - LRU hit ratio delta 5.19%
DWC / LRU hit ratio rate  115%

OLTP 1,250
LRU hit ratio 36.20%
DWC hit ratio 40.12%
DWC - LRU hit ratio delta 3.91%
DWC / LRU hit ratio rate  110%

OLTP 1,500
LRU hit ratio 38.69%
DWC hit ratio 41.81%
DWC - LRU hit ratio delta 3.11%
DWC / LRU hit ratio rate  108%

OLTP 1,750
LRU hit ratio 40.78%
DWC hit ratio 43.27%
DWC - LRU hit ratio delta 2.49%
DWC / LRU hit ratio rate  106%

OLTP 2,000
LRU hit ratio 42.46%
DWC hit ratio 44.56%
DWC - LRU hit ratio delta 2.09%
DWC / LRU hit ratio rate  104%
```

### GLI

W-TinyLFU, (LIRS) > DWC, (TinyLFU) >> ARC > LRU

<!--
const data = {
  labels: [250, 500, 750, 1000, 1250, 1500, 1750, 2000],
  datasets: [
    {
      label: 'Optimal',
      data: [18, 35, 46, 53, 57, 58, 58, 58],
    },
    {
      label: 'LRU',
      data: [1, 1, 1, 11, 21, 37, 45, 57],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [1, 1, 1, 20, 35, 50, 55, 57],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [16, 33, 41, 50, 52, 53, 56, 58],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [16, 34, 44, 51, 52, 54, 56, 58],
      borderColor: Utils.color(3),
    },
    {
      label: 'TinyLFU',
      data: [18, 26, 40, 46, 51, 54, 55, 57],
      borderColor: Utils.color(4),
    },
    {
      label: 'W-TinyLFU',
      data: [16, 34, 44, 51, 52, 54, 56, 58],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://user-images.githubusercontent.com/3143368/201527402-21c63bfc-32a1-4992-bb72-85925691cfef.png)

```
GLI 250
LRU hit ratio 0.93%
DWC hit ratio 16.12%
DWC - LRU hit ratio delta 15.19%
DWC / LRU hit ratio rate  1732%

GLI 500
LRU hit ratio 0.96%
DWC hit ratio 32.72%
DWC - LRU hit ratio delta 31.76%
DWC / LRU hit ratio rate  3394%

GLI 750
LRU hit ratio 1.16%
DWC hit ratio 41.40%
DWC - LRU hit ratio delta 40.24%
DWC / LRU hit ratio rate  3558%

GLI 1,000
LRU hit ratio 11.22%
DWC hit ratio 49.80%
DWC - LRU hit ratio delta 38.58%
DWC / LRU hit ratio rate  443%

GLI 1,250
LRU hit ratio 21.25%
DWC hit ratio 52.32%
DWC - LRU hit ratio delta 31.06%
DWC / LRU hit ratio rate  246%

GLI 1,500
LRU hit ratio 36.56%
DWC hit ratio 53.44%
DWC - LRU hit ratio delta 16.87%
DWC / LRU hit ratio rate  146%

GLI 1,750
LRU hit ratio 45.04%
DWC hit ratio 55.48%
DWC - LRU hit ratio delta 10.43%
DWC / LRU hit ratio rate  123%

GLI 2,000
LRU hit ratio 57.41%
DWC hit ratio 57.96%
DWC - LRU hit ratio delta 0.54%
DWC / LRU hit ratio rate  100%
```

### LOOP

```
LOOP 100
LRU hit ratio 0.00%
DWC hit ratio 9.17%
DWC - LRU hit ratio delta 9.17%
DWC / LRU hit ratio rate  Infinity%

LOOP 250
LRU hit ratio 0.00%
DWC hit ratio 23.49%
DWC - LRU hit ratio delta 23.49%
DWC / LRU hit ratio rate  Infinity%

LOOP 500
LRU hit ratio 0.00%
DWC hit ratio 47.73%
DWC - LRU hit ratio delta 47.73%
DWC / LRU hit ratio rate  Infinity%

LOOP 750
LRU hit ratio 0.00%
DWC hit ratio 71.22%
DWC - LRU hit ratio delta 71.22%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,000
LRU hit ratio 0.00%
DWC hit ratio 96.20%
DWC - LRU hit ratio delta 96.20%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,250
LRU hit ratio 99.80%
DWC hit ratio 99.80%
DWC - LRU hit ratio delta 0.00%
DWC / LRU hit ratio rate  100%
```

## Throughput

80-100% of [lru-cache](https://www.npmjs.com/package/lru-cache).

Note that the number of trials per capacity for simulation 1,000,000 is insufficient.

No result with 10,000,000 because lru-cache crushes with the next error on the next machine of GitHub Actions.
It is verified that the error was thrown also when benchmarking only lru-cache.
Of course it is verified that DWC works fine under the same condition.

> Error: Uncaught RangeError: Map maximum size exceeded

> System:<br>
  OS: Linux 5.15 Ubuntu 20.04.5 LTS (Focal Fossa)<br>
  CPU: (2) x64 Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz<br>
  Memory: 5.88 GB / 6.78 GB

```
'LRUCache new x 10,892 ops/sec ±1.67% (114 runs sampled)'

'DW-Cache new x 6,180,273 ops/sec ±0.89% (123 runs sampled)'

'LRUCache simulation 10 x 8,625,515 ops/sec ±1.05% (123 runs sampled)'

'DW-Cache simulation 10 x 7,665,021 ops/sec ±1.35% (122 runs sampled)'

'LRUCache simulation 100 x 8,939,202 ops/sec ±0.88% (123 runs sampled)'

'DW-Cache simulation 100 x 7,280,351 ops/sec ±0.78% (123 runs sampled)'

'LRUCache simulation 1,000 x 7,964,882 ops/sec ±0.44% (124 runs sampled)'

'DW-Cache simulation 1,000 x 7,436,336 ops/sec ±1.30% (123 runs sampled)'

'LRUCache simulation 10,000 x 6,896,531 ops/sec ±1.77% (121 runs sampled)'

'DW-Cache simulation 10,000 x 6,568,404 ops/sec ±1.64% (121 runs sampled)'

'LRUCache simulation 100,000 x 3,841,058 ops/sec ±1.38% (112 runs sampled)'

'DW-Cache simulation 100,000 x 3,778,800 ops/sec ±2.25% (110 runs sampled)'

'LRUCache simulation 1,000,000 x 1,921,274 ops/sec ±3.02% (103 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,572,905 ops/sec ±2.17% (111 runs sampled)'
```

```ts
const key = random() < 0.8
  ? random() * capacity * 1 | 0
  : random() * capacity * 9 + capacity | 0;
cache.get(key) ?? cache.set(key, {});
```

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

|Rank  |Algorithms        |
|:-----|:-----------------|
|High  |W-TinyLFU > (LIRS)|
|Middle|(TinyLFU) >= DWC  |
|Low   |ARC               |
|None  |LRU               |

### Throughput

|Class                      |Algorithms        |
|:--------------------------|:-----------------|
|Bloom filter + Static list |(TinyLFU)         |
|Multiple lists (Lock-free) |DWC > (LIRS) > ARC|
|Dynamic list + Bloom filter|W-TinyLFU         |
|Static list                |LRU               |

### Latency

|Time        |Algorithms           |
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
    // Max length.
    readonly capacity?: number;
    readonly window?: number;
    readonly resource?: number;
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
    readonly sweep?: {
      readonly threshold?: number;
      readonly window?: number;
      readonly range?: number;
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
  resize(capacity: number, resource?: number): void;
  readonly length: number;
  readonly size: number;
  [Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
```
