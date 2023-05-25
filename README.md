# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

The highest performance constant complexity cache algorithm.

## Maintenance

The source code is maintained on the next source repository.

https://github.com/falsandtru/spica

## Efficiency

### Mathematical efficiency

Some different cache algorithms require extra memory space to retain evicted keys.
Linear time complexity indicates the existence of batch processing.
Note that admission algorithm doesn't work without eviction algorithm.

|Algorithm|Type |Time complexity<br>(Worst case)|Space complexity<br>(Extra)|Key size|Data structures|
|:-------:|:---:|:------:|:------:|:---------:|:-----:|
|LRU      |Evict|Constant|Constant|    1x     |1 list |
|DWC      |Evict|Constant|Constant|    1x     |2 lists|
|ARC      |Evict|Constant|Linear  |    2x     |4 lists|
|LIRS     |Evict|Linear  |Linear  |**3-2500x**|2 lists|
|TinyLFU  |Admit|Linear  |Linear  |*~1-10x*<br>(8bit * 10N * 4)|5 arrays|
|W-TinyLFU|Admit|Linear  |Linear  |*~1-10x*<br>(8bit * 10N * 4)|1 list<br>4 arrays|

https://github.com/ben-manes/caffeine/wiki/Efficiency<br>
https://github.com/zhongch4g/LIRS2/blob/master/src/replace_lirs_base.cc

### Engineering efficiency

A pointer is 8 bytes, bool and int8 are each 1 byte in C.

#### 8 byte key and value (int64, float64, 8 chars)

Memoize, etc.

|Algorithm|Entry overhead|Key size|Total per entry|Attenuation coefficient|
|:-------:|-------------:|-------:|--------------:|----------------------:|
|LRU      |      16 bytes|      1x|       32 bytes|                100.00%|
|ARC      |      18 bytes|      2x|       60 bytes|                 53.33%|
|DWC      |      18 bytes|      1x|       34 bytes|                 94.11%|
|(LIRS)   |      35 bytes|      3x|      137 bytes|                 23.35%|
|(LIRS)   |      35 bytes|     10x|      438 bytes|                  7.30%|
|(TinyLFU)|      56 bytes|      1x|       72 bytes|                 44.44%|
|W-TinyLFU|      56 bytes|      1x|       72 bytes|                 44.44%|

#### 128 byte key and 8 byte value (Session ID / ID, index)

In-memory KVS, etc.

|Algorithm|Entry overhead|Key size|Total per entry|Attenuation coefficient|
|:-------:|-------------:|-------:|--------------:|----------------------:|
|LRU      |      16 bytes|      1x|      152 bytes|                100.00%|
|ARC      |      18 bytes|      2x|      300 bytes|                 50.66%|
|DWC      |      18 bytes|      1x|      154 bytes|                 98.70%|
|(LIRS)   |      35 bytes|      3x|      497 bytes|                 30.58%|
|(LIRS)   |      35 bytes|     10x|    1,638 bytes|                  9.27%|
|(TinyLFU)|      56 bytes|      1x|      192 bytes|                 79.16%|
|W-TinyLFU|      56 bytes|      1x|      192 bytes|                 79.16%|

#### 16 byte key and 512 byte value (Domain / DNS packet)

DNS cache server, etc.

|Algorithm|Entry overhead|Key size|Total per entry|Attenuation coefficient|
|:-------:|-------------:|-------:|--------------:|----------------------:|
|LRU      |      16 bytes|      1x|      544 bytes|                100.00%|
|ARC      |      18 bytes|      2x|      580 bytes|                 93.37%|
|DWC      |      18 bytes|      1x|      546 bytes|                 99.63%|
|(LIRS)   |      35 bytes|      3x|      665 bytes|                 81.80%|
|(LIRS)   |      35 bytes|     10x|    1,022 bytes|                 53.22%|
|(TinyLFU)|      56 bytes|      1x|      584 bytes|                 93.15%|
|W-TinyLFU|      56 bytes|      1x|      584 bytes|                 93.15%|

## Resistance

LIRS's burst resistance means the resistance to continuous cache misses.

|Algorithm|Type |Scan|Loop|Burst|
|:-------:|:---:|:--:|:--:|:---:|
|LRU      |Evict|    |    |  ✓ |
|DWC      |Evict| ✓ |  ✓ | ✓  |
|ARC      |Evict| ✓ |     | ✓  |
|LIRS     |Evict| ✓ |  ✓ |     |
|TinyLFU  |Admit| ✓ |  ✓ |     |
|W-TinyLFU|Admit| ✓ |  ✓ | ✓  |

## Strategies

- Dynamic partition
- Sampled history injection
- Transitive wide MRU with cyclic replacement

## Properties

Generally superior and almost flawless.

- ***Highest performance***
  - High hit ratio (DS1, S3, OLTP, GLI)
    - ***Highest hit ratio of all the general-purpose cache algorithms.***
      - Approximate to W-TinyLFU (DS1, GLI).
      - Approximate to ARC (S3, OLTP).
      - W-TinyLFU is basically not a general-purpose cache algorithm due to some problems.
        - W-TinyLFU is not a general-purpose cache algorithm *without dynamic window and incremental reset*.
        - W-TinyLFU is impossible to efficiently implement *without pointer addresses or fast hash functions*.
        - W-TinyLFU's benchmark settings are not described (Especially suspicious with OLTP).
    - ***Highest engineering hit ratio of all the general cache algorithms.***
      - As a result of engineering efficiency.
  - Low time overhead (High throughput)
    - Use only two lists.
  - Low latency
    - Constant time complexity.
    - No batch processing like LIRS and TinyLFU.
  - Parallel suitable
    - Separated lists are suitable for lock-free processing.
- Efficient
  - Low memory usage
    - Largest capacity per memory size of all the advanced cache algorithms.
    - Constant extra space complexity.
    - Retain only keys of resident entries (No history).
  - Immediate release of evicted keys
    - Primary cache algorithm in the standard library must release memory immediately.
  - Low space overhead
    - Add only two smallest fields to entries.
- High resistance
  - Scan, loop, and burst resistance
- Few tradeoffs
  - Not the highest mathematical hit ratio
    - Highest hit ratio of each workload are resulted by W-TinyLFU or ARC.
  - Statistical accuracy dependent
    - Very smaller cache size than sufficient can degrade hit ratio.

## Tradeoffs

Note that LIRS and TinyLFU are risky cache algorithms.

- LRU
  - Low performance
  - No resistance
    - **Scan access clears all entries.**
- ARC
  - Middle performance
  - Inefficient
    - 2x key size.
  - High overhead
    - 4 lists.
  - Few resistance
    - No loop resistance.
- DWC
  - Not the highest mathematical hit ratio
  - Statistical accuracy dependent
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
    - **TinyLFU is just a vulnerable incomplete base-algorithm of W-TinyLFU.**
    - *Burst access saturates Bloom filters.*
    - TinyLFU is worse than LRU in theory.
  - Language dependent
    - *Impossible to efficiently implement without pointer addresses or fast hash functions.*
  - High overhead
    - Read and write average 40 array elements per access.
  - Restricted delete operation
    - Bloom filters don't support delete operation.
    - *Frequent delete operations degrade performance.*
  - Spike latency
    - ***Whole reset of Bloom filters takes linear time.***
  - Vulnerable algorithm
    - *Burst access degrades performance.*
- W-TinyLFU
  - Language dependent
    - *Impossible to efficiently implement without pointer addresses or fast hash functions.*
  - High overhead
    - Read and write average 40 array elements per access.
  - Restricted delete operation
    - Bloom filters don't support delete operation.
    - *Frequent delete operations degrade performance.*
  - Spike latency
    - ***Whole reset of Bloom filters takes linear time.***

## Hit ratio

Note that another cache algorithm sometimes changes the parameter values per workload to get a favorite result as the paper of TinyLFU has changed the window size of W-TinyLFU.

- DWC's results are measured by the same default parameter values.
- TinyLFU's results are the traces of Ristretto.
- W-TinyLFU's results are the traces of Caffeine.

1. Set the datasets to `./benchmark/trace` (See `./benchmark/ratio.ts`).
2. Run `npm i`.
3. Run `npm run bench`.
4. Click the DEBUG button to open a debug tab.
5. Close the previous tab.
6. Press F12 key to open devtools.
7. Select the console tab.

https://github.com/dgraph-io/benchmarks<br>
https://github.com/ben-manes/caffeine/wiki/Efficiency<br>
https://github.com/dgraph-io/ristretto<br>
https://docs.google.com/spreadsheets/d/1G3deNz1gJCoXBE2IuraUSwLE7H_EMn4Sn2GU0HTpI5Y (https://github.com/jedisct1/rust-arc-cache/issues/1)<br>

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
      data: [11.73, 28.25, 39.03, 44.72, 51.39, 57.64, 62.30, 68.83],
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
      data: [14.79, 28.72, 39.82, 45.26, 51.61, 57.82, 64.22, 70.6],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/2f1329c5-cb5e-4f95-adf1-a80d26b75173)

W-TinyLFU > DWC > (LIRS) > (TinyLFU) > ARC > LRU

- DWC is an approximation of W-TinyLFU.

```
DS1 1,000,000
LRU hit ratio 3.08%
DWC hit ratio 11.73%
DWC - LRU hit ratio delta 8.64%
DWC / LRU hit ratio rate  380%

DS1 2,000,000
LRU hit ratio 10.74%
DWC hit ratio 28.25%
DWC - LRU hit ratio delta 17.50%
DWC / LRU hit ratio rate  262%

DS1 3,000,000
LRU hit ratio 18.59%
DWC hit ratio 39.03%
DWC - LRU hit ratio delta 20.44%
DWC / LRU hit ratio rate  209%

DS1 4,000,000
LRU hit ratio 20.24%
DWC hit ratio 44.72%
DWC - LRU hit ratio delta 24.48%
DWC / LRU hit ratio rate  220%

DS1 5,000,000
LRU hit ratio 21.03%
DWC hit ratio 51.39%
DWC - LRU hit ratio delta 30.36%
DWC / LRU hit ratio rate  244%

DS1 6,000,000
LRU hit ratio 33.95%
DWC hit ratio 57.64%
DWC - LRU hit ratio delta 23.68%
DWC / LRU hit ratio rate  169%

DS1 7,000,000
LRU hit ratio 38.89%
DWC hit ratio 62.30%
DWC - LRU hit ratio delta 23.40%
DWC / LRU hit ratio rate  160%

DS1 8,000,000
LRU hit ratio 43.03%
DWC hit ratio 68.83%
DWC - LRU hit ratio delta 25.79%
DWC / LRU hit ratio rate  159%
```

### S3

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
      data: [10.23, 18.93, 25.07, 30.44, 38.04, 46.81, 55.71, 64.02],
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
      data: [12.29, 23.55, 33.62, 42.77, 50.96, 58.62, 64.9, 70.26],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/77633253-2e85-4fb3-b5f3-154dae3208e8)

W-TinyLFU > (TinyLFU) > (LIRS) > DWC, ARC > LRU

- DWC is an approximation of ARC.

```
S3 100,000
LRU hit ratio 2.32%
DWC hit ratio 10.23%
DWC - LRU hit ratio delta 7.90%
DWC / LRU hit ratio rate  439%

S3 200,000
LRU hit ratio 4.63%
DWC hit ratio 18.93%
DWC - LRU hit ratio delta 14.30%
DWC / LRU hit ratio rate  408%

S3 300,000
LRU hit ratio 7.58%
DWC hit ratio 25.07%
DWC - LRU hit ratio delta 17.48%
DWC / LRU hit ratio rate  330%

S3 400,000
LRU hit ratio 12.03%
DWC hit ratio 30.44%
DWC - LRU hit ratio delta 18.40%
DWC / LRU hit ratio rate  252%

S3 500,000
LRU hit ratio 22.76%
DWC hit ratio 38.04%
DWC - LRU hit ratio delta 15.28%
DWC / LRU hit ratio rate  167%

S3 600,000
LRU hit ratio 34.63%
DWC hit ratio 46.81%
DWC - LRU hit ratio delta 12.18%
DWC / LRU hit ratio rate  135%

S3 700,000
LRU hit ratio 46.04%
DWC hit ratio 55.71%
DWC - LRU hit ratio delta 9.67%
DWC / LRU hit ratio rate  121%

S3 800,000
LRU hit ratio 56.59%
DWC hit ratio 64.02%
DWC - LRU hit ratio delta 7.42%
DWC / LRU hit ratio rate  113%
```

### OLTP

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
      data: [19.47, 28.93, 33.94, 37.52, 39.86, 41.74, 43.27, 44.73],
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
      // data: [22.76, 29.21, 32.97, 35.3, 37.52, 38.99, 40.37, 41.67],
      data: [24, 32, 37, 40, 43, 43, 45, 46],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/d180aa29-b420-48e9-ab74-be0042ff486b)

W-TinyLFU > ARC > DWC > (LIRS) > LRU > (TinyLFU)

- DWC is an approximation of ARC.

```
OLTP 250
LRU hit ratio 16.47%
DWC hit ratio 19.47%
DWC - LRU hit ratio delta 2.99%
DWC / LRU hit ratio rate  118%

OLTP 500
LRU hit ratio 23.44%
DWC hit ratio 28.93%
DWC - LRU hit ratio delta 5.48%
DWC / LRU hit ratio rate  123%

OLTP 750
LRU hit ratio 28.28%
DWC hit ratio 33.94%
DWC - LRU hit ratio delta 5.66%
DWC / LRU hit ratio rate  120%

OLTP 1,000
LRU hit ratio 32.83%
DWC hit ratio 37.52%
DWC - LRU hit ratio delta 4.69%
DWC / LRU hit ratio rate  114%

OLTP 1,250
LRU hit ratio 36.20%
DWC hit ratio 39.86%
DWC - LRU hit ratio delta 3.65%
DWC / LRU hit ratio rate  110%

OLTP 1,500
LRU hit ratio 38.69%
DWC hit ratio 41.74%
DWC - LRU hit ratio delta 3.04%
DWC / LRU hit ratio rate  107%

OLTP 1,750
LRU hit ratio 40.78%
DWC hit ratio 43.27%
DWC - LRU hit ratio delta 2.48%
DWC / LRU hit ratio rate  106%

OLTP 2,000
LRU hit ratio 42.46%
DWC hit ratio 44.73%
DWC - LRU hit ratio delta 2.26%
DWC / LRU hit ratio rate  105%
```

### GLI

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
      data: [16.24, 32.38, 41.35, 49.61, 52.60, 53.78, 55.66, 57.96],
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
      data: [15.15, 33.08, 43.11, 50.57, 51.87, 53.57, 55.61, 57.96],
      borderColor: Utils.color(8),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/246898d9-91ea-48ff-bfdb-2265b5bf4d10)

W-TinyLFU, (LIRS) > DWC > (TinyLFU) >> ARC > LRU

- DWC is an approximation of W-TinyLFU.

```
GLI 250
LRU hit ratio 0.93%
DWC hit ratio 16.24%
DWC - LRU hit ratio delta 15.30%
DWC / LRU hit ratio rate  1744%

GLI 500
LRU hit ratio 0.96%
DWC hit ratio 32.38%
DWC - LRU hit ratio delta 31.41%
DWC / LRU hit ratio rate  3358%

GLI 750
LRU hit ratio 1.16%
DWC hit ratio 41.35%
DWC - LRU hit ratio delta 40.19%
DWC / LRU hit ratio rate  3554%

GLI 1,000
LRU hit ratio 11.22%
DWC hit ratio 49.61%
DWC - LRU hit ratio delta 38.39%
DWC / LRU hit ratio rate  442%

GLI 1,250
LRU hit ratio 21.25%
DWC hit ratio 52.60%
DWC - LRU hit ratio delta 31.34%
DWC / LRU hit ratio rate  247%

GLI 1,500
LRU hit ratio 36.56%
DWC hit ratio 53.78%
DWC - LRU hit ratio delta 17.22%
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

<!--
### LOOP

```
LOOP 100
LRU hit ratio 0.00%
DWC hit ratio 7.69%
DWC - LRU hit ratio delta 7.69%
DWC / LRU hit ratio rate  Infinity%

LOOP 250
LRU hit ratio 0.00%
DWC hit ratio 18.47%
DWC - LRU hit ratio delta 18.47%
DWC / LRU hit ratio rate  Infinity%

LOOP 500
LRU hit ratio 0.00%
DWC hit ratio 41.99%
DWC - LRU hit ratio delta 41.99%
DWC / LRU hit ratio rate  Infinity%

LOOP 750
LRU hit ratio 0.00%
DWC hit ratio 69.01%
DWC - LRU hit ratio delta 69.01%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,000
LRU hit ratio 0.00%
DWC hit ratio 96.90%
DWC - LRU hit ratio delta 96.90%
DWC / LRU hit ratio rate  Infinity%

LOOP 1,250
LRU hit ratio 99.80%
DWC hit ratio 99.80%
DWC - LRU hit ratio delta 0.00%
DWC / LRU hit ratio rate  100%
```
-->

## Throughput

80-120% of [lru-cache](https://www.npmjs.com/package/lru-cache).

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
'Clock    new x 1,328,833 ops/sec ±3.63% (113 runs sampled)'

'ISCCache new x 13,768 ops/sec ±1.00% (120 runs sampled)'

'LRUCache new x 27,168,783 ops/sec ±1.50% (122 runs sampled)'

'DW-Cache new x 6,049,201 ops/sec ±0.86% (122 runs sampled)'

'Clock    simulation 100 x 13,493,137 ops/sec ±1.65% (121 runs sampled)'

'ISCCache simulation 100 x 8,651,793 ops/sec ±1.85% (121 runs sampled)'

'LRUCache simulation 100 x 10,604,646 ops/sec ±2.24% (120 runs sampled)'

'DW-Cache simulation 100 x 7,242,013 ops/sec ±1.65% (121 runs sampled)'

'Clock    simulation 1,000 x 10,694,963 ops/sec ±1.81% (120 runs sampled)'

'ISCCache simulation 1,000 x 7,700,019 ops/sec ±1.90% (121 runs sampled)'

'LRUCache simulation 1,000 x 9,184,813 ops/sec ±2.13% (120 runs sampled)'

'DW-Cache simulation 1,000 x 7,041,470 ops/sec ±1.77% (120 runs sampled)'

'Clock    simulation 10,000 x 10,517,215 ops/sec ±1.78% (122 runs sampled)'

'ISCCache simulation 10,000 x 7,365,593 ops/sec ±1.67% (121 runs sampled)'

'LRUCache simulation 10,000 x 8,685,666 ops/sec ±1.81% (121 runs sampled)'

'DW-Cache simulation 10,000 x 7,317,621 ops/sec ±1.42% (120 runs sampled)'

'Clock    simulation 100,000 x 7,417,826 ops/sec ±1.60% (118 runs sampled)'

'ISCCache simulation 100,000 x 4,523,157 ops/sec ±1.22% (117 runs sampled)'

'LRUCache simulation 100,000 x 5,424,344 ops/sec ±2.10% (119 runs sampled)'

'DW-Cache simulation 100,000 x 4,190,537 ops/sec ±1.44% (113 runs sampled)'

'Clock    simulation 1,000,000 x 4,519,623 ops/sec ±3.63% (106 runs sampled)'

'ISCCache simulation 1,000,000 x 2,081,961 ops/sec ±3.35% (101 runs sampled)'

'LRUCache simulation 1,000,000 x 2,686,808 ops/sec ±3.88% (103 runs sampled)'

'DW-Cache simulation 1,000,000 x 2,481,012 ops/sec ±2.54% (111 runs sampled)'
```

```ts
const key = random() < 0.9
  ? random() * capacity * 1 | 0
  : random() * capacity * 9 + capacity | 0;
cache.get(key) ?? cache.set(key, {});
```

## Comprehensive evaluation

### Hit ratio

#### Mathematical

|Class    |Algorithms    |
|:--------|:-------------|
|Very high|W-TinyLFU     |
|High     |DWC, (LIRS)   |
|Middle   |ARC, (TinyLFU)|
|Low      |LRU           |

#### Engineering

|Class    |Algorithms    |
|:--------|:-------------|
|High     |DWC           |
|Middle   |LRU           |
|Low      |W-TinyLFU, (LIRS), ARC, (TinyLFU)|

### Efficiency

|Total per entry|Algorithm|Key size|
|--------------:|:-------:|-------:|
|       32 bytes|LRU      |      1x|
|       34 bytes|DWC      |      1x|
|       60 bytes|ARC      |      2x|
|       72 bytes|W-TinyLFU|      1x|
|       72 bytes|(TinyLFU)|      1x|
|      137 bytes|(LIRS)   |      3x|
|      438 bytes|(LIRS)   |     10x|

### Resistance

|Class|Effect|Algorithms       |
|:----|:-----|:----------------|
|Total|High  |W-TinyLFU, DWC   |
|Most |High  |(TinyLFU), (LIRS)|
|Few  |Low   |ARC              |
|None |None  |LRU              |

### Throughput

|Type                        |Algorithms        |
|:---------------------------|:-----------------|
|Dynamic lists (Lock-free)   |DWC > (LIRS) > ARC|
|Bloom filter + Dynamic lists|(TinyLFU)         |
|Dynamic lists + Bloom filter|W-TinyLFU         |
|Static list                 |LRU               |

### Latency

|Worst time  |Algorithms           |
|:-----------|:--------------------|
|Constant    |LRU, DWC, ARC        |
|Linear (1)  |W-TinyLFU > (TinyLFU)|
|Linear (> 1)|(LIRS)               |

### Vulnerability

|Type   |Algorithms|
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
      readonly threshold?: number;
      readonly ratio?: number;
      readonly window?: number;
      readonly room?: number;
      readonly range?: number;
      readonly shift?: number;
    };
  }
}
export class Cache<K, V> {
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
