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
| LRU     |   1x   |  1  |               |               |
| DWC     |   1x   |  2  |       ✓       |       ✓      |
| ARC     |   2x   |  4  |       ✓       |               |
| LIRS    | 3-2500x|  2  |       ✓       |       ✓      |

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
DWC hit rate 18.1%
DWC - LRU hit rate delta 1.6%
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
DWC hit rate 11.9%
DWC - LRU hit rate delta 10.9%
DWC / LRU hit rate ratio 1278%

GLI 500
LRU hit rate 0.9%
DWC hit rate 24.8%
DWC - LRU hit rate delta 23.8%
DWC / LRU hit rate ratio 2574%

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

About 60-80% throughput.

```
'LRUCache simulation 100 x 7,737,318 ops/sec ±1.85% (119 runs sampled)'

'DW-Cache simulation 100 x 6,060,826 ops/sec ±1.92% (122 runs sampled)'

'LRUCache simulation 1,000 x 6,989,810 ops/sec ±1.99% (118 runs sampled)'

'DW-Cache simulation 1,000 x 5,425,982 ops/sec ±2.13% (121 runs sampled)'

'LRUCache simulation 10,000 x 6,670,558 ops/sec ±1.67% (122 runs sampled)'

'DW-Cache simulation 10,000 x 4,253,639 ops/sec ±1.52% (119 runs sampled)'

'LRUCache simulation 100,000 x 4,150,865 ops/sec ±1.32% (116 runs sampled)'

'DW-Cache simulation 100,000 x 2,980,400 ops/sec ±2.17% (113 runs sampled)'

'LRUCache simulation 1,000,000 x 1,993,941 ops/sec ±3.19% (102 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,248,598 ops/sec ±4.53% (110 runs sampled)'
```

https://github.com/falsandtru/spica/actions/runs/3129806243/jobs/5079396724

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
    readonly sweep?: number;
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
