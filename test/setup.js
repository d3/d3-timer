const setTimeout0 = setTimeout;

export const mochaHooks = {
  // now() caches the current time until the next frame (setTimeout 17ms in
  // Node), so wait for any time cached by a previous test to be cleared.
  beforeEach(done) {
    setTimeout0(done, 20);
  },
  // Some tests replace the global setTimeout; restore it even if they fail.
  afterEach() {
    setTimeout = setTimeout0;
  }
};
