import { Cache } from '../index';
import LRU from 'lru-cache';
import { memoize } from 'spica/memoize';
import { wait } from 'spica/timer';

describe('Benchmark: Package', async function () {
  await wait(3000);

  async function run(label: string, source: string, capacity: number) {
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const stats = new Stats();
    const keys = await parse(source);
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      ++stats.total;
      stats.dwc += dwc.get(key) ?? (dwc.set(key, 1), 0);
      stats.lru += lru.get(key) ?? (lru.set(key, 1), 0);
    }
    print(`${label} ${capacity.toLocaleString('en')}`, stats);
  }
  const parse = memoize(async function (source: string): Promise<readonly number[]> {
    const data = await (await fetch(source)).text();
    const acc = [];
    for (let i = 0; i < data.length; i = data.indexOf('\n', i + 1) + 1 || data.length) {
      const fields = data.slice(i, data.indexOf('\n', i)).trim().split(/\s/).slice(0, 2);
      if (fields.length === 0) break;
      const key = +fields[0];
      const cnt = +fields[1] || 1;
      for (let i = 0; i < cnt; ++i) {
        acc.push(key + i);
      }
    }
    return acc;
  });
  function print(label: string, stats: Stats): void {
    console.log(label);
    console.log('LRU hit ratio', `${format(stats.lru * 100 / stats.total, 2)}%`);
    console.log('DWC hit ratio', `${format(stats.dwc * 100 / stats.total, 2)}%`);
    console.log('DWC - LRU hit ratio delta', `${format((stats.dwc - stats.lru) * 100 / stats.total, 2)}%`);
    console.log('DWC / LRU hit ratio rate ', `${format(stats.dwc / stats.lru * 100, 0)}%`);
    console.log('');
  }
  function format(n: number, u: number): string {
    return `${n}`.replace(/(\.\d+)?$/, s => u ? `.${s.slice(1, 1 + u).padEnd(u, '0')}` : '');
  }
  class Stats {
    total = 0;
    dwc = 0;
    lru = 0;
  }

  for (const capacity of [100, 250, 500, 750, 1000, 1250]) {
    await run(`LOOP`, '/base/benchmark/trace/loop.trc', capacity);
  }

  for (const capacity of [250, 500, 750, 1000, 1250, 1500, 1750, 2000]) {
    await run(`GLI`, '/base/benchmark/trace/gli.trc', capacity);
  }

  for (const capacity of [250, 500, 750, 1000, 1250, 1500, 1750, 2000]) {
    await run(`OLTP`, '/base/benchmark/trace/oltp.arc', capacity);
  }

  for (const capacity of [...Array(8)].map((_, i) => ++i * 1000000)) {
    await run(`DS1`, '/base/benchmark/trace/ds1.arc', capacity);
  }

  for (const capacity of [...Array(8)].map((_, i) => ++i * 100000)) {
    await run(`S3`, '/base/benchmark/trace/s3.arc', capacity);
  }

});
