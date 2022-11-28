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
https://docs.google.com/spreadsheets/d/1G3deNz1gJCoXBE2IuraUSwLE7H_EMn4Sn2GU0HTpI5Y<br>

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
      data: [11.59, 26.22, 38.18, 42.12, 47.15, 55.34, 57.03, 64.22],
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

![image](https://user-images.githubusercontent.com/3143368/204281007-6ea2d7b6-202f-4a09-a3b0-ed95c601dea8.png)

```
DS1 1,000,000
LRU hit ratio 3.08%
DWC hit ratio 11.59%
DWC - LRU hit ratio delta 8.50%
DWC / LRU hit ratio rate  375%

DS1 2,000,000
LRU hit ratio 10.74%
DWC hit ratio 26.22%
DWC - LRU hit ratio delta 15.47%
DWC / LRU hit ratio rate  244%

DS1 3,000,000
LRU hit ratio 18.59%
DWC hit ratio 38.18%
DWC - LRU hit ratio delta 19.59%
DWC / LRU hit ratio rate  205%

DS1 4,000,000
LRU hit ratio 20.24%
DWC hit ratio 42.12%
DWC - LRU hit ratio delta 21.88%
DWC / LRU hit ratio rate  208%

DS1 5,000,000
LRU hit ratio 21.03%
DWC hit ratio 47.15%
DWC - LRU hit ratio delta 26.12%
DWC / LRU hit ratio rate  224%

DS1 6,000,000
LRU hit ratio 33.95%
DWC hit ratio 55.34%
DWC - LRU hit ratio delta 21.39%
DWC / LRU hit ratio rate  163%

DS1 7,000,000
LRU hit ratio 38.89%
DWC hit ratio 57.03%
DWC - LRU hit ratio delta 18.13%
DWC / LRU hit ratio rate  146%

DS1 8,000,000
LRU hit ratio 43.03%
DWC hit ratio 64.22%
DWC - LRU hit ratio delta 21.18%
DWC / LRU hit ratio rate  149%
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
      data: [10.62, 19.18, 25.37, 30.69, 38.65, 47.36, 56.24, 64.33],
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

![image](https://user-images.githubusercontent.com/3143368/204281567-3a7ab37d-3ce3-4d93-8225-8c97aad053e3.png)

```
S3 100,000
LRU hit ratio 2.32%
DWC hit ratio 10.62%
DWC - LRU hit ratio delta 8.29%
DWC / LRU hit ratio rate  456%

S3 200,000
LRU hit ratio 4.63%
DWC hit ratio 19.18%
DWC - LRU hit ratio delta 14.54%
DWC / LRU hit ratio rate  414%

S3 300,000
LRU hit ratio 7.58%
DWC hit ratio 25.37%
DWC - LRU hit ratio delta 17.78%
DWC / LRU hit ratio rate  334%

S3 400,000
LRU hit ratio 12.03%
DWC hit ratio 30.69%
DWC - LRU hit ratio delta 18.65%
DWC / LRU hit ratio rate  254%

S3 500,000
LRU hit ratio 22.76%
DWC hit ratio 38.65%
DWC - LRU hit ratio delta 15.88%
DWC / LRU hit ratio rate  169%

S3 600,000
LRU hit ratio 34.63%
DWC hit ratio 47.36%
DWC - LRU hit ratio delta 12.73%
DWC / LRU hit ratio rate  136%

S3 700,000
LRU hit ratio 46.04%
DWC hit ratio 56.24%
DWC - LRU hit ratio delta 10.20%
DWC / LRU hit ratio rate  122%

S3 800,000
LRU hit ratio 56.59%
DWC hit ratio 64.33%
DWC - LRU hit ratio delta 7.73%
DWC / LRU hit ratio rate  113%
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
      data: [16.60, 28.45, 34.37, 37.86, 39.88, 41.62, 43.01, 44.41],
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

![image](https://user-images.githubusercontent.com/3143368/204282225-3ac82d2c-62ad-4454-bd4a-6d29713bf4c2.png)

```
OLTP 250
LRU hit ratio 16.47%
DWC hit ratio 16.60%
DWC - LRU hit ratio delta 0.13%
DWC / LRU hit ratio rate  100%

OLTP 500
LRU hit ratio 23.44%
DWC hit ratio 28.45%
DWC - LRU hit ratio delta 5.00%
DWC / LRU hit ratio rate  121%

OLTP 750
LRU hit ratio 28.28%
DWC hit ratio 34.37%
DWC - LRU hit ratio delta 6.09%
DWC / LRU hit ratio rate  121%

OLTP 1,000
LRU hit ratio 32.83%
DWC hit ratio 37.86%
DWC - LRU hit ratio delta 5.03%
DWC / LRU hit ratio rate  115%

OLTP 1,250
LRU hit ratio 36.20%
DWC hit ratio 39.88%
DWC - LRU hit ratio delta 3.67%
DWC / LRU hit ratio rate  110%

OLTP 1,500
LRU hit ratio 38.69%
DWC hit ratio 41.62%
DWC - LRU hit ratio delta 2.92%
DWC / LRU hit ratio rate  107%

OLTP 1,750
LRU hit ratio 40.78%
DWC hit ratio 43.01%
DWC - LRU hit ratio delta 2.22%
DWC / LRU hit ratio rate  105%

OLTP 2,000
LRU hit ratio 42.46%
DWC hit ratio 44.41%
DWC - LRU hit ratio delta 1.94%
DWC / LRU hit ratio rate  104%
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
      data: [15.25, 30.85, 41.78, 47.82, 52.89, 54.02, 55.15, 57.43],
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

![image](https://user-images.githubusercontent.com/3143368/204283168-e4043732-ac61-41b0-b04a-d9b7b51e75a9.png)

```
GLI 250
LRU hit ratio 0.93%
DWC hit ratio 15.10%
DWC - LRU hit ratio delta 14.17%
DWC / LRU hit ratio rate  1623%

GLI 500
LRU hit ratio 0.96%
DWC hit ratio 30.85%
DWC - LRU hit ratio delta 29.88%
DWC / LRU hit ratio rate  3200%

GLI 750
LRU hit ratio 1.16%
DWC hit ratio 41.78%
DWC - LRU hit ratio delta 40.62%
DWC / LRU hit ratio rate  3591%

GLI 1,000
LRU hit ratio 11.22%
DWC hit ratio 47.82%
DWC - LRU hit ratio delta 36.60%
DWC / LRU hit ratio rate  426%

GLI 1,250
LRU hit ratio 21.25%
DWC hit ratio 52.89%
DWC - LRU hit ratio delta 31.63%
DWC / LRU hit ratio rate  248%

GLI 1,500
LRU hit ratio 36.56%
DWC hit ratio 54.02%
DWC - LRU hit ratio delta 17.45%
DWC / LRU hit ratio rate  147%

GLI 1,750
LRU hit ratio 45.04%
DWC hit ratio 55.15%
DWC - LRU hit ratio delta 10.10%
DWC / LRU hit ratio rate  122%

GLI 2,000
LRU hit ratio 57.41%
DWC hit ratio 57.43%
DWC - LRU hit ratio delta 0.01%
DWC / LRU hit ratio rate  100%
```

### LOOP

```
LOOP 100
LRU hit ratio 0.00%
DWC hit ratio 7.65%
DWC - LRU hit ratio delta 7.65%
DWC / LRU hit ratio rate  Infinity%

LOOP 250
LRU hit ratio 0.00%
DWC hit ratio 19.38%
DWC - LRU hit ratio delta 19.38%
DWC / LRU hit ratio rate  Infinity%

LOOP 500
LRU hit ratio 0.00%
DWC hit ratio 43.29%
DWC - LRU hit ratio delta 43.29%
DWC / LRU hit ratio rate  Infinity%

LOOP 750
LRU hit ratio 0.00%
DWC hit ratio 67.90%
DWC - LRU hit ratio delta 67.90%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,000
LRU hit ratio 0.00%
DWC hit ratio 95.75%
DWC - LRU hit ratio delta 95.75%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,250
LRU hit ratio 99.80%
DWC hit ratio 99.80%
DWC - LRU hit ratio delta 0.00%
DWC / LRU hit ratio rate  100%
```

## Throughput

70-100% of [lru-cache](https://www.npmjs.com/package/lru-cache).

Note that the number of trials per capacity for simulation 1,000,000 is insufficient.

No result with 10,000,000 because lru-cache crushes with the next error on the next machine of GitHub Actions.
It is verified that the error was thrown also when benchmarking only lru-cache.
Of course it is verified that DWC works fine under the same condition.

> Error: Uncaught RangeError: Map maximum size exceeded

> System:<br>
  OS: Linux 5.15 Ubuntu 20.04.5 LTS (Focal Fossa)<br>
  CPU: (2) x64 Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz<br>
  Memory: 5.88 GB / 6.78 GB


ISCCache: [lru-cache](https://www.npmjs.com/package/lru-cache)<br>
LRUCache: spica/lru<br>
DW-Cache: spica/cache<br>

```
'ISCCache new x 10,130 ops/sec ±1.75% (110 runs sampled)'

'LRUCache new x 19,756,479 ops/sec ±0.54% (121 runs sampled)'

'DW-Cache new x 4,854,642 ops/sec ±0.44% (121 runs sampled)'

'ISCCache simulation 100 x 7,980,108 ops/sec ±2.14% (118 runs sampled)'

'LRUCache simulation 100 x 8,788,269 ops/sec ±2.69% (118 runs sampled)'

'DW-Cache simulation 100 x 5,673,756 ops/sec ±1.97% (121 runs sampled)'

'ISCCache simulation 1,000 x 7,143,083 ops/sec ±2.10% (118 runs sampled)'

'LRUCache simulation 1,000 x 7,687,282 ops/sec ±2.63% (116 runs sampled)'

'DW-Cache simulation 1,000 x 6,390,268 ops/sec ±2.05% (120 runs sampled)'

'ISCCache simulation 10,000 x 6,265,458 ops/sec ±1.82% (119 runs sampled)'

'LRUCache simulation 10,000 x 7,029,186 ops/sec ±2.34% (120 runs sampled)'

'DW-Cache simulation 10,000 x 5,627,967 ops/sec ±1.83% (120 runs sampled)'

'ISCCache simulation 100,000 x 2,973,613 ops/sec ±1.57% (111 runs sampled)'

'LRUCache simulation 100,000 x 3,385,701 ops/sec ±2.38% (114 runs sampled)'

'DW-Cache simulation 100,000 x 2,860,687 ops/sec ±2.87% (111 runs sampled)'

'ISCCache simulation 1,000,000 x 1,521,911 ops/sec ±3.81% (108 runs sampled)'

'LRUCache simulation 1,000,000 x 1,613,226 ops/sec ±4.79% (103 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,328,390 ops/sec ±2.31% (113 runs sampled)'
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
    // Window ratio to measure hit ratios.
    // Range: 1-100
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
    // Min LRU ratio.
    // Range: 1-100
    readonly scope?: number;
    // Sample ratio of LRU in LFU.
    // Range: 0-100
    readonly sample?: number;
    // Max costs.
    // Range: L-
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
