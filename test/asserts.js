import {assert} from "vitest";

export function assertInRange(actual, expectedMin, expectedMax) {
  assert(expectedMin <= actual && actual <= expectedMax,
    `${actual} should be in range of [${expectedMin}, ${expectedMax}]`
  );
}
