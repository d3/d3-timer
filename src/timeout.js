import {timer} from "./timer";

function Timeout(callback, that, delay, time) {
  this._timer = timer(this.call, this, delay, time);
  this._call = callback;
  this._that = that;
  this._delay = delay;
}

Timeout.prototype.call = function(elapsed) {
  this._timer.stop();
  this._call.call(this._that, elapsed + this._delay);
};

export default function(callback, that, delay, time) {
  if (typeof that !== "object") time = delay, delay = that, that = null;
  delay = delay == null ? 0 : +delay;
  return new Timeout(callback, that, delay, time)._timer;
}
