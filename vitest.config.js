import {defineConfig} from "vitest/config";

export default defineConfig({
  resolve: {alias: {"d3-timer": "src/index.js"}},
  test: {
    include: ["test/**/*-test.js"],
    setupFiles: ["test/setup.js"],
    fileParallelism: false // timing-sensitive tests
  }
});
