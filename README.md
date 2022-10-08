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
DWC hit rate 18.2%
DWC - LRU hit rate delta 1.8%
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
DWC hit rate 10.5%
DWC - LRU hit rate delta 9.6%
DWC / LRU hit rate ratio 1135%

GLI 500
LRU hit rate 0.9%
DWC hit rate 24.5%
DWC - LRU hit rate delta 23.5%
DWC / LRU hit rate ratio 2546%

GLI 750
LRU hit rate 1.1%
DWC hit rate 41.6%
DWC - LRU hit rate delta 40.5%
DWC / LRU hit rate ratio 3582%

GLI 1,000
LRU hit rate 11.2%
DWC hit rate 46.0%
DWC - LRU hit rate delta 34.8%
DWC / LRU hit rate ratio 410%

GLI 1,250
LRU hit rate 21.2%
DWC hit rate 52.1%
DWC - LRU hit rate delta 30.9%
DWC / LRU hit rate ratio 245%

GLI 1,500
LRU hit rate 36.5%
DWC hit rate 54.1%
DWC - LRU hit rate delta 17.6%
DWC / LRU hit rate ratio 148%

GLI 1,750
LRU hit rate 45.0%
DWC hit rate 54.4%
DWC - LRU hit rate delta 9.4%
DWC / LRU hit rate ratio 120%

GLI 2,000
LRU hit rate 57.4%
DWC hit rate 57.4%
DWC - LRU hit rate delta 0.0%
DWC / LRU hit rate ratio 100%
```

```
LOOP 100
LRU hit rate 0.0%
DWC hit rate 9.6%
DWC - LRU hit rate delta 9.6%
DWC / LRU hit rate ratio Infinity%

LOOP 250
LRU hit rate 0.0%
DWC hit rate 24.0%
DWC - LRU hit rate delta 24.0%
DWC / LRU hit rate ratio Infinity%

LOOP 500
LRU hit rate 0.0%
DWC hit rate 48.7%
DWC - LRU hit rate delta 48.7%
DWC / LRU hit rate ratio Infinity%

LOOP 750
LRU hit rate 0.0%
DWC hit rate 73.4%
DWC - LRU hit rate delta 73.4%
DWC / LRU hit rate ratio Infinity%

LOOP 1,000
LRU hit rate 0.0%
DWC hit rate 98.5%
DWC - LRU hit rate delta 98.5%
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

70-90% of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 7,645,008 ops/sec ±2.39% (117 runs sampled)'

'DW-Cache simulation 100 x 6,197,392 ops/sec ±2.36% (120 runs sampled)'

'LRUCache simulation 1,000 x 6,715,408 ops/sec ±2.65% (115 runs sampled)'

'DW-Cache simulation 1,000 x 6,563,279 ops/sec ±2.54% (117 runs sampled)'

'LRUCache simulation 10,000 x 6,308,729 ops/sec ±2.55% (117 runs sampled)'

'DW-Cache simulation 10,000 x 5,926,108 ops/sec ±2.35% (119 runs sampled)'

'LRUCache simulation 100,000 x 3,572,099 ops/sec ±2.18% (110 runs sampled)'

'DW-Cache simulation 100,000 x 3,032,548 ops/sec ±2.37% (112 runs sampled)'

'LRUCache simulation 1,000,000 x 1,737,940 ops/sec ±4.75% (98 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,229,843 ops/sec ±6.62% (111 runs sampled)'

'LRUCache simulation 10,000,000 x 1,774,905 ops/sec ±3.37% (104 runs sampled)'

'DW-Cache simulation 10,000,000 x 1,102,449 ops/sec ±2.39% (119 runs sampled)'
```

https://github.com/falsandtru/spica/actions/runs/3209968465/jobs/5247151674

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
