import {Timer, now} from "./timer";

export default function(callback, delay, time) {
  var t = new Timer, d = delay;
  if (delay == null) return t.restart(callback, delay, time), t;
  delay = +delay, time = time == null ? now() : +time;
  t.restart(function tick(elapsed) {
    t.restart(tick, d += delay, time);
    callback(elapsed - delay + d);
  }, d, time);
  return t;
}
