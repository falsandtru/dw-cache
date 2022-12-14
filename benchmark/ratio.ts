import { Cache } from '../index';
import { LRU } from 'spica/lru';
//import { ARC } from './arc';
import { memoize } from 'spica/memoize';
import { wait } from 'spica/timer';

describe('Benchmark: Package', async function () {
  await wait(3000);

  class Stats {
    total = 0;
    lru = 0;
    arc = 0;
    dwc = 0;
    clear() {
      this.total = 0;
      this.lru = 0;
      this.arc = 0;
      this.dwc = 0;
    }
  }
  async function run(label: string, source: string, capacity: number) {
    const keys = await parse(source);
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>(capacity);
    //const arc = new ARC<number, 1>(capacity);
    const stats = new Stats();
    //for (let i = 0; i < capacity; ++i) {
    //  //arc.set(-i, 1);
    //  //arc.set(-i - 1 % capacity, 1);
    //  //arc.get(-i);
    //  dwc.set(-i, 1);
    //  dwc.set(-i - 1 % capacity, 1);
    //  dwc.get(-i);
    //}
    //for (const { key } of dwc['LFU']) {
    //  //arc.get(key);
    //  dwc.get(key);
    //}
    //for (let i = 0; i < keys.length; ++i) {
    //  const key = keys[i];
    //  ++stats.total;
    //  stats.lru += lru.get(key) ?? (lru.set(key, 1), 0);
    //  //stats.arc += arc.get(key) ?? (arc.set(key, 1), 0);
    //  stats.dwc += dwc.get(key) ?? (dwc.set(key, 1), 0);
    //}
    //print(`${label} ${capacity.toLocaleString('en')}`, stats, dwc);
    //stats.clear();

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      ++stats.total;
      stats.lru += lru.get(key) ?? (lru.set(key, 1), 0);
      //stats.arc += arc.get(key) ?? (arc.set(key, 1), 0);
      stats.dwc += dwc.get(key) ?? (dwc.set(key, 1), 0);
    }
    print(`${label} ${capacity.toLocaleString('en')}`, stats, dwc);
  }
  const parse = memoize(async function (source: string): Promise<readonly number[]> {
    const data = await (await fetch(source)).text();
    const acc = [];
    for (let i = 0; i < data.length; i = data.indexOf('\n', i + 1) + 1 || data.length) {
      const line = data.slice(i, data.indexOf('\n', i)).trim();
      const fields = line.includes(',')
        ? line.split(',').slice(1, 4)
        : line.split(/\s/).slice(0, 2);
      if (fields.length === 0) break;
      const key = +fields[0];
      const cnt = line.includes(',')
        ? fields[2].toLowerCase() === 'r' ? Math.ceil(+fields[1] / 512) : 0
        : +fields[1] || 1;
      for (let i = 0; i < cnt; ++i) {
        acc.push(key + i);
      }
    }
    return acc;
  });
  function print(label: string, stats: Stats, dwc: Cache<unknown, unknown>): void {
    console.log(label);
    console.log('LRU hit ratio', `${format(stats.lru * 100 / stats.total, 2)}%`);
    //console.log('ARC hit ratio', `${format(stats.arc * 100 / stats.total, 2)}%`);
    console.log('DWC hit ratio', `${format(stats.dwc * 100 / stats.total, 2)}%`);
    console.log('DWC - LRU hit ratio delta', `${format((stats.dwc - stats.lru) * 100 / stats.total, 2)}%`);
    console.log('DWC / LRU hit ratio rate ', `${format(stats.dwc / stats.lru * 100, 0)}%`);
    console.log('DWC ratio', dwc['partition']! * 100 / dwc.length | 0, dwc['LFU'].length * 100 / dwc.length | 0);
    console.log('DWC overlap', dwc['overlapLFU'] / dwc['LRU'].length * 100 | 0, dwc['overlapLRU'] / dwc['LFU'].length * 100 | 0);
    console.log('');
  }
  function format(n: number, u: number): string {
    return `${n}`.replace(/(\.\d+)?$/, s => u ? `.${s.slice(1, 1 + u).padEnd(u, '0')}` : '');
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

  for (const capacity of [2500, 5000, 7500, 10000, 12500, 15000, 17500, 20000]) {
    await run(`F1`, '/base/benchmark/trace/Financial1.spc', capacity);
  }

  for (const capacity of [1e5, 2e5, 3e5, 4e5, 5e5, 6e5, 7e5, 8e5]) {
    await run(`S3`, '/base/benchmark/trace/s3.arc', capacity);
  }

  for (const capacity of [1e6, 2e6, 3e6, 4e6, 5e6, 6e6, 7e6, 8e6]) {
    await run(`DS1`, '/base/benchmark/trace/ds1.arc', capacity);
  }

  for (const capacity of [1e6, 2e6, 3e6, 4e6, 5e6, 6e6, 7e6, 8e6]) {
    await run(`WS1`, '/base/benchmark/trace/WebSearch1.spc', capacity);
  }

});
