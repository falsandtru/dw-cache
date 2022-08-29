# Dual Window Cache

![CI](https://github.com/falsandtru/dw-cache/workflows/CI/badge.svg)

Dual window cache adaptively coordinates the ratio of LRU to LFU using the two sliding windows.

## Maintenance

The source code is maintained on the next source repository.

https://github.com/falsandtru/spica

## Efficiency and Resistance

Some different cache algorithms require extra memory space to retain evicted keys.

|Algorithm|Key size|Lists|Scan resistance|Loop resistance|
|:-------:|:------:|:---:|:-------------:|:-------------:|
| LRU     |   1x   |  1  |       -       |       -       |
| DWC     |   1x   |  2  |       O       |       O       |
| ARC     |   2x   |  4  |       O       |       -       |
| LIRS    | 3-2500x|  2  |       O       |       O       |

https://github.com/ben-manes/caffeine/wiki/Efficiency<br>
https://github.com/zhongch4g/LIRS2/blob/master/src/replace_lirs_base.cc

## Benchmark

### Hit rate

#### S3

```
S3 100,000
LRU hit rate 2.3%
DWC hit rate 10.1%
DWC - LRU hit rate delta 7.8%
DWC / LRU hit rate ratio 435%

S3 400,000
LRU hit rate 12.0%
DWC hit rate 29.3%
DWC - LRU hit rate delta 17.3%
DWC / LRU hit rate ratio 243%

S3 800,000
LRU hit rate 56.5%
DWC hit rate 63.6%
DWC - LRU hit rate delta 7.0%
DWC / LRU hit rate ratio 112%
```

#### OLTP

```
OLTP 250
LRU hit rate 16.4%
DWC hit rate 18.2%
DWC - LRU hit rate delta 1.7%
DWC / LRU hit rate ratio 110%

OLTP 500
LRU hit rate 23.4%
DWC hit rate 28.9%
DWC - LRU hit rate delta 5.4%
DWC / LRU hit rate ratio 123%

OLTP 750
LRU hit rate 28.2%
DWC hit rate 34.7%
DWC - LRU hit rate delta 6.4%
DWC / LRU hit rate ratio 122%

OLTP 1,000
LRU hit rate 32.8%
DWC hit rate 38.0%
DWC - LRU hit rate delta 5.1%
DWC / LRU hit rate ratio 115%

OLTP 2,000
LRU hit rate 42.4%
DWC hit rate 44.5%
DWC - LRU hit rate delta 2.0%
DWC / LRU hit rate ratio 104%
```

#### LOOP

```
GLI 250
LRU hit rate 0.9%
DWC hit rate 11.8%
DWC - LRU hit rate delta 10.8%
DWC / LRU hit rate ratio 1269%

GLI 500
LRU hit rate 0.9%
DWC hit rate 24.8%
DWC - LRU hit rate delta 23.8%
DWC / LRU hit rate ratio 2577%

GLI 750
LRU hit rate 1.1%
DWC hit rate 37.9%
DWC - LRU hit rate delta 36.8%
DWC / LRU hit rate ratio 3265%

GLI 1,000
LRU hit rate 11.2%
DWC hit rate 46.1%
DWC - LRU hit rate delta 34.9%
DWC / LRU hit rate ratio 411%

GLI 1,250
LRU hit rate 21.2%
DWC hit rate 48.7%
DWC - LRU hit rate delta 27.5%
DWC / LRU hit rate ratio 229%

GLI 1,500
LRU hit rate 36.5%
DWC hit rate 54.2%
DWC - LRU hit rate delta 17.6%
DWC / LRU hit rate ratio 148%

GLI 1,750
LRU hit rate 45.0%
DWC hit rate 54.7%
DWC - LRU hit rate delta 9.6%
DWC / LRU hit rate ratio 121%

GLI 2,000
LRU hit rate 57.4%
DWC hit rate 57.4%
DWC - LRU hit rate delta 0.0%
DWC / LRU hit rate ratio 100%
```

```
LOOP 100
LRU hit rate 0.0%
DWC hit rate 4.9%
DWC - LRU hit rate delta 4.9%
DWC / LRU hit rate ratio Infinity%

LOOP 250
LRU hit rate 0.0%
DWC hit rate 21.2%
DWC - LRU hit rate delta 21.2%
DWC / LRU hit rate ratio Infinity%

LOOP 500
LRU hit rate 0.0%
DWC hit rate 44.5%
DWC - LRU hit rate delta 44.5%
DWC / LRU hit rate ratio Infinity%

LOOP 750
LRU hit rate 0.0%
DWC hit rate 70.4%
DWC - LRU hit rate delta 70.4%
DWC / LRU hit rate ratio Infinity%

LOOP 1,000
LRU hit rate 0.0%
DWC hit rate 94.8%
DWC - LRU hit rate delta 94.8%
DWC / LRU hit rate ratio Infinity%

LOOP 1,250
LRU hit rate 99.8%
DWC hit rate 99.8%
DWC - LRU hit rate delta 0.0%
DWC / LRU hit rate ratio 100%
```

https://github.com/dgraph-io/ristretto<br>
https://github.com/dgraph-io/benchmarks

### Throughput

#### Comparison with [lru-cache](https://www.npmjs.com/package/lru-cache)@6 (basic implementation using a linked list).

Equivalent.

```
'LRUCache simulation 100 x 4,408,911 ops/sec ±0.50% (67 runs sampled)'

'DW-Cache simulation 100 x 4,068,709 ops/sec ±0.35% (65 runs sampled)'

'LRUCache simulation 1,000 x 4,011,794 ops/sec ±0.35% (66 runs sampled)'

'DW-Cache simulation 1,000 x 4,099,809 ops/sec ±0.35% (68 runs sampled)'

'LRUCache simulation 10,000 x 2,619,249 ops/sec ±2.96% (62 runs sampled)'

'DW-Cache simulation 10,000 x 2,834,672 ops/sec ±3.40% (61 runs sampled)'

'LRUCache simulation 100,000 x 1,392,207 ops/sec ±3.19% (58 runs sampled)'

'DW-Cache simulation 100,000 x 1,366,786 ops/sec ±6.48% (54 runs sampled)'

'LRUCache simulation 1,000,000 x 830,577 ops/sec ±7.29% (55 runs sampled)'

'DW-Cache simulation 1,000,000 x 788,118 ops/sec ±6.14% (58 runs sampled)'
```

https://github.com/falsandtru/spica/runs/5132776032

#### Comparison with [lru-cache](https://www.npmjs.com/package/lru-cache)@7 (optimized implementation using an indexed list).

About 50% throughput.

```
'LRUCache simulation 100 x 7,864,193 ops/sec ±0.44% (67 runs sampled)'

'DW-Cache simulation 100 x 4,833,508 ops/sec ±0.32% (68 runs sampled)'

'LRUCache simulation 1,000 x 7,407,931 ops/sec ±0.46% (66 runs sampled)'

'DW-Cache simulation 1,000 x 4,204,219 ops/sec ±0.33% (63 runs sampled)'

'LRUCache simulation 10,000 x 6,872,077 ops/sec ±1.96% (62 runs sampled)'

'DW-Cache simulation 10,000 x 3,734,782 ops/sec ±1.99% (62 runs sampled)'

'LRUCache simulation 100,000 x 3,004,533 ops/sec ±1.48% (57 runs sampled)'

'DW-Cache simulation 100,000 x 1,531,634 ops/sec ±2.91% (59 runs sampled)'

'LRUCache simulation 1,000,000 x 1,738,064 ops/sec ±3.55% (52 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,003,836 ops/sec ±7.02% (52 runs sampled)'
```

https://github.com/falsandtru/spica/runs/7560221542

## API

```ts
export namespace Cache {
  export interface Options<K, V = undefined> {
    readonly window?: number;
    readonly capacity?: number;
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
    readonly block?: number;
    readonly sweep?: number;
    readonly limit?: number;
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
