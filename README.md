# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

## Maintenance

The source code is maintained on the next source repository.

https://github.com/falsandtru/spica

## Abstract

The highest performance constant complexity cache algorithm.

## Strategies

- Dynamic partition
- Transitive wide MRU with cyclic replacement
- Sampled history injection

## Properties

Generally superior and almost flawless.

- High performance
  - High hit ratio (DS1, S3, OLTP, GLI)
    - Highest hit ratio among all the general-purpose cache algorithms.
    - Near ARC (S3, OLTP).
    - Significantly higher than ARC (DS1, GLI).
  - Low overhead (High throughput)
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
  - Very smaller cache size than sufficient can degrade hit ratio
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
  - Very smaller cache size than sufficient can degrade hit ratio
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
  - Incomplete algorithm
    - *Burst access degrades performance.*
    - TinyLFU is worse than LRU in theory.
    - **TinyLFU is just an incomplete implementation of W-TinyLFU.**
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
TinyLFU's results are traces of Ristretto.
W-TinyLFU's results are traces of Caffeine.

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
https://docs.google.com/spreadsheets/d/1G3deNz1gJCoXBE2IuraUSwLE7H_EMn4Sn2GU0HTpI5Y<br>
https://github.com/jedisct1/rust-arc-cache/issues/1<br>

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
  labels: [1e6, 2e6, 3e6, 4e6, 5e6, 6e6, 7e6, 8e6],
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
      data: [11.75, 28.40, 39.05, 44.62, 51.01, 57.01, 59.21, 66.41],
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

![image](https://user-images.githubusercontent.com/3143368/208246859-6038717f-ea29-4a2b-91bf-200d63aacd24.png)

```
DS1 1,000,000
LRU hit ratio 3.08%
DWC hit ratio 11.75%
DWC - LRU hit ratio delta 8.66%
DWC / LRU hit ratio rate  380%

DS1 2,000,000
LRU hit ratio 10.74%
DWC hit ratio 28.40%
DWC - LRU hit ratio delta 17.65%
DWC / LRU hit ratio rate  264%

DS1 3,000,000
LRU hit ratio 18.59%
DWC hit ratio 39.05%
DWC - LRU hit ratio delta 20.46%
DWC / LRU hit ratio rate  210%

DS1 4,000,000
LRU hit ratio 20.24%
DWC hit ratio 44.62%
DWC - LRU hit ratio delta 24.37%
DWC / LRU hit ratio rate  220%

DS1 5,000,000
LRU hit ratio 21.03%
DWC hit ratio 51.01%
DWC - LRU hit ratio delta 29.97%
DWC / LRU hit ratio rate  242%

DS1 6,000,000
LRU hit ratio 33.95%
DWC hit ratio 57.01%
DWC - LRU hit ratio delta 23.05%
DWC / LRU hit ratio rate  167%

DS1 7,000,000
LRU hit ratio 38.89%
DWC hit ratio 59.21%
DWC - LRU hit ratio delta 20.31%
DWC / LRU hit ratio rate  152%

DS1 8,000,000
LRU hit ratio 43.03%
DWC hit ratio 66.41%
DWC - LRU hit ratio delta 23.37%
DWC / LRU hit ratio rate  154%
```

### S3

W-TinyLFU > (TinyLFU) > (LIRS) > DWC, ARC > LRU

- DWC is an approximation of ARC.

<!--
const data = {
  labels: [1e5, 2e5, 3e5, 4e5, 5e5, 6e5, 7e5, 8e5],
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
      data: [10.60, 19.01, 25.06, 30.42, 38.05, 46.81, 55.70, 64.04],
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

![image](https://user-images.githubusercontent.com/3143368/208246927-af1d82d0-bd9e-4b26-b4a1-9da256483429.png)

```
S3 100,000
LRU hit ratio 2.32%
DWC hit ratio 10.60%
DWC - LRU hit ratio delta 8.27%
DWC / LRU hit ratio rate  455%

S3 200,000
LRU hit ratio 4.63%
DWC hit ratio 19.01%
DWC - LRU hit ratio delta 14.38%
DWC / LRU hit ratio rate  410%

S3 300,000
LRU hit ratio 7.58%
DWC hit ratio 25.06%
DWC - LRU hit ratio delta 17.47%
DWC / LRU hit ratio rate  330%

S3 400,000
LRU hit ratio 12.03%
DWC hit ratio 30.42%
DWC - LRU hit ratio delta 18.38%
DWC / LRU hit ratio rate  252%

S3 500,000
LRU hit ratio 22.76%
DWC hit ratio 38.05%
DWC - LRU hit ratio delta 15.28%
DWC / LRU hit ratio rate  167%

S3 600,000
LRU hit ratio 34.63%
DWC hit ratio 46.81%
DWC - LRU hit ratio delta 12.18%
DWC / LRU hit ratio rate  135%

S3 700,000
LRU hit ratio 46.04%
DWC hit ratio 55.70%
DWC - LRU hit ratio delta 9.66%
DWC / LRU hit ratio rate  120%

S3 800,000
LRU hit ratio 56.59%
DWC hit ratio 64.04%
DWC - LRU hit ratio delta 7.44%
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
      data: [19.13, 28.69, 33.95, 37.61, 39.60, 41.69, 42.88, 44.13],
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

![image](https://user-images.githubusercontent.com/3143368/208247068-ddb39ce5-9852-4291-bd23-85b7460e3a8b.png)

```
OLTP 250
LRU hit ratio 16.47%
DWC hit ratio 19.13%
DWC - LRU hit ratio delta 2.66%
DWC / LRU hit ratio rate  116%

OLTP 500
LRU hit ratio 23.44%
DWC hit ratio 28.69%
DWC - LRU hit ratio delta 5.25%
DWC / LRU hit ratio rate  122%

OLTP 750
LRU hit ratio 28.28%
DWC hit ratio 33.95%
DWC - LRU hit ratio delta 5.67%
DWC / LRU hit ratio rate  120%

OLTP 1,000
LRU hit ratio 32.83%
DWC hit ratio 37.61%
DWC - LRU hit ratio delta 4.78%
DWC / LRU hit ratio rate  114%

OLTP 1,250
LRU hit ratio 36.20%
DWC hit ratio 39.60%
DWC - LRU hit ratio delta 3.39%
DWC / LRU hit ratio rate  109%

OLTP 1,500
LRU hit ratio 38.69%
DWC hit ratio 41.69%
DWC - LRU hit ratio delta 2.99%
DWC / LRU hit ratio rate  107%

OLTP 1,750
LRU hit ratio 40.78%
DWC hit ratio 42.88%
DWC - LRU hit ratio delta 2.09%
DWC / LRU hit ratio rate  105%

OLTP 2,000
LRU hit ratio 42.46%
DWC hit ratio 44.13%
DWC - LRU hit ratio delta 1.66%
DWC / LRU hit ratio rate  103%
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
      data: [16.14, 32.52, 41.47, 49.86, 52.74, 53.77, 55.66, 57.96],
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

![image](https://user-images.githubusercontent.com/3143368/208042008-ead02e0e-735a-42ba-a0cf-6b21e4d033a3.png)

```
GLI 250
LRU hit ratio 0.93%
DWC hit ratio 16.14%
DWC - LRU hit ratio delta 15.20%
DWC / LRU hit ratio rate  1733%

GLI 500
LRU hit ratio 0.96%
DWC hit ratio 32.52%
DWC - LRU hit ratio delta 31.56%
DWC / LRU hit ratio rate  3374%

GLI 750
LRU hit ratio 1.16%
DWC hit ratio 41.47%
DWC - LRU hit ratio delta 40.30%
DWC / LRU hit ratio rate  3564%

GLI 1,000
LRU hit ratio 11.22%
DWC hit ratio 49.86%
DWC - LRU hit ratio delta 38.64%
DWC / LRU hit ratio rate  444%

GLI 1,250
LRU hit ratio 21.25%
DWC hit ratio 52.74%
DWC - LRU hit ratio delta 31.48%
DWC / LRU hit ratio rate  248%

GLI 1,500
LRU hit ratio 36.56%
DWC hit ratio 53.77%
DWC - LRU hit ratio delta 17.20%
DWC / LRU hit ratio rate  147%

GLI 1,750
LRU hit ratio 45.04%
DWC hit ratio 55.66%
DWC - LRU hit ratio delta 10.62%
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
DWC hit ratio 7.78%
DWC - LRU hit ratio delta 7.78%
DWC / LRU hit ratio rate  Infinity%

LOOP 250
LRU hit ratio 0.00%
DWC hit ratio 22.79%
DWC - LRU hit ratio delta 22.79%
DWC / LRU hit ratio rate  Infinity%

LOOP 500
LRU hit ratio 0.00%
DWC hit ratio 46.22%
DWC - LRU hit ratio delta 46.22%
DWC / LRU hit ratio rate  Infinity%

LOOP 750
LRU hit ratio 0.00%
DWC hit ratio 63.19%
DWC - LRU hit ratio delta 63.19%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,000
LRU hit ratio 0.00%
DWC hit ratio 97.44%
DWC - LRU hit ratio delta 97.44%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,250
LRU hit ratio 99.80%
DWC hit ratio 99.80%
DWC - LRU hit ratio delta 0.00%
DWC / LRU hit ratio rate  100%
```

## Throughput

80-110% of [lru-cache](https://www.npmjs.com/package/lru-cache).

Note that the number of trials per capacity for simulation 1,000,000 is insufficient.

No result with 10,000,000 because lru-cache crushes with the next error on the next machine of GitHub Actions.
It is verified that the error was thrown also when benchmarking only lru-cache.
Of course it is verified that DWC works fine under the same condition.

> Error: Uncaught RangeError: Map maximum size exceeded

> System:<br>
  OS: Linux 5.15 Ubuntu 20.04.5 LTS (Focal Fossa)<br>
  CPU: (2) x64 Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz<br>
  Memory: 5.88 GB / 6.78 GB


Clock: spica/clock<br>
ISCCache: [lru-cache](https://www.npmjs.com/package/lru-cache)<br>
LRUCache: spica/lru<br>
DW-Cache: spica/cache<br>

```
'Clock    new x 982,257 ops/sec ±4.80% (102 runs sampled)'

'ISCCache new x 11,457 ops/sec ±1.49% (117 runs sampled)'

'LRUCache new x 21,184,221 ops/sec ±0.18% (123 runs sampled)'

'DW-Cache new x 5,459,649 ops/sec ±0.41% (123 runs sampled)'

'Clock    simulation 100 x 10,520,040 ops/sec ±2.24% (120 runs sampled)'

'ISCCache simulation 100 x 8,148,950 ops/sec ±1.87% (119 runs sampled)'

'LRUCache simulation 100 x 9,110,929 ops/sec ±2.52% (118 runs sampled)'

'DW-Cache simulation 100 x 6,778,262 ops/sec ±2.27% (120 runs sampled)'

'Clock    simulation 1,000 x 8,738,216 ops/sec ±2.20% (118 runs sampled)'

'ISCCache simulation 1,000 x 7,298,708 ops/sec ±1.85% (119 runs sampled)'

'LRUCache simulation 1,000 x 8,120,011 ops/sec ±2.55% (117 runs sampled)'

'DW-Cache simulation 1,000 x 6,656,796 ops/sec ±2.28% (119 runs sampled)'

'Clock    simulation 10,000 x 8,546,724 ops/sec ±2.24% (119 runs sampled)'

'ISCCache simulation 10,000 x 6,479,979 ops/sec ±1.81% (120 runs sampled)'

'LRUCache simulation 10,000 x 7,455,903 ops/sec ±2.42% (120 runs sampled)'

'DW-Cache simulation 10,000 x 6,469,169 ops/sec ±1.95% (121 runs sampled)'

'Clock    simulation 100,000 x 5,733,062 ops/sec ±1.61% (118 runs sampled)'

'ISCCache simulation 100,000 x 3,179,438 ops/sec ±1.84% (109 runs sampled)'

'LRUCache simulation 100,000 x 3,746,025 ops/sec ±2.09% (116 runs sampled)'

'DW-Cache simulation 100,000 x 3,319,309 ops/sec ±2.16% (114 runs sampled)'

'Clock    simulation 1,000,000 x 2,949,250 ops/sec ±3.75% (104 runs sampled)'

'ISCCache simulation 1,000,000 x 1,487,123 ops/sec ±3.06% (100 runs sampled)'

'LRUCache simulation 1,000,000 x 1,725,359 ops/sec ±4.29% (106 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,740,517 ops/sec ±2.10% (110 runs sampled)'
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
    // Max costs.
    // Range: L-
    readonly resource?: number;
    readonly age?: number;
    readonly eagerExpiration?: boolean;
    // WARNING: Don't add any new key in disposing.
    readonly disposer?: (value: V, key: K) => void;
    readonly capture?: {
      readonly delete?: boolean;
      readonly clear?: boolean;
    };
    // Mainly for experiments.
    // Min LRU ratio.
    // Range: 0-100
    readonly window?: number;
    // Sample ratio of LRU in LFU.
    // Range: 0-100
    readonly sample?: number;
    readonly sweep?: {
      // Setting 20 is usually better with standard (non-skewed) workloads.
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
  add(key: K, value: V, opts?: { size?: number; age?: number; }): boolean;
  add(this: Cache<K, undefined>, key: K, value?: V, opts?: { size?: number; age?: number; }): boolean;
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
