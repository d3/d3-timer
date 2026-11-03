// now() caches the current time until the next frame (setTimeout 17ms in
// Node), so wait for any time cached by a previous test to be cleared.
export const mochaHooks = {
  beforeEach(done) {
    setTimeout(done, 20);
  }
};
