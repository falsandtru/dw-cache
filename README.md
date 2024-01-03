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
|DWC      |      17 bytes|      1x|       33 bytes|                 96.96%|
|ARC      |      17 bytes|      2x|       58 bytes|                 55.17%|
|(LIRS)   |      33 bytes|      3x|      131 bytes|                 24.42%|
|(LIRS)   |      33 bytes|     10x|      418 bytes|                  7.65%|
|(TinyLFU)|      56 bytes|      1x|       72 bytes|                 44.44%|
|W-TinyLFU|      56 bytes|      1x|       72 bytes|                 44.44%|

#### 32 byte key and 8 byte value (Session ID / ID)

In-memory KVS, etc.

|Algorithm|Entry overhead|Key size|Total per entry|Attenuation coefficient|
|:-------:|-------------:|-------:|--------------:|----------------------:|
|LRU      |      16 bytes|      1x|       56 bytes|                100.00%|
|DWC      |      17 bytes|      1x|       57 bytes|                 98.24%|
|ARC      |      17 bytes|      2x|       88 bytes|                 63.63%|
|(LIRS)   |      33 bytes|      3x|      203 bytes|                 27.58%|
|(LIRS)   |      33 bytes|     10x|      658 bytes|                  8.51%|
|(TinyLFU)|      56 bytes|      1x|       96 bytes|                 58.33%|
|W-TinyLFU|      56 bytes|      1x|       96 bytes|                 58.33%|

#### 16 byte key and 512 byte value (Domain / DNS packet)

DNS cache server, etc.

|Algorithm|Entry overhead|Key size|Total per entry|Attenuation coefficient|
|:-------:|-------------:|-------:|--------------:|----------------------:|
|LRU      |      16 bytes|      1x|      544 bytes|                100.00%|
|DWC      |      17 bytes|      1x|      545 bytes|                 99.81%|
|ARC      |      17 bytes|      2x|      578 bytes|                 94.11%|
|(LIRS)   |      33 bytes|      3x|      659 bytes|                 82.54%|
|(LIRS)   |      33 bytes|     10x|    1,002 bytes|                 54.29%|
|(TinyLFU)|      56 bytes|      1x|      584 bytes|                 93.15%|
|W-TinyLFU|      56 bytes|      1x|      584 bytes|                 93.15%|

## Resistance

LIRS's burst resistance means the resistance to continuous cache misses for the last LIR entry or the HIR entries.

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
  - Not the highest hit ratio
    - Highest hit ratio of each workload is resulted by W-TinyLFU or ARC.
  - Statistical accuracy dependent
    - Very smaller cache size than sufficient can degrade hit ratio.
    - Cache size 1,000 or more is recommended.

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
  - Not the highest hit ratio
  - Statistical accuracy dependent
- LIRS
  - Extremely inefficient
    - ***3-2500x key size.***
  - Spike latency
    - ***Bulk deletion of low-frequency entries takes linear time.***
  - Vulnerable algorithm
    - ***Continuous cache misses for the last LIR entry or the HIR entries explode key size.***
      - https://issues.redhat.com/browse/ISPN-7171
      - https://issues.redhat.com/browse/ISPN-7246
- TinyLFU
  - Incomplete algorithm
    - **TinyLFU is just a vulnerable incomplete base-algorithm of W-TinyLFU.**
    - *Burst access saturates Bloom filters.*
    - TinyLFU is worse than LRU in theory.
  - Language dependent
    - **Impossible to efficiently implement without pointer addresses or fast hash functions.**
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
    - **Impossible to efficiently implement without pointer addresses or fast hash functions.**
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
- TinyLFU's results are the traces of Caffeine.

1. Set the datasets to `./benchmark/trace` (See `./benchmark/ratio.ts`).
2. Run `npm i`.
3. Run `npm run bench`.
4. Click the DEBUG button to open a debug tab.
5. Close the previous tab.
6. Press F12 key to open devtools.
7. Select the console tab.

https://github.com/dgraph-io/benchmarks<br>
https://github.com/ben-manes/caffeine/wiki/Efficiency<br>
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
      data: [14.73, 27.94, 39.46, 44.20, 50.19, 56.83, 62.55, 70.03],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [12.98, 26.85, 38.02, 38.14, 38.18, 47.25, 59.89, 71.74],
      borderColor: Utils.color(3),
    },
    {
      label: 'W-TinyLFU',
      data: [14.79, 28.72, 39.82, 45.26, 51.61, 57.82, 64.22, 70.6],
      borderColor: Utils.color(8),
    },
    {
      label: 'TinyLFU',
      data: [14.56, 29.01, 39.58, 45.61, 51.02, 57.76, 64.23, 70.52],
      borderColor: Utils.color(4),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/57c88cdd-9c1e-498f-a656-f56f20bab079)

W-TinyLFU, (TinyLFU) > DWC > (LIRS) > ARC > LRU

- DWC is an approximation of W-TinyLFU.

```
DS1 1,000,000
LRU hit ratio 3.08%
DWC hit ratio 14.73%
DWC - LRU hit ratio delta 11.65%
DWC / LRU hit ratio ratio 477%

DS1 2,000,000
LRU hit ratio 10.74%
DWC hit ratio 27.94%
DWC - LRU hit ratio delta 17.20%
DWC / LRU hit ratio ratio 260%

DS1 3,000,000
LRU hit ratio 18.59%
DWC hit ratio 39.46%
DWC - LRU hit ratio delta 20.87%
DWC / LRU hit ratio ratio 212%

DS1 4,000,000
LRU hit ratio 20.24%
DWC hit ratio 44.20%
DWC - LRU hit ratio delta 23.96%
DWC / LRU hit ratio ratio 218%

DS1 5,000,000
LRU hit ratio 21.03%
DWC hit ratio 50.19%
DWC - LRU hit ratio delta 29.16%
DWC / LRU hit ratio ratio 238%

DS1 6,000,000
LRU hit ratio 33.95%
DWC hit ratio 56.83%
DWC - LRU hit ratio delta 22.88%
DWC / LRU hit ratio ratio 167%

DS1 7,000,000
LRU hit ratio 38.89%
DWC hit ratio 62.55%
DWC - LRU hit ratio delta 23.65%
DWC / LRU hit ratio ratio 160%

DS1 8,000,000
LRU hit ratio 43.03%
DWC hit ratio 70.03%
DWC - LRU hit ratio delta 26.99%
DWC / LRU hit ratio ratio 162%
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
      data: [10.14, 20.25, 27.39, 32.69, 38.12, 46.82, 55.71, 64.03],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [12.4, 15.55, 25.08, 34.69, 44.27, 53.15, 60.99, 67.64],
      borderColor: Utils.color(3),
    },
    {
      label: 'W-TinyLFU',
      data: [12.29, 23.55, 33.62, 42.77, 50.96, 58.62, 64.9, 70.26],
      borderColor: Utils.color(8),
    },
    {
      label: 'TinyLFU',
      data: [10.46, 22.68, 33.32, 42.91, 51.35, 59.12, 65.25, 70.6],
      borderColor: Utils.color(4),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/bb3f3eac-3193-4f22-90d8-2cc819e073fb)

W-TinyLFU, (TinyLFU) > (LIRS) > DWC > ARC > LRU

- DWC is an approximation of ARC.

```
S3 100,000
LRU hit ratio 2.32%
DWC hit ratio 10.14%
DWC - LRU hit ratio delta 7.81%
DWC / LRU hit ratio ratio 435%

S3 200,000
LRU hit ratio 4.63%
DWC hit ratio 20.25%
DWC - LRU hit ratio delta 15.61%
DWC / LRU hit ratio ratio 437%

S3 300,000
LRU hit ratio 7.58%
DWC hit ratio 27.39%
DWC - LRU hit ratio delta 19.80%
DWC / LRU hit ratio ratio 360%

S3 400,000
LRU hit ratio 12.03%
DWC hit ratio 32.69%
DWC - LRU hit ratio delta 20.65%
DWC / LRU hit ratio ratio 271%

S3 500,000
LRU hit ratio 22.76%
DWC hit ratio 38.12%
DWC - LRU hit ratio delta 15.35%
DWC / LRU hit ratio ratio 167%

S3 600,000
LRU hit ratio 34.63%
DWC hit ratio 46.82%
DWC - LRU hit ratio delta 12.19%
DWC / LRU hit ratio ratio 135%

S3 700,000
LRU hit ratio 46.04%
DWC hit ratio 55.71%
DWC - LRU hit ratio delta 9.66%
DWC / LRU hit ratio ratio 120%

S3 800,000
LRU hit ratio 56.59%
DWC hit ratio 64.03%
DWC - LRU hit ratio delta 7.43%
DWC / LRU hit ratio ratio 113%
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
      data: [19.59, 29.12, 34.90, 37.93, 39.96, 41.79, 43.43, 44.70],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [18.27, 26.87, 31.71, 34.82, 37.24, 39.2, 40.79, 42.52],
      borderColor: Utils.color(3),
    },
    {
      label: 'W-TinyLFU',
      data: [22.76, 29.21, 32.97, 35.3, 37.52, 38.99, 40.37, 41.67],
      borderColor: Utils.color(8),
    },
    {
      label: 'TinyLFU',
      data: [15.9, 19.51, 21.9, 24.41, 26.18, 28.65, 30.03, 31.11],
      borderColor: Utils.color(4),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/1861b8c7-1ca4-492e-bf72-0019a8a180c3)

ARC > DWC > W-TinyLFU > (LIRS) > LRU > (TinyLFU)

- DWC is an approximation of ARC.

```
OLTP 250
LRU hit ratio 16.47%
DWC hit ratio 19.59%
DWC - LRU hit ratio delta 3.11%
DWC / LRU hit ratio ratio 118%

OLTP 500
LRU hit ratio 23.44%
DWC hit ratio 29.12%
DWC - LRU hit ratio delta 5.68%
DWC / LRU hit ratio ratio 124%

OLTP 750
LRU hit ratio 28.28%
DWC hit ratio 34.90%
DWC - LRU hit ratio delta 6.62%
DWC / LRU hit ratio ratio 123%

OLTP 1,000
LRU hit ratio 32.83%
DWC hit ratio 37.93%
DWC - LRU hit ratio delta 5.10%
DWC / LRU hit ratio ratio 115%

OLTP 1,250
LRU hit ratio 36.20%
DWC hit ratio 39.96%
DWC - LRU hit ratio delta 3.75%
DWC / LRU hit ratio ratio 110%

OLTP 1,500
LRU hit ratio 38.69%
DWC hit ratio 41.79%
DWC - LRU hit ratio delta 3.09%
DWC / LRU hit ratio ratio 108%

OLTP 1,750
LRU hit ratio 40.78%
DWC hit ratio 43.43%
DWC - LRU hit ratio delta 2.64%
DWC / LRU hit ratio ratio 106%

OLTP 2,000
LRU hit ratio 42.46%
DWC hit ratio 44.70%
DWC - LRU hit ratio delta 2.23%
DWC / LRU hit ratio ratio 105%
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
      data: [15.44, 31.53, 41.55, 49.30, 52.42, 53.49, 55.60, 57.96],
      borderColor: Utils.color(2),
    },
    {
      label: 'LIRS',
      data: [15.91, 33.6, 43.61, 50.56, 51.85, 53.55, 55.58, 57.96],
      borderColor: Utils.color(3),
    },
    {
      label: 'W-TinyLFU',
      data: [15.15, 33.08, 43.11, 50.57, 51.87, 53.57, 55.61, 57.96],
      borderColor: Utils.color(8),
    },
    {
      label: 'TinyLFU',
      data: [16.56, 33.85, 43.86, 50.96, 52.05, 53.57, 55.89, 57.96],
      borderColor: Utils.color(4),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/83ecb920-246f-41d7-90f5-93820aba2ce6)

W-TinyLFU, (TinyLFU), (LIRS) > DWC >> ARC > LRU

- DWC is an approximation of W-TinyLFU.

```
GLI 250
LRU hit ratio 0.93%
DWC hit ratio 15.44%
DWC - LRU hit ratio delta 14.51%
DWC / LRU hit ratio ratio 1658%

GLI 500
LRU hit ratio 0.96%
DWC hit ratio 31.53%
DWC - LRU hit ratio delta 30.56%
DWC / LRU hit ratio ratio 3270%

GLI 750
LRU hit ratio 1.16%
DWC hit ratio 41.55%
DWC - LRU hit ratio delta 40.39%
DWC / LRU hit ratio ratio 3571%

GLI 1,000
LRU hit ratio 11.22%
DWC hit ratio 49.30%
DWC - LRU hit ratio delta 38.08%
DWC / LRU hit ratio ratio 439%

GLI 1,250
LRU hit ratio 21.25%
DWC hit ratio 52.42%
DWC - LRU hit ratio delta 31.16%
DWC / LRU hit ratio ratio 246%

GLI 1,500
LRU hit ratio 36.56%
DWC hit ratio 53.49%
DWC - LRU hit ratio delta 16.92%
DWC / LRU hit ratio ratio 146%

GLI 1,750
LRU hit ratio 45.04%
DWC hit ratio 55.60%
DWC - LRU hit ratio delta 10.55%
DWC / LRU hit ratio ratio 123%

GLI 2,000
LRU hit ratio 57.41%
DWC hit ratio 57.96%
DWC - LRU hit ratio delta 0.54%
DWC / LRU hit ratio ratio 100%
```

<!--
```
LOOP 100
LRU hit ratio 0.00%
DWC hit ratio 8.12%
DWC - LRU hit ratio delta 8.12%
DWC / LRU hit ratio ratio Infinity%

LOOP 250
LRU hit ratio 0.00%
DWC hit ratio 21.33%
DWC - LRU hit ratio delta 21.33%
DWC / LRU hit ratio ratio Infinity%

LOOP 500
LRU hit ratio 0.00%
DWC hit ratio 44.42%
DWC - LRU hit ratio delta 44.42%
DWC / LRU hit ratio ratio Infinity%

LOOP 750
LRU hit ratio 0.00%
DWC hit ratio 67.62%
DWC - LRU hit ratio delta 67.62%
DWC / LRU hit ratio ratio Infinity%

LOOP 1,000
LRU hit ratio 0.00%
DWC hit ratio 96.77%
DWC - LRU hit ratio delta 96.77%
DWC / LRU hit ratio ratio Infinity%

LOOP 1,250
LRU hit ratio 99.80%
DWC hit ratio 99.80%
DWC - LRU hit ratio delta 0.00%
DWC / LRU hit ratio ratio 100%

WS1 1,000,000
LRU hit ratio 2.95%
DWC hit ratio 10.37%
DWC - LRU hit ratio delta 7.42%
DWC / LRU hit ratio ratio 351%

WS1 2,000,000
LRU hit ratio 6.08%
DWC hit ratio 18.37%
DWC - LRU hit ratio delta 12.28%
DWC / LRU hit ratio ratio 301%

WS1 3,000,000
LRU hit ratio 9.63%
DWC hit ratio 21.94%
DWC - LRU hit ratio delta 12.31%
DWC / LRU hit ratio ratio 227%

WS1 4,000,000
LRU hit ratio 21.59%
DWC hit ratio 27.22%
DWC - LRU hit ratio delta 5.62%
DWC / LRU hit ratio ratio 126%

WS1 5,000,000
LRU hit ratio 33.91%
DWC hit ratio 37.77%
DWC - LRU hit ratio delta 3.86%
DWC / LRU hit ratio ratio 111%

WS1 6,000,000
LRU hit ratio 45.74%
DWC hit ratio 48.43%
DWC - LRU hit ratio delta 2.69%
DWC / LRU hit ratio ratio 105%

WS1 7,000,000
LRU hit ratio 54.89%
DWC hit ratio 56.74%
DWC - LRU hit ratio delta 1.85%
DWC / LRU hit ratio ratio 103%

WS1 8,000,000
LRU hit ratio 61.40%
DWC hit ratio 62.11%
DWC - LRU hit ratio delta 0.71%
DWC / LRU hit ratio ratio 101%

F1 2,500
LRU hit ratio 27.74%
DWC hit ratio 25.12%
DWC - LRU hit ratio delta -2.61%
DWC / LRU hit ratio ratio 90%

F1 5,000
LRU hit ratio 30.55%
DWC hit ratio 30.20%
DWC - LRU hit ratio delta -0.35%
DWC / LRU hit ratio ratio 98%

F1 7,500
LRU hit ratio 32.18%
DWC hit ratio 33.85%
DWC - LRU hit ratio delta 1.67%
DWC / LRU hit ratio ratio 105%

F1 10,000
LRU hit ratio 33.27%
DWC hit ratio 35.64%
DWC - LRU hit ratio delta 2.36%
DWC / LRU hit ratio ratio 107%

F1 12,500
LRU hit ratio 34.19%
DWC hit ratio 36.73%
DWC - LRU hit ratio delta 2.54%
DWC / LRU hit ratio ratio 107%

F1 15,000
LRU hit ratio 34.97%
DWC hit ratio 37.61%
DWC - LRU hit ratio delta 2.64%
DWC / LRU hit ratio ratio 107%

F1 17,500
LRU hit ratio 35.62%
DWC hit ratio 38.17%
DWC - LRU hit ratio delta 2.55%
DWC / LRU hit ratio ratio 107%

F1 20,000
LRU hit ratio 36.17%
DWC hit ratio 38.80%
DWC - LRU hit ratio delta 2.63%
DWC / LRU hit ratio ratio 107%
```
-->

## Throughput

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
'Clock    new x 1,650,836 ops/sec ±1.94% (94 runs sampled)'

'ISCCache new x 18,042 ops/sec ±0.66% (105 runs sampled)'

'LRUCache new x 30,098,951 ops/sec ±0.23% (106 runs sampled)'

'DW-Cache new x 7,021,323 ops/sec ±0.30% (105 runs sampled)'

'Clock    simulation 100 10% x 9,762,593 ops/sec ±0.36% (107 runs sampled)'

'ISCCache simulation 100 10% x 8,761,469 ops/sec ±0.38% (107 runs sampled)'

'LRUCache simulation 100 10% x 10,769,407 ops/sec ±0.28% (107 runs sampled)'

'DW-Cache simulation 100 10% x 7,242,192 ops/sec ±0.50% (105 runs sampled)'

'Clock    simulation 1,000 10% x 9,601,967 ops/sec ±0.48% (107 runs sampled)'

'ISCCache simulation 1,000 10% x 7,986,140 ops/sec ±0.58% (106 runs sampled)'

'LRUCache simulation 1,000 10% x 9,735,550 ops/sec ±0.41% (106 runs sampled)'

'DW-Cache simulation 1,000 10% x 6,592,345 ops/sec ±0.37% (107 runs sampled)'

'Clock    simulation 10,000 10% x 9,344,809 ops/sec ±0.40% (105 runs sampled)'

'ISCCache simulation 10,000 10% x 7,193,304 ops/sec ±0.83% (106 runs sampled)'

'LRUCache simulation 10,000 10% x 8,881,517 ops/sec ±0.41% (104 runs sampled)'

'DW-Cache simulation 10,000 10% x 6,020,040 ops/sec ±0.50% (106 runs sampled)'

'Clock    simulation 100,000 10% x 5,948,133 ops/sec ±1.22% (101 runs sampled)'

'ISCCache simulation 100,000 10% x 3,654,505 ops/sec ±1.47% (101 runs sampled)'

'LRUCache simulation 100,000 10% x 5,615,930 ops/sec ±1.35% (100 runs sampled)'

'DW-Cache simulation 100,000 10% x 4,255,377 ops/sec ±1.79% (97 runs sampled)'

'Clock    simulation 1,000,000 10% x 2,605,647 ops/sec ±3.98% (93 runs sampled)'

'ISCCache simulation 1,000,000 10% x 1,453,643 ops/sec ±2.92% (95 runs sampled)'

'LRUCache simulation 1,000,000 10% x 2,081,983 ops/sec ±4.23% (88 runs sampled)'

'DW-Cache simulation 1,000,000 10% x 2,598,274 ops/sec ±4.42% (89 runs sampled)'

'Clock    simulation 100 90% x 25,014,146 ops/sec ±0.33% (107 runs sampled)'

'ISCCache simulation 100 90% x 22,495,828 ops/sec ±0.74% (105 runs sampled)'

'LRUCache simulation 100 90% x 20,969,655 ops/sec ±0.84% (107 runs sampled)'

'DW-Cache simulation 100 90% x 9,730,398 ops/sec ±0.32% (107 runs sampled)'

'Clock    simulation 1,000 90% x 23,025,311 ops/sec ±0.51% (107 runs sampled)'

'ISCCache simulation 1,000 90% x 19,347,819 ops/sec ±0.34% (107 runs sampled)'

'LRUCache simulation 1,000 90% x 18,240,448 ops/sec ±0.28% (107 runs sampled)'

'DW-Cache simulation 1,000 90% x 11,382,934 ops/sec ±0.19% (108 runs sampled)'

'Clock    simulation 10,000 90% x 20,506,917 ops/sec ±0.25% (105 runs sampled)'

'ISCCache simulation 10,000 90% x 15,441,103 ops/sec ±1.24% (105 runs sampled)'

'LRUCache simulation 10,000 90% x 13,104,661 ops/sec ±0.61% (105 runs sampled)'

'DW-Cache simulation 10,000 90% x 8,747,757 ops/sec ±0.92% (107 runs sampled)'

'Clock    simulation 100,000 90% x 12,049,875 ops/sec ±1.49% (100 runs sampled)'

'ISCCache simulation 100,000 90% x 8,173,371 ops/sec ±1.17% (102 runs sampled)'

'LRUCache simulation 100,000 90% x 8,188,424 ops/sec ±2.08% (100 runs sampled)'

'DW-Cache simulation 100,000 90% x 5,973,422 ops/sec ±2.65% (100 runs sampled)'

'Clock    simulation 1,000,000 90% x 5,578,321 ops/sec ±4.20% (92 runs sampled)'

'ISCCache simulation 1,000,000 90% x 2,963,294 ops/sec ±2.91% (95 runs sampled)'

'LRUCache simulation 1,000,000 90% x 2,235,658 ops/sec ±2.83% (95 runs sampled)'

'DW-Cache simulation 1,000,000 90% x 1,931,442 ops/sec ±2.32% (98 runs sampled)'

'ISCCache simulation 100 90% expire x 4,172,541 ops/sec ±5.34% (94 runs sampled)'

'DW-Cache simulation 100 90% expire x 8,241,722 ops/sec ±0.42% (107 runs sampled)'

'ISCCache simulation 1,000 90% expire x 4,169,949 ops/sec ±3.98% (97 runs sampled)'

'DW-Cache simulation 1,000 90% expire x 8,218,212 ops/sec ±0.30% (107 runs sampled)'

'ISCCache simulation 10,000 90% expire x 3,539,574 ops/sec ±4.02% (98 runs sampled)'

'DW-Cache simulation 10,000 90% expire x 6,338,384 ops/sec ±1.07% (105 runs sampled)'

'ISCCache simulation 100,000 90% expire x 2,429,074 ops/sec ±4.48% (94 runs sampled)'

'DW-Cache simulation 100,000 90% expire x 1,977,169 ops/sec ±2.71% (86 runs sampled)'

'ISCCache simulation 1,000,000 90% expire x 448,719 ops/sec ±5.09% (82 runs sampled)'

'DW-Cache simulation 1,000,000 90% expire x 629,254 ops/sec ±3.81% (98 runs sampled)'
```

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
