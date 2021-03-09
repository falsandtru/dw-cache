import { Cache } from '../../index';

describe('Interface: Package', function () {
  describe('global', function () {
    it('global', function () {
      // @ts-ignore
      assert(global['Cache'] !== Cache);
    });
  });

  describe('Cache', function () {
    it('Cache', function () {
      assert(typeof Cache === 'function');
    });
  });

});
