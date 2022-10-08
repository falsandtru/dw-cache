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

75-95% of [lru-cache](https://www.npmjs.com/package/lru-cache).

```
'LRUCache simulation 100 x 7,888,492 ops/sec ±1.84% (120 runs sampled)'

'DW-Cache simulation 100 x 7,618,681 ops/sec ±1.79% (121 runs sampled)'

'LRUCache simulation 1,000 x 7,288,355 ops/sec ±1.94% (118 runs sampled)'

'DW-Cache simulation 1,000 x 7,023,296 ops/sec ±1.75% (121 runs sampled)'

'LRUCache simulation 10,000 x 6,555,185 ops/sec ±1.91% (120 runs sampled)'

'DW-Cache simulation 10,000 x 6,112,268 ops/sec ±1.46% (122 runs sampled)'

'LRUCache simulation 100,000 x 3,075,301 ops/sec ±1.49% (111 runs sampled)'

'DW-Cache simulation 100,000 x 2,149,032 ops/sec ±1.54% (114 runs sampled)'

'LRUCache simulation 1,000,000 x 1,654,276 ops/sec ±2.63% (101 runs sampled)'

'DW-Cache simulation 1,000,000 x 1,264,237 ops/sec ±2.03% (117 runs sampled)'
```

https://github.com/falsandtru/spica/actions/runs/3211226103/jobs/5249262213

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
