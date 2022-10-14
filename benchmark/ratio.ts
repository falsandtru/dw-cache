import { Cache } from '../index';
import LRU from 'lru-cache';

describe('Benchmark: Package', async function () {
  const load = async (src: string) => (await fetch(src)).text();
  const WL = {
    LOOP: await load('/base/benchmark/trace/loop.trc'),
    GLI: await load('/base/benchmark/trace/gli.trc'),
    OLTP: await load('/base/benchmark/trace/oltp.arc'),
    DS1: await load('/base/benchmark/trace/ds1.arc'),
    S3: await load('/base/benchmark/trace/s3.arc'),
  } as const;

  function* parse(data: string): Iterable<number> {
    for (let i = 0; i < data.length; i = data.indexOf('\n', i + 1) + 1 || data.length) {
      const fields = data.slice(i, data.indexOf('\n', i)).trim().split(/\s/).slice(0, 2);
      if (fields.length === 0) break;
      const key = +fields[0];
      const cnt = +fields[1] || 1;
      for (let i = 0; i < cnt; ++i) {
        yield key + i;
      }
    }
  }
  function print(label: string, stats: { count: number; dwc: number; lru: number; }): void {
    console.log(label);
    console.log('LRU hit ratio', `${format(stats.lru * 100 / stats.count, 1)}%`);
    console.log('DWC hit ratio', `${format(stats.dwc * 100 / stats.count, 1)}%`);
    console.log('DWC - LRU hit ratio delta', `${format((stats.dwc - stats.lru) * 100 / stats.count, 1)}%`);
    console.log('DWC / LRU hit ratio rate ', `${format(stats.dwc / stats.lru * 100, 0)}%`);
    console.log('');
  }
  function format(n: number, u: number): string {
    return `${n}`.replace(/(\.\d+)?$/, s => u ? `.${s.slice(1, 1 + u).padEnd(u, '0')}` : '');
  }

  for (const capacity of [100, 250, 500, 750, 1000, 1250]) {
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const stats = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (const key of parse(WL.LOOP)) {
      ++stats.count;
      stats.dwc += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
    }
    print(`LOOP ${capacity.toLocaleString('en')}`, stats);
  }

  for (const capacity of [250, 500, 750, 1000, 1250, 1500, 1750, 2000]) {
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const stats = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (const key of parse(WL.GLI)) {
      ++stats.count;
      stats.dwc += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
    }
    print(`GLI ${capacity.toLocaleString('en')}`, stats);
  }

  for (const capacity of [250, 500, 750, 1000, 1250, 1500, 1750, 2000]) {
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const stats = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (const key of parse(WL.OLTP)) {
      ++stats.count;
      stats.dwc += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
    }
    print(`OLTP ${capacity.toLocaleString('en')}`, stats);
  }

  for (const capacity of [...Array(8)].map((_, i) => ++i * 1000000)) {
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const stats = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (const key of parse(WL.DS1)) {
      ++stats.count;
      stats.dwc += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
    }
    print(`DS1 ${capacity.toLocaleString('en')}`, stats);
  }

  for (const capacity of [...Array(8)].map((_, i) => ++i * 100000)) {
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const stats = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (const key of parse(WL.S3)) {
      ++stats.count;
      stats.dwc += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      stats.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
    }
    print(`S3 ${capacity.toLocaleString('en')}`, stats);
  }

});
