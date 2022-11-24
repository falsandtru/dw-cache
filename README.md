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
- Transitive wide MRU with cyclic replacement

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
    - Primary cache algorithm in the standard library must release memory immediately.
- High resistance
  - Scan, loop, and burst resistance
- Few tradeoffs
  - Not the highest hit ratio
  - Significantly small cache size can degrade hit ratio
- Upward compatible with ARC
  - Comprehensively higher performance
- Upward compatible with Segmented LRU
  - Totally higher performance
  - Suitable for TinyLFU
    - Better for (W-)TinyLFU's eviction algorithm.

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

LIRS's burst resistance means resistance to continuous cache misses.

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
  - Significantly small cache size can degrade hit ratio
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
    - ***Continuous cache misses at the last of LIR and of HIR entries explode key size.***
      - https://issues.redhat.com/browse/ISPN-7171
      - https://issues.redhat.com/browse/ISPN-7246
- TinyLFU
  - Unreliable performance
    - *Burst access degrades performance.*
    - Lower hit ratio than LRU at OLTP.
    - Many major benchmarks are lacking in the paper despite the performance of TinyLFU is worse than LRU in theory.
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

https://github.com/dgraph-io/benchmarks<br>
https://github.com/ben-manes/caffeine/wiki/Efficiency<br>
https://github.com/dgraph-io/ristretto<br>
https://github.com/jedisct1/rust-arc-cache/issues/1<br>
https://docs.google.com/spreadsheets/d/1G3deNz1gJCoXBE2IuraUSwLE7H_EMn4Sn2GU0HTpI5Y

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

W-TinyLFU > DWC, (LIRS) > (TinyLFU) > ARC > LRU

- DWC is significantly better than ARC.

<!--
const data = {
  labels: [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000],
  datasets: [
    {
      label: 'Optimal',
      data: [20.19, 31.79, 41.23, 48.09, 54.96, 61.82, 68.69, 74.93],
    },
    {
      label: 'LRU',
      data: [3.09, 10.74, 18.59, 20.24, 21.03, 33.95, 38.9, 43.03],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [6.68, 21.99, 24.16, 29.6, 29.44, 36.04, 47.22, 50.89],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [11.32, 26.32, 38.56, 42.70, 48.16, 56.03, 56.94, 63.82],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [12.98, 26.85, 38.02, 38.14, 38.18, 47.25, 59.89, 71.74],
      borderColor: Utils.color(3),
    },
    {
      label: 'TinyLFU',
      data: [11, 25, 32, 38, 44, 48, 52, 55],
      borderColor: Utils.color(4),
    },
    {
      label: 'W-TinyLFU',
      data: [15, 28, 40, 45, 51, 58, 64, 70],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://user-images.githubusercontent.com/3143368/203835191-6faa1e80-c6ce-488a-8bc9-24a95160a48b.png)

```
DS1 1,000,000
LRU hit ratio 3.08%
DWC hit ratio 11.32%
DWC - LRU hit ratio delta 8.24%
DWC / LRU hit ratio rate  367%

DS1 2,000,000
LRU hit ratio 10.74%
DWC hit ratio 26.32%
DWC - LRU hit ratio delta 15.57%
DWC / LRU hit ratio rate  244%

DS1 3,000,000
LRU hit ratio 18.59%
DWC hit ratio 38.56%
DWC - LRU hit ratio delta 19.97%
DWC / LRU hit ratio rate  207%

DS1 4,000,000
LRU hit ratio 20.24%
DWC hit ratio 42.70%
DWC - LRU hit ratio delta 22.45%
DWC / LRU hit ratio rate  210%

DS1 5,000,000
LRU hit ratio 21.03%
DWC hit ratio 48.16%
DWC - LRU hit ratio delta 27.13%
DWC / LRU hit ratio rate  229%

DS1 6,000,000
LRU hit ratio 33.95%
DWC hit ratio 56.03%
DWC - LRU hit ratio delta 22.08%
DWC / LRU hit ratio rate  165%

DS1 7,000,000
LRU hit ratio 38.89%
DWC hit ratio 56.94%
DWC - LRU hit ratio delta 18.04%
DWC / LRU hit ratio rate  146%

DS1 8,000,000
LRU hit ratio 43.03%
DWC hit ratio 63.82%
DWC - LRU hit ratio delta 20.78%
DWC / LRU hit ratio rate  148%
```

### S3

W-TinyLFU > (TinyLFU) > (LIRS) > DWC, ARC > LRU

- DWC is an approximation of ARC.

<!--
const data = {
  labels: [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000],
  datasets: [
    {
      label: 'Optimal',
      data: [25.42, 39.79, 50.92, 59.96, 67.09, 72.97, 77.57, 81.27],
    },
    {
      label: 'LRU',
      data: [2.33, 4.63, 7.59, 12.04, 22.77, 34.63, 46.04, 56.6],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [12.18, 21.74, 27.64, 32, 38.44, 46.25, 52.52, 60.14],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [10.50, 18.88, 24.56, 29.59, 37.48, 45.96, 55.07, 63.73],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [12.4, 15.55, 25.08, 34.69, 44.27, 53.15, 60.99, 67.64],
      borderColor: Utils.color(3),
    },
    {
      label: 'TinyLFU',
      data: [6, 18, 27, 37, 48, 56, 62, 68],
      borderColor: Utils.color(4),
    },
    {
      label: 'W-TinyLFU',
      data: [12, 23, 34, 43, 51, 59, 65, 70],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://user-images.githubusercontent.com/3143368/203834665-176093ba-fcd1-438d-b3c1-d4383b96c1ad.png)

```
S3 100,000
LRU hit ratio 2.32%
DWC hit ratio 10.50%
DWC - LRU hit ratio delta 8.18%
DWC / LRU hit ratio rate  451%

S3 200,000
LRU hit ratio 4.63%
DWC hit ratio 18.88%
DWC - LRU hit ratio delta 14.24%
DWC / LRU hit ratio rate  407%

S3 300,000
LRU hit ratio 7.58%
DWC hit ratio 24.56%
DWC - LRU hit ratio delta 16.97%
DWC / LRU hit ratio rate  323%

S3 400,000
LRU hit ratio 12.03%
DWC hit ratio 29.59%
DWC - LRU hit ratio delta 17.55%
DWC / LRU hit ratio rate  245%

S3 500,000
LRU hit ratio 22.76%
DWC hit ratio 37.48%
DWC - LRU hit ratio delta 14.71%
DWC / LRU hit ratio rate  164%

S3 600,000
LRU hit ratio 34.63%
DWC hit ratio 45.96%
DWC - LRU hit ratio delta 11.33%
DWC / LRU hit ratio rate  132%

S3 700,000
LRU hit ratio 46.04%
DWC hit ratio 55.07%
DWC - LRU hit ratio delta 9.03%
DWC / LRU hit ratio rate  119%

S3 800,000
LRU hit ratio 56.59%
DWC hit ratio 63.73%
DWC - LRU hit ratio delta 7.13%
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
      data: [38.47, 46.43, 50.67, 53.62, 55.84, 57.62, 59.13, 60.4],
    },
    {
      label: 'LRU',
      data: [16.47, 23.45, 28.28, 32.83, 36.21, 38.7, 40.79, 42.47],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [21.46, 30.61, 36.04, 39.06, 41.34, 43.15, 44.77, 46.17],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [18.01, 28.56, 34.34, 38.06, 40.25, 42.05, 43.46, 44.84],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [18.27, 26.87, 31.71, 34.82, 37.24, 39.2, 40.79, 42.52],
      borderColor: Utils.color(3),
    },
    {
      label: 'TinyLFU',
      data: [16, 22, 23, 26, 29, 29, 31, 32],
      borderColor: Utils.color(4),
    },
    {
      label: 'W-TinyLFU',
      data: [24, 32, 37, 40, 43, 43, 45, 46],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://user-images.githubusercontent.com/3143368/203835896-9c5520e8-1b85-4019-b03a-9b648fa69dd2.png)

```
OLTP 250
LRU hit ratio 16.47%
DWC hit ratio 18.01%
DWC - LRU hit ratio delta 1.54%
DWC / LRU hit ratio rate  109%

OLTP 500
LRU hit ratio 23.44%
DWC hit ratio 28.56%
DWC - LRU hit ratio delta 5.11%
DWC / LRU hit ratio rate  121%

OLTP 750
LRU hit ratio 28.28%
DWC hit ratio 34.34%
DWC - LRU hit ratio delta 6.06%
DWC / LRU hit ratio rate  121%

OLTP 1,000
LRU hit ratio 32.83%
DWC hit ratio 38.06%
DWC - LRU hit ratio delta 5.23%
DWC / LRU hit ratio rate  115%

OLTP 1,250
LRU hit ratio 36.20%
DWC hit ratio 40.25%
DWC - LRU hit ratio delta 4.04%
DWC / LRU hit ratio rate  111%

OLTP 1,500
LRU hit ratio 38.69%
DWC hit ratio 42.05%
DWC - LRU hit ratio delta 3.35%
DWC / LRU hit ratio rate  108%

OLTP 1,750
LRU hit ratio 40.78%
DWC hit ratio 43.46%
DWC - LRU hit ratio delta 2.67%
DWC / LRU hit ratio rate  106%

OLTP 2,000
LRU hit ratio 42.46%
DWC hit ratio 44.84%
DWC - LRU hit ratio delta 2.37%
DWC / LRU hit ratio rate  105%
```

### GLI

W-TinyLFU, (LIRS) > DWC > (TinyLFU) >> ARC > LRU

- DWC is significantly better than ARC.

<!--
const data = {
  labels: [250, 500, 750, 1000, 1250, 1500, 1750, 2000],
  datasets: [
    {
      label: 'Optimal',
      data: [17.71,34.33, 46.13, 53.15, 57.31, 57.96, 57.96, 57.96],
    },
    {
      label: 'LRU',
      data: [0.91, 0.95, 1.15, 11.21, 21.25, 36.56, 45.04, 57.41],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [1.38, 1.38, 1.41, 21.3, 34.43, 50.44, 55.06, 57.41],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [15.77, 31.43, 41.93, 48.90, 52.17, 53.93, 55.06, 57.41],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [15.91, 33.6, 43.61, 50.56, 51.85, 53.55, 55.58, 57.96],
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

![image](https://user-images.githubusercontent.com/3143368/203835991-79a57ee5-0e39-4edf-a873-35ff6e6d82bf.png)

```
GLI 250
LRU hit ratio 0.93%
DWC hit ratio 15.77%
DWC - LRU hit ratio delta 14.84%
DWC / LRU hit ratio rate  1694%

GLI 500
LRU hit ratio 0.96%
DWC hit ratio 31.43%
DWC - LRU hit ratio delta 30.46%
DWC / LRU hit ratio rate  3260%

GLI 750
LRU hit ratio 1.16%
DWC hit ratio 41.93%
DWC - LRU hit ratio delta 40.77%
DWC / LRU hit ratio rate  3604%

GLI 1,000
LRU hit ratio 11.22%
DWC hit ratio 48.90%
DWC - LRU hit ratio delta 37.68%
DWC / LRU hit ratio rate  435%

GLI 1,250
LRU hit ratio 21.25%
DWC hit ratio 52.17%
DWC - LRU hit ratio delta 30.91%
DWC / LRU hit ratio rate  245%

GLI 1,500
LRU hit ratio 36.56%
DWC hit ratio 53.93%
DWC - LRU hit ratio delta 17.37%
DWC / LRU hit ratio rate  147%

GLI 1,750
LRU hit ratio 45.04%
DWC hit ratio 55.06%
DWC - LRU hit ratio delta 10.02%
DWC / LRU hit ratio rate  122%

GLI 2,000
LRU hit ratio 57.41%
DWC hit ratio 57.41%
DWC - LRU hit ratio delta 0.00%
DWC / LRU hit ratio rate  100%
```

### LOOP

```
LOOP 100
LRU hit ratio 0.00%
DWC hit ratio 8.68%
DWC - LRU hit ratio delta 8.68%
DWC / LRU hit ratio rate  Infinity%

LOOP 250
LRU hit ratio 0.00%
DWC hit ratio 23.29%
DWC - LRU hit ratio delta 23.29%
DWC / LRU hit ratio rate  Infinity%

LOOP 500
LRU hit ratio 0.00%
DWC hit ratio 46.88%
DWC - LRU hit ratio delta 46.88%
DWC / LRU hit ratio rate  Infinity%

LOOP 750
LRU hit ratio 0.00%
DWC hit ratio 70.34%
DWC - LRU hit ratio delta 70.34%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,000
LRU hit ratio 0.00%
DWC hit ratio 95.14%
DWC - LRU hit ratio delta 95.14%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,250
LRU hit ratio 99.80%
DWC hit ratio 99.80%
DWC - LRU hit ratio delta 0.00%
DWC / LRU hit ratio rate  100%
```

## Throughput

75-95% of [lru-cache](https://www.npmjs.com/package/lru-cache).

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
'LRUCache new x 9,590 ops/sec ±1.86% (105 runs sampled)'

'DW-Cache new x 4,489,080 ops/sec ±3.13% (121 runs sampled)'

'LRUCache simulation 10 x 7,815,403 ops/sec ±2.15% (119 runs sampled)'

'DW-Cache simulation 10 x 6,488,758 ops/sec ±1.99% (120 runs sampled)'

'LRUCache simulation 100 x 8,074,090 ops/sec ±2.25% (119 runs sampled)'

'DW-Cache simulation 100 x 6,056,342 ops/sec ±1.98% (119 runs sampled)'

'LRUCache simulation 1,000 x 7,102,745 ops/sec ±2.12% (119 runs sampled)'

'DW-Cache simulation 1,000 x 6,067,487 ops/sec ±2.20% (120 runs sampled)'

'LRUCache simulation 10,000 x 6,100,434 ops/sec ±1.98% (120 runs sampled)'

'DW-Cache simulation 10,000 x 5,168,295 ops/sec ±1.80% (119 runs sampled)'

'LRUCache simulation 100,000 x 2,348,396 ops/sec ±1.54% (106 runs sampled)'

'DW-Cache simulation 100,000 x 1,955,725 ops/sec ±2.15% (110 runs sampled)'

'LRUCache simulation 1,000,000 x 1,256,524 ops/sec ±3.46% (106 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,128,593 ops/sec ±2.45% (112 runs sampled)'
```

```ts
const key = random() < 0.8
  ? random() * capacity * 1 | 0
  : random() * capacity * 9 + capacity | 0;
cache.get(key) ?? cache.set(key, {});
```

## Comprehensive evaluation

### Hit ratio

|Class    |Algorithms    |
|:--------|:-------------|
|Very high|W-TinyLFU     |
|Hight    |DWC, (LIRS)   |
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

|Class|Effect|Algorithms       |
|:----|:-----|:----------------|
|Total|High  |W-TinyLFU, DWC   |
|Most |High  |(TinyLFU), (LIRS)|
|Few  |Low   |ARC              |
|None |None  |LRU              |

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
    // Max entries.
    // Range: 1-
    readonly capacity?: number;
    // Window size ratio to measure hit ratios.
    // Range: 1-100
    readonly window?: number;
    // Min sample size ratio to measure hit density.
    // Range: 1-100
    readonly sample?: number;
    // Max costs.
    // Range: L-
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
