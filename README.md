# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

The highest performance constant complexity cache algorithm.

## Maintenance

The source code is maintained on the next source repository.

https://github.com/falsandtru/spica

## Efficiency

TLRU and TRC are abbreviations for TrueLRU (spica/tlru).

### Mathematical efficiency

Some different cache algorithms require extra memory space to retain evicted keys.
Linear time complexity indicates the existence of batch processing.
Note that admission algorithm doesn't work without eviction algorithm.

|Algorithm|Type |Time complexity<br>(Worst case)|Space complexity<br>(Extra)|Key size|Data structures|
|:-------:|:---:|:------:|:------:|:---------:|:-----:|
|LRU      |Evict|Constant|Constant|    1x     |1 list |
|TLRU     |Evict|Constant|Constant|    1x     |1 list |
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
|TLRU     |      16 bytes|      1x|       32 bytes|                100.00%|
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
|TLRU     |      16 bytes|      1x|       56 bytes|                100.00%|
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
|TLRU     |      16 bytes|      1x|      544 bytes|                100.00%|
|DWC      |      17 bytes|      1x|      545 bytes|                 99.81%|
|ARC      |      17 bytes|      2x|      578 bytes|                 94.11%|
|(LIRS)   |      33 bytes|      3x|      659 bytes|                 82.54%|
|(LIRS)   |      33 bytes|     10x|    1,002 bytes|                 54.29%|
|(TinyLFU)|      56 bytes|      1x|      584 bytes|                 93.15%|
|W-TinyLFU|      56 bytes|      1x|      584 bytes|                 93.15%|

## Resistance

LIRS's burst resistance means the resistance to continuous cache misses for the last LIR entry or the HIR entries.
TLRU's loop resistance is limited.

|Algorithm|Type |Scan|Loop|Burst|
|:-------:|:---:|:--:|:--:|:---:|
|LRU      |Evict|    |    |  ✓ |
|TLRU     |Evict| ✓ |  ✓ | ✓  |
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
    - For discontinuous workloads, TLRU is better.
  - No tradeoffs other than hit ratio
    - Other advanced cache algorithms have some tradeoffs such as spike latency by linear time complexity, delayed memory release by linear space complexity, or implementability.
      - Other advanced cache algorithms cannot generally replace LRU due to these tradeoffs.

## Tradeoffs

Note that LIRS and TinyLFU are risky cache algorithms.

- LRU
  - Low performance
  - No resistance
    - **Scan access clears all entries.**
- TLRU
  - Middle performance
    - Lower hit ratio than DWC.
  - Limited resistance
    - Limited loop resistance.
- DWC
  - Not the highest hit ratio
  - Statistical accuracy dependent
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
  - Ristretto's results are 5-10% lower than Caffeine's ones due to their changes.

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

### WS1

<!--
const data = {
  labels: [1e6, 2e6, 3e6, 4e6, 5e6, 6e6, 7e6, 8e6],
  datasets: [
    {
      label: 'Optimal',
      data: [27.31, 41.28, 51.04, 57.8, 62.72, 65.85, 67.22, 67.22],
    },
    {
      label: 'LRU',
      data: [2.95, 6.09, 9.63, 21.6, 33.92, 45.74, 54.89, 61.4],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [8.05, 14.49, 23.62, 31.18, 39.63, 49.82, 57.78, 62.19],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [10.56, 20.78, 30.22, 38.93, 46.85, 53.50, 58.89, 62.93],
      borderColor: Utils.color(2),
    },
    {
      label: 'TrueLRU',
      data: [8.09, 18.03, 26.92, 35.88, 44.19, 51.66, 57.70, 62.46],
      borderColor: Utils.color(1),
    },
    {
      label: 'LIRS',
      data: [12.74, 18.65, 29.05, 39.08, 47.68, 54.81, 59.9, 63.57],
      borderColor: Utils.color(3),
    },
    {
      label: 'W-TinyLFU',
      data: [11.93, 23.08, 32.87, 41.45, 48.92, 55.15, 59.82, 63.45],
      borderColor: Utils.color(8),
    },
    {
      label: 'TinyLFU',
      data: [11.55, 23.23, 33.08, 41.5, 49.2, 55.27, 59.96, 63.69],
      borderColor: Utils.color(4),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/34c53f79-913c-45f7-904c-a40eb36cedf8)

W-TinyLFU, (TinyLFU) > (LIRS), DWC > TLRU > ARC > LRU

```
WS1 1,000,000
LRU hit ratio 2.95%
TRC hit ratio 8.09%
DWC hit ratio 10.56%
DWC - LRU hit ratio delta 7.61%

WS1 2,000,000
LRU hit ratio 6.08%
TRC hit ratio 18.03%
DWC hit ratio 20.78%
DWC - LRU hit ratio delta 14.70%

WS1 3,000,000
LRU hit ratio 9.63%
TRC hit ratio 26.92%
DWC hit ratio 30.22%
DWC - LRU hit ratio delta 20.59%

WS1 4,000,000
LRU hit ratio 21.59%
TRC hit ratio 35.88%
DWC hit ratio 38.93%
DWC - LRU hit ratio delta 17.33%

WS1 5,000,000
LRU hit ratio 33.91%
TRC hit ratio 44.19%
DWC hit ratio 46.85%
DWC - LRU hit ratio delta 12.93%

WS1 6,000,000
LRU hit ratio 45.74%
TRC hit ratio 51.66%
DWC hit ratio 53.50%
DWC - LRU hit ratio delta 7.76%

WS1 7,000,000
LRU hit ratio 54.89%
TRC hit ratio 57.70%
DWC hit ratio 58.89%
DWC - LRU hit ratio delta 3.99%

WS1 8,000,000
LRU hit ratio 61.40%
TRC hit ratio 62.46%
DWC hit ratio 62.93%
DWC - LRU hit ratio delta 1.53%
```

### WS2

<!--
const data = {
  labels: [1e6, 2e6, 3e6, 4e6, 5e6, 6e6, 7e6, 8e6],
  datasets: [
    {
      label: 'Optimal',
      data: [29.68, 46.08, 58.2, 67.41, 74.54, 79.86, 83.72, 86.44],
    },
    {
      label: 'LRU',
      data: [2.91, 6.2, 10.1, 23.46, 37.94, 51.69, 63.81, 73.12],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [15.06, 26.23, 30.87, 38.66, 48.03, 56.23, 66.8, 75.28],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [12.73, 24.21, 35.00, 44.72, 54.07, 62.40, 69.48, 75.77],
      borderColor: Utils.color(2),
    },
    {
      label: 'TrueLRU',
      data: [9.28, 19.86, 30.05, 40.41, 50.39, 60.05, 69.29, 76.33],
      borderColor: Utils.color(1),
    },
    {
      label: 'LIRS',
      data: [15.18, 20.39, 32.43, 44.38, 55.23, 64.56, 72.1, 78.04],
      borderColor: Utils.color(3),
    },
    {
      label: 'W-TinyLFU',
      data: [15.47, 28.79, 40.63, 51.03, 60.29, 67.66, 73.69, 78.35],
      borderColor: Utils.color(8),
    },
    {
      label: 'TinyLFU',
      data: [14.17, 28.67, 41.03, 51.52, 60.63, 68.1, 73.94, 78.39],
      borderColor: Utils.color(4),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/b56bac3d-fcff-4380-a8b0-7c2f63de9df1)

W-TinyLFU, (TinyLFU) > (LIRS), DWC > TLRU > ARC > LRU

```
WS2 1,000,000
LRU hit ratio 2.91%
TRC hit ratio 9.28%
DWC hit ratio 12.73%
DWC - LRU hit ratio delta 9.82%

WS2 2,000,000
LRU hit ratio 6.19%
TRC hit ratio 19.86%
DWC hit ratio 24.21%
DWC - LRU hit ratio delta 18.02%

WS2 3,000,000
LRU hit ratio 10.09%
TRC hit ratio 30.05%
DWC hit ratio 35.00%
DWC - LRU hit ratio delta 24.90%

WS2 4,000,000
LRU hit ratio 23.45%
TRC hit ratio 40.41%
DWC hit ratio 44.72%
DWC - LRU hit ratio delta 21.26%

WS2 5,000,000
LRU hit ratio 37.94%
TRC hit ratio 50.39%
DWC hit ratio 54.07%
DWC - LRU hit ratio delta 16.12%

WS2 6,000,000
LRU hit ratio 51.68%
TRC hit ratio 60.05%
DWC hit ratio 62.40%
DWC - LRU hit ratio delta 10.71%

WS2 7,000,000
LRU hit ratio 63.81%
TRC hit ratio 69.29%
DWC hit ratio 69.48%
DWC - LRU hit ratio delta 5.66%

WS2 8,000,000
LRU hit ratio 73.11%
TRC hit ratio 76.33%
DWC hit ratio 75.77%
DWC - LRU hit ratio delta 2.66%
```

### F1

<!--
const data = {
  labels: [2500, 5000, 7500, 10000, 12500, 15000, 17500, 20000],
  datasets: [
    {
      label: 'Optimal',
      data: [38.49, 41.77, 43.96, 45.65, 47.13, 48.38, 49.5, 50.52],
    },
    {
      label: 'LRU',
      data: [27.74, 30.56, 32.18, 33.27, 34.19, 34.97, 35.62, 36.17],
      borderColor: Utils.color(0),
    },
    {
      label: 'ARC',
      data: [30.35, 33.42, 35.04, 36.37, 37.28, 37.81, 38.52, 38.98],
      borderColor: Utils.color(6),
    },
    {
      label: 'DWC',
      data: [24.71, 29.36, 32.24, 34.66, 36.28, 37.03, 37.90, 38.31],
      borderColor: Utils.color(2),
    },
    {
      label: 'TrueLRU',
      data: [27.48, 31.52, 34.04, 35.57, 36.72, 37.60, 38.32, 38.82],
      borderColor: Utils.color(1),
    },
    {
      label: 'LIRS',
      data: [27.42, 31.75, 33.42, 35.06, 35.89, 36.58, 37.22, 37.75],
      borderColor: Utils.color(3),
    },
    {
      label: 'W-TinyLFU',
      data: [22.87, 27.6, 30.1, 31.71, 32.65, 33.47, 34.09, 33.92],
      borderColor: Utils.color(8),
    },
    {
      label: 'TinyLFU',
      data: [19.77, 23.43, 25.2, 27.18, 28.05, 28.73, 29.5, 30.06],
      borderColor: Utils.color(4),
    },
  ]
};
-->

![image](https://github.com/falsandtru/dw-cache/assets/3143368/cfc84502-dcba-494e-a3f1-4c7a3e514fc4)

ARC > SLRU, TLRU > (LIRS), DWC > LRU > W-TinyLFU > TinyLFU

```
F1 2,500
LRU hit ratio 27.74%
TRC hit ratio 27.48%
DWC hit ratio 24.71%
DWC - LRU hit ratio delta -3.02%

F1 5,000
LRU hit ratio 30.55%
TRC hit ratio 31.52%
DWC hit ratio 29.36%
DWC - LRU hit ratio delta -1.19%

F1 7,500
LRU hit ratio 32.18%
TRC hit ratio 34.04%
DWC hit ratio 32.24%
DWC - LRU hit ratio delta 0.06%

F1 10,000
LRU hit ratio 33.27%
TRC hit ratio 35.57%
DWC hit ratio 34.66%
DWC - LRU hit ratio delta 1.38%

F1 12,500
LRU hit ratio 34.19%
TRC hit ratio 36.72%
DWC hit ratio 36.28%
DWC - LRU hit ratio delta 2.09%

F1 15,000
LRU hit ratio 34.97%
TRC hit ratio 37.60%
DWC hit ratio 37.03%
DWC - LRU hit ratio delta 2.05%

F1 17,500
LRU hit ratio 35.62%
TRC hit ratio 38.32%
DWC hit ratio 37.90%
DWC - LRU hit ratio delta 2.28%

F1 20,000
LRU hit ratio 36.17%
TRC hit ratio 38.82%
DWC hit ratio 38.31%
DWC - LRU hit ratio delta 2.13%
```

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
      data: [14.07, 27.89, 39.55, 43.45, 49.71, 56.46, 63.21, 69.44],
      borderColor: Utils.color(2),
    },
    {
      label: 'TrueLRU',
      data: [10.47, 22.78, 34.45, 39.68, 46.69, 53.64, 61.28, 68.93],
      borderColor: Utils.color(1),
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

![image](https://github.com/falsandtru/dw-cache/assets/3143368/e3347a83-4814-444e-89d7-56e32e95e611)

W-TinyLFU, (TinyLFU) > DWC > TLRU, (LIRS) > ARC > LRU

```
DS1 1,000,000
LRU hit ratio 3.08%
TRC hit ratio 10.47%
DWC hit ratio 14.07%
DWC - LRU hit ratio delta 10.98%

DS1 2,000,000
LRU hit ratio 10.74%
TRC hit ratio 22.78%
DWC hit ratio 27.89%
DWC - LRU hit ratio delta 17.15%

DS1 3,000,000
LRU hit ratio 18.59%
TRC hit ratio 34.45%
DWC hit ratio 39.55%
DWC - LRU hit ratio delta 20.96%

DS1 4,000,000
LRU hit ratio 20.24%
TRC hit ratio 39.68%
DWC hit ratio 43.45%
DWC - LRU hit ratio delta 23.20%

DS1 5,000,000
LRU hit ratio 21.03%
TRC hit ratio 46.69%
DWC hit ratio 49.71%
DWC - LRU hit ratio delta 28.68%

DS1 6,000,000
LRU hit ratio 33.95%
TRC hit ratio 53.64%
DWC hit ratio 56.46%
DWC - LRU hit ratio delta 22.50%

DS1 7,000,000
LRU hit ratio 38.89%
TRC hit ratio 61.28%
DWC hit ratio 63.21%
DWC - LRU hit ratio delta 24.31%

DS1 8,000,000
LRU hit ratio 43.03%
TRC hit ratio 68.93%
DWC hit ratio 69.44%
DWC - LRU hit ratio delta 26.40%
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
      data: [9.91, 19.41, 28.23, 36.73, 44.59, 52.05, 58.66, 66.02],
      borderColor: Utils.color(2),
    },
    {
      label: 'TrueLRU',
      data: [6.99, 15.49, 23.85, 31.94, 40.35, 48.40, 55.86, 63.88],
      borderColor: Utils.color(1),
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

![image](https://github.com/falsandtru/dw-cache/assets/3143368/6905a1d1-a23b-4044-b4ed-9b240735422d)

W-TinyLFU, (TinyLFU) > (LIRS), DWC > TLRU, ARC > LRU

```
S3 100,000
LRU hit ratio 2.32%
TRC hit ratio 6.99%
DWC hit ratio 9.91%
DWC - LRU hit ratio delta 7.58%

S3 200,000
LRU hit ratio 4.63%
TRC hit ratio 15.49%
DWC hit ratio 19.41%
DWC - LRU hit ratio delta 14.78%

S3 300,000
LRU hit ratio 7.58%
TRC hit ratio 23.85%
DWC hit ratio 28.23%
DWC - LRU hit ratio delta 20.64%

S3 400,000
LRU hit ratio 12.03%
TRC hit ratio 31.94%
DWC hit ratio 36.73%
DWC - LRU hit ratio delta 24.69%

S3 500,000
LRU hit ratio 22.76%
TRC hit ratio 40.35%
DWC hit ratio 44.59%
DWC - LRU hit ratio delta 21.82%

S3 600,000
LRU hit ratio 34.63%
TRC hit ratio 48.40%
DWC hit ratio 52.05%
DWC - LRU hit ratio delta 17.42%

S3 700,000
LRU hit ratio 46.04%
TRC hit ratio 55.86%
DWC hit ratio 58.66%
DWC - LRU hit ratio delta 12.62%

S3 800,000
LRU hit ratio 56.59%
TRC hit ratio 63.88%
DWC hit ratio 66.02%
DWC - LRU hit ratio delta 9.42%
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
      data: [19.54, 29.36, 34.81, 37.74, 39.94, 41.81, 43.22, 44.62],
      borderColor: Utils.color(2),
    },
    {
      label: 'TrueLRU',
      data: [17.06, 27.86, 33.11, 36.53, 38.88, 40.79, 42.36, 43.65],
      borderColor: Utils.color(1),
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

![image](https://github.com/falsandtru/dw-cache/assets/3143368/3e7e1395-9f81-4f47-b28f-67630f7c6346)

ARC > DWC > TLRU > W-TinyLFU > (LIRS) > LRU > (TinyLFU)

```
OLTP 250
LRU hit ratio 16.47%
TRC hit ratio 17.06%
DWC hit ratio 19.54%
DWC - LRU hit ratio delta 3.07%

OLTP 500
LRU hit ratio 23.44%
TRC hit ratio 27.86%
DWC hit ratio 29.36%
DWC - LRU hit ratio delta 5.92%

OLTP 750
LRU hit ratio 28.28%
TRC hit ratio 33.11%
DWC hit ratio 34.81%
DWC - LRU hit ratio delta 6.53%

OLTP 1,000
LRU hit ratio 32.83%
TRC hit ratio 36.53%
DWC hit ratio 37.74%
DWC - LRU hit ratio delta 4.91%

OLTP 1,250
LRU hit ratio 36.20%
TRC hit ratio 38.88%
DWC hit ratio 39.94%
DWC - LRU hit ratio delta 3.73%

OLTP 1,500
LRU hit ratio 38.69%
TRC hit ratio 40.79%
DWC hit ratio 41.81%
DWC - LRU hit ratio delta 3.11%

OLTP 1,750
LRU hit ratio 40.78%
TRC hit ratio 42.36%
DWC hit ratio 43.22%
DWC - LRU hit ratio delta 2.43%

OLTP 2,000
LRU hit ratio 42.46%
TRC hit ratio 43.65%
DWC hit ratio 44.62%
DWC - LRU hit ratio delta 2.15%
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
      data: [15.54, 31.38, 41.57, 47.83, 52.55, 53.64, 54.70, 57.96],
      borderColor: Utils.color(2),
    },
    {
      label: 'TrueLRU',
      data: [10.62, 25.03, 37.21, 47.24, 52.04, 53.00, 55.88, 57.96],
      borderColor: Utils.color(1),
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

![image](https://github.com/falsandtru/dw-cache/assets/3143368/9b3c0789-b749-486d-9fcf-de3bf99bd5f8)

W-TinyLFU, (TinyLFU), (LIRS) > DWC > TLRU >> ARC > LRU

```
GLI 250
LRU hit ratio 0.93%
TRC hit ratio 10.62%
DWC hit ratio 15.54%
DWC - LRU hit ratio delta 14.61%

GLI 500
LRU hit ratio 0.96%
TRC hit ratio 25.03%
DWC hit ratio 31.38%
DWC - LRU hit ratio delta 30.41%

GLI 750
LRU hit ratio 1.16%
TRC hit ratio 37.21%
DWC hit ratio 41.57%
DWC - LRU hit ratio delta 40.40%

GLI 1,000
LRU hit ratio 11.22%
TRC hit ratio 47.24%
DWC hit ratio 47.83%
DWC - LRU hit ratio delta 36.61%

GLI 1,250
LRU hit ratio 21.25%
TRC hit ratio 52.04%
DWC hit ratio 52.55%
DWC - LRU hit ratio delta 31.29%

GLI 1,500
LRU hit ratio 36.56%
TRC hit ratio 53.00%
DWC hit ratio 53.64%
DWC - LRU hit ratio delta 17.07%

GLI 1,750
LRU hit ratio 45.04%
TRC hit ratio 55.88%
DWC hit ratio 54.70%
DWC - LRU hit ratio delta 9.65%

GLI 2,000
LRU hit ratio 57.41%
TRC hit ratio 57.96%
DWC hit ratio 57.96%
DWC - LRU hit ratio delta 0.54%
```

<!--
```
LOOP 100
LRU hit ratio 0.00%
TRC hit ratio 0.00%
DWC hit ratio 8.14%
DWC - LRU hit ratio delta 8.14%

LOOP 250
LRU hit ratio 0.00%
TRC hit ratio 0.00%
DWC hit ratio 21.67%
DWC - LRU hit ratio delta 21.67%

LOOP 500
LRU hit ratio 0.00%
TRC hit ratio 0.00%
DWC hit ratio 43.37%
DWC - LRU hit ratio delta 43.37%

LOOP 750
LRU hit ratio 0.00%
TRC hit ratio 0.00%
DWC hit ratio 67.36%
DWC - LRU hit ratio delta 67.36%

LOOP 1,000
LRU hit ratio 0.00%
TRC hit ratio 0.00%
DWC hit ratio 98.10%
DWC - LRU hit ratio delta 98.10%

LOOP 1,250
LRU hit ratio 99.80%
TRC hit ratio 99.80%
DWC hit ratio 99.80%
DWC - LRU hit ratio delta 0.00%
```
-->

## Throughput

Clock: spica/clock<br>
ISC: [lru-cache](https://www.npmjs.com/package/lru-cache)<br>
LRU: spica/lru<br>
TRC-C: spica/tlru (spica/trul.clock)<br>
TRC-L: spica/trul.lru<br>
DWC: spica/cache<br>

```
'Clock new x 1,667,305 ops/sec ±1.26% (116 runs sampled)'

'ISC   new x 18,175 ops/sec ±0.95% (121 runs sampled)'

'LRU   new x 27,118,016 ops/sec ±0.97% (120 runs sampled)'

'TRC-C new x 25,545,304 ops/sec ±1.00% (121 runs sampled)'

'TRC-L new x 25,607,225 ops/sec ±1.09% (122 runs sampled)'

'DWC   new x 6,545,022 ops/sec ±0.39% (123 runs sampled)'

'Clock simulation 100 10% x 9,557,278 ops/sec ±0.37% (122 runs sampled)'

'ISC   simulation 100 10% x 9,095,011 ops/sec ±0.55% (123 runs sampled)'

'LRU   simulation 100 10% x 10,829,216 ops/sec ±0.59% (123 runs sampled)'

'TRC-C simulation 100 10% x 10,617,912 ops/sec ±0.41% (121 runs sampled)'

'TRC-L simulation 100 10% x 9,541,812 ops/sec ±0.45% (124 runs sampled)'

'DWC   simulation 100 10% x 6,629,421 ops/sec ±0.34% (122 runs sampled)'

'Clock simulation 1,000 10% x 9,412,806 ops/sec ±0.48% (122 runs sampled)'

'ISC   simulation 1,000 10% x 8,316,073 ops/sec ±0.63% (123 runs sampled)'

'LRU   simulation 1,000 10% x 9,454,926 ops/sec ±0.58% (121 runs sampled)'

'TRC-C simulation 1,000 10% x 9,392,368 ops/sec ±0.55% (123 runs sampled)'

'TRC-L simulation 1,000 10% x 8,758,622 ops/sec ±0.66% (123 runs sampled)'

'DWC   simulation 1,000 10% x 6,966,521 ops/sec ±0.54% (122 runs sampled)'

'Clock simulation 10,000 10% x 9,362,730 ops/sec ±0.41% (121 runs sampled)'

'ISC   simulation 10,000 10% x 6,652,455 ops/sec ±0.61% (121 runs sampled)'

'LRU   simulation 10,000 10% x 8,772,925 ops/sec ±0.63% (122 runs sampled)'

'TRC-C simulation 10,000 10% x 8,458,851 ops/sec ±1.47% (121 runs sampled)'

'TRC-L simulation 10,000 10% x 7,584,079 ops/sec ±0.31% (123 runs sampled)'

'DWC   simulation 10,000 10% x 5,437,515 ops/sec ±0.82% (121 runs sampled)'

'Clock simulation 100,000 10% x 5,851,257 ops/sec ±1.69% (115 runs sampled)'

'ISC   simulation 100,000 10% x 3,494,768 ops/sec ±1.29% (116 runs sampled)'

'LRU   simulation 100,000 10% x 5,196,565 ops/sec ±2.10% (112 runs sampled)'

'TRC-C simulation 100,000 10% x 5,430,947 ops/sec ±2.41% (111 runs sampled)'

'TRC-L simulation 100,000 10% x 4,668,564 ops/sec ±2.79% (110 runs sampled)'

'DWC   simulation 100,000 10% x 3,911,026 ops/sec ±2.16% (108 runs sampled)'

'Clock simulation 1,000,000 10% x 2,623,173 ops/sec ±4.24% (103 runs sampled)'

'ISC   simulation 1,000,000 10% x 1,440,314 ops/sec ±2.41% (108 runs sampled)'

'LRU   simulation 1,000,000 10% x 2,080,750 ops/sec ±4.53% (95 runs sampled)'

'TRC-C simulation 1,000,000 10% x 2,162,367 ops/sec ±4.78% (92 runs sampled)'

'TRC-L simulation 1,000,000 10% x 2,047,437 ops/sec ±5.21% (94 runs sampled)'

'DWC   simulation 1,000,000 10% x 2,474,555 ops/sec ±4.53% (101 runs sampled)'

'Clock simulation 100 90% x 21,155,620 ops/sec ±0.71% (122 runs sampled)'

'ISC   simulation 100 90% x 19,353,075 ops/sec ±0.86% (121 runs sampled)'

'LRU   simulation 100 90% x 19,479,339 ops/sec ±0.54% (123 runs sampled)'

'TRC-C simulation 100 90% x 18,841,156 ops/sec ±0.57% (123 runs sampled)'

'TRC-L simulation 100 90% x 17,038,554 ops/sec ±0.50% (122 runs sampled)'

'DWC   simulation 100 90% x 8,467,752 ops/sec ±0.40% (122 runs sampled)'

'Clock simulation 1,000 90% x 19,883,598 ops/sec ±0.67% (121 runs sampled)'

'ISC   simulation 1,000 90% x 17,292,058 ops/sec ±0.71% (121 runs sampled)'

'LRU   simulation 1,000 90% x 16,936,615 ops/sec ±0.52% (123 runs sampled)'

'TRC-C simulation 1,000 90% x 16,710,913 ops/sec ±0.61% (122 runs sampled)'

'TRC-L simulation 1,000 90% x 15,251,516 ops/sec ±0.54% (122 runs sampled)'

'DWC   simulation 1,000 90% x 8,117,543 ops/sec ±0.41% (123 runs sampled)'

'Clock simulation 10,000 90% x 17,776,742 ops/sec ±0.65% (121 runs sampled)'

'ISC   simulation 10,000 90% x 14,203,014 ops/sec ±0.80% (121 runs sampled)'

'LRU   simulation 10,000 90% x 12,222,023 ops/sec ±1.07% (121 runs sampled)'

'TRC-C simulation 10,000 90% x 11,455,181 ops/sec ±0.89% (120 runs sampled)'

'TRC-L simulation 10,000 90% x 10,646,780 ops/sec ±0.68% (122 runs sampled)'

'DWC   simulation 10,000 90% x 7,585,892 ops/sec ±1.14% (121 runs sampled)'

'Clock simulation 100,000 90% x 10,431,555 ops/sec ±1.43% (113 runs sampled)'

'ISC   simulation 100,000 90% x 7,779,585 ops/sec ±1.10% (116 runs sampled)'

'LRU   simulation 100,000 90% x 7,437,106 ops/sec ±1.96% (116 runs sampled)'

'TRC-C simulation 100,000 90% x 7,014,440 ops/sec ±2.41% (112 runs sampled)'

'TRC-L simulation 100,000 90% x 6,763,074 ops/sec ±2.04% (114 runs sampled)'

'DWC   simulation 100,000 90% x 5,463,251 ops/sec ±1.47% (117 runs sampled)'

'Clock simulation 1,000,000 90% x 4,861,279 ops/sec ±3.30% (105 runs sampled)'

'ISC   simulation 1,000,000 90% x 2,761,139 ops/sec ±2.44% (108 runs sampled)'

'LRU   simulation 1,000,000 90% x 2,249,063 ops/sec ±2.47% (109 runs sampled)'

'TRC-C simulation 1,000,000 90% x 2,168,673 ops/sec ±2.43% (109 runs sampled)'

'TRC-L simulation 1,000,000 90% x 2,130,084 ops/sec ±2.56% (108 runs sampled)'

'DWC   simulation 1,000,000 90% x 1,722,180 ops/sec ±2.40% (110 runs sampled)'

'ISC   simulation 100 90% expire x 4,379,308 ops/sec ±4.63% (111 runs sampled)'

'DWC   simulation 100 90% expire x 7,472,573 ops/sec ±0.50% (122 runs sampled)'

'ISC   simulation 1,000 90% expire x 4,305,741 ops/sec ±3.26% (115 runs sampled)'

'DWC   simulation 1,000 90% expire x 8,407,795 ops/sec ±0.40% (123 runs sampled)'

'ISC   simulation 10,000 90% expire x 3,777,139 ops/sec ±2.71% (116 runs sampled)'

'DWC   simulation 10,000 90% expire x 6,105,993 ops/sec ±1.15% (122 runs sampled)'

'ISC   simulation 100,000 90% expire x 2,814,691 ops/sec ±2.62% (111 runs sampled)'

'DWC   simulation 100,000 90% expire x 3,123,156 ops/sec ±2.28% (105 runs sampled)'

'ISC   simulation 1,000,000 90% expire x 542,673 ops/sec ±5.52% (105 runs sampled)'

'DWC   simulation 1,000,000 90% expire x 625,963 ops/sec ±4.86% (103 runs sampled)'
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
  constructor(capacity: number, sweep?: boolean);
  constructor(capacity: number, opts?: Cache.Options<K, V>);
  constructor(opts: Cache.Options<K, V>);
  readonly length: number;
  readonly size: number;
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
  [Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
```
