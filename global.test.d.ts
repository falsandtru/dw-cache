import assert from 'power-assert';
import 'spica/module.test';

declare namespace NS {
  export {
    assert,
  }
}

declare global {
  const assert: typeof NS.assert;
}
