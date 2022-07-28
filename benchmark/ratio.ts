import { Cache } from '../index';
import LRU from 'lru-cache';

describe('Benchmark: Package', async function () {
  const WL = {
    LOOP: await (await fetch('/base/benchmark/loop.trc')).text(),
    GLI: await (await fetch('/base/benchmark/gli.trc')).text(),
    OLTP: await (await fetch('/base/benchmark/oltp.arc')).text(),
    S3: await (await fetch('/base/benchmark/s3.arc')).text(),
  };

  for (const capacity of [100, 250, 500, 750, 1000, 1250]) {
    const data = WL.LOOP;
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const result = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (let i = 0; 0 <= i && i < data.length; i = data.indexOf('\n', i + 1) + 1) {
      ++result.count;
      const key = +data.slice(i, data.indexOf('\n', i)).trim().split(/\s/)[0];
      result.dwc += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      result.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
    }
    console.log(`LOOP ${capacity.toLocaleString('en')}`);
    console.log('LRU hit rate', result.lru * 100 / result.count);
    console.log('DWC hit rate', result.dwc * 100 / result.count);
    console.log('DWC - LRU hit rate delta', (result.dwc - result.lru) * 100 / result.count);
    console.log('DWC / LRU hit rate ratio', `${result.dwc / result.lru * 100}%`);
  }

  for (const capacity of [250, 500, 750, 1000, 1250, 1500, 1750, 2000]) {
    const data = WL.GLI;
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const result = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (let i = 0; 0 <= i && i < data.length; i = data.indexOf('\n', i + 1) + 1) {
      ++result.count;
      const key = +data.slice(i, data.indexOf('\n', i)).trim().split(/\s/)[0];
      result.dwc += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      result.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
    }
    console.log(`GLI ${capacity.toLocaleString('en')}`);
    console.log('LRU hit rate', result.lru * 100 / result.count);
    console.log('DWC hit rate', result.dwc * 100 / result.count);
    console.log('DWC - LRU hit rate delta', (result.dwc - result.lru) * 100 / result.count);
    console.log('DWC / LRU hit rate ratio', `${result.dwc / result.lru * 100}%`);
  }

  for (const capacity of [250, 500, 750, 1000, 2000]) {
    const data = WL.OLTP;
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const result = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (let i = 0; 0 <= i && i < data.length; i = data.indexOf('\n', i + 1) + 1) {
      ++result.count;
      const key = +data.slice(i, data.indexOf('\n', i)).trim().split(/\s/)[0];
      result.dwc += dwc.get(key) ?? +dwc.put(key, 1) & 0;
      result.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
    }
    console.log(`OLTP ${capacity.toLocaleString('en')}`);
    console.log('LRU hit rate', result.lru * 100 / result.count);
    console.log('DWC hit rate', result.dwc * 100 / result.count);
    console.log('DWC - LRU hit rate delta', (result.dwc - result.lru) * 100 / result.count);
    console.log('DWC / LRU hit rate ratio', `${result.dwc / result.lru * 100}%`);
  }

  for (const capacity of [100000, 400000, 800000]) {
    const data = WL.S3;
    const dwc = new Cache<number, 1>(capacity);
    const lru = new LRU<number, 1>({ max: capacity });
    const result = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (let i = 0; 0 <= i && i < data.length; i = data.indexOf('\n', i + 1) + 1) {
      ++result.count;
      const fields = data.slice(i, data.indexOf('\n', i)).trim().split(/\s/).slice(0, 2);
      const key = +fields[0];
      const cnt = +fields[1];
      for (let i = 0; i < cnt; ++i) {
        result.dwc += dwc.get(key + i) ?? +dwc.put(key + i, 1) & 0;
        result.lru += lru.get(key + i) ?? +lru.set(key + i, 1) & 0;
      }
    }
    console.log(`S3 ${capacity.toLocaleString('en')}`);
    console.log('LRU hit rate', result.lru * 100 / result.count);
    console.log('DWC hit rate', result.dwc * 100 / result.count);
    console.log('DWC - LRU hit rate delta', (result.dwc - result.lru) * 100 / result.count);
    console.log('DWC / LRU hit rate ratio', `${result.dwc / result.lru * 100}%`);
  }

});
