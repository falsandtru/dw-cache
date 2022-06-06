import { Array } from 'spica/global';
import { Cache } from '../index';
import LRU from 'lru-cache';

describe('Benchmark: Package', async function () {
  const WL = {
    S3: await new Promise<string>(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener("load", () => resolve(xhr.responseText));
      xhr.open("GET", "/base/benchmark/s3.arc");
      xhr.send();
    }),
  };

  for (const capacity of [100000, 400000, 800000]) {
    const data = WL.S3;
    const dwc = new Cache<string, 1>(capacity);
    const lru = new LRU<string, 1>({ max: capacity });
    const result = {
      count: 0,
      dwc: 0,
      lru: 0,
    };
    for (let i = 0; 0 <= i && i < data.length; i = data.indexOf('\n', i + 1) + 1) {
      ++result.count;
      const fields = data.slice(i, data.indexOf('\n', i)).trim().split(/\s/).slice(0, 2);
      for (const key of Array<string>(+fields[1] || 1).fill(fields[0])) {
        result.dwc += dwc.get(key) ?? +dwc.put(key, 1) & 0;
        result.lru += lru.get(key) ?? +lru.set(key, 1) & 0;
      }
    }
    console.log(`S3 ${capacity.toLocaleString('en')}`);
    console.log('LRU hit rate', result.lru * 100 / result.count);
    console.log('DWC hit rate', result.dwc * 100 / result.count);
    console.log('DWC - LRU hit rate delta', (result.dwc - result.lru) * 100 / result.count);
    console.log('DWC / LRU hit rate ratio', `${result.dwc / result.lru * 100}%`);
  }

});
