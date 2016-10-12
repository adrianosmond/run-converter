var app;

var ratio = 1.609344;

function addLeadingZero(number) {
	if (number < 10) {
		return "0" + number;
	} else {
		return "" + number;
	}
}

function makeTime (time) {
	var hours = time > 60 ? "" + Math.floor(time / 60) + ":" : "";
	var mins = time > 60 ? Math.floor(time - (Math.floor(time / 60) * 60)) : Math.floor(time);
	mins = addLeadingZero(mins) + ":";
	var secs = addLeadingZero(Math.round((time - Math.floor(time)) * 60));

	return hours + mins + secs;
}

function fractionToSeconds (fraction) {
	return Math.floor(fraction * 60);
}

document.addEventListener("DOMContentLoaded", function () {
	app = new Vue({
		el: "#app",
		data: {
			paceKmMins: 5,
			paceKmSecs: 0,
			minPaceKmMins: 2,
			minPaceKmSecs: 0,
			maxPaceKmMins: 15,
			maxPaceKmSecs: 0,
			paceMiMins: 8,
			paceMiSecs: 2,
			maxPaceMiMins: 24,
			maxPaceMiSecs: 9,
			minPaceMiMins: 3,
			minPaceMiSecs: 13
		},
		methods: {
			increaseSpeedKm: function (diff) {
				if (this.paceKmSecs - diff >= 0) {
					this.paceKmSecs -= diff;
				} else {
					this.paceKmMins--;
					this.paceKmSecs = (this.paceKmSecs - diff + 60);
				}
				if (this.paceKmMins < this.minPaceKmMins || this.paceKmMins === this.minPaceKmMins && this.paceKmSecs < this.minPaceKmSecs) {
					this.paceKmMins = this.minPaceKmMins;
					this.paceKmSecs = this.minPaceKmSecs;
				}
				this.updatePaceMi();
			},
			decreaseSpeedKm: function (diff) {
				if (this.paceKmSecs + diff <= 59) {
					this.paceKmSecs += diff;
				} else {
					this.paceKmMins++;
					this.paceKmSecs = (this.paceKmSecs + diff - 60);
				}
				if (this.paceKmMins === this.maxPaceKmMins && this.paceKmSecs >= this.maxPaceKmSecs) {
					this.paceKmSecs = this.maxPaceKmSecs;
				}
				this.updatePaceMi();
			},
			updatePaceMi: function () {
				var speedKm = (60 / (this.paceKmMins + (this.paceKmSecs / 60)));
				var speedMi = speedKm / ratio;
				this.paceMiMins = Math.floor(60 / speedMi);
				var secs = (60 / speedMi) - this.paceMiMins;
				this.paceMiSecs = Math.round(fractionToSeconds(secs));
			},
			increaseSpeedMi: function (diff) {
				if (this.paceMiSecs - diff >= 0) {
					this.paceMiSecs -= diff;
				} else {
					this.paceMiMins--;
					this.paceMiSecs = (this.paceMiSecs - diff + 60);
				}
				if (this.paceMiMins <= this.minPaceMiMins && this.paceMiSecs <= this.minPaceMiSecs) {
					this.paceMiSecs = this.minPaceMiSecs;
				}
				this.updatePaceKm();
			},
			decreaseSpeedMi: function (diff) {
				if (this.paceMiSecs + diff <= 59) {
					this.paceMiSecs += diff;
				} else {
					this.paceMiMins++;
					this.paceMiSecs = (this.paceMiSecs + diff - 60);
				}
				if (this.paceMiMins === this.maxPaceMiMins && this.paceMiSecs >= this.maxPaceMiSecs) {
					this.paceMiSecs = this.maxPaceMiSecs;
				}
				this.updatePaceKm();
			},
			updatePaceKm: function () {
				var speedMi = (60 / (this.paceMiMins + (this.paceMiSecs / 60)));
				var speedKm = speedMi * ratio;
				this.paceKmMins = Math.floor(60 / speedKm);
				var secs = (60 / speedKm) - this.paceKmMins;
				this.paceKmSecs = Math.ceil(fractionToSeconds(secs));
			}
		},
		computed: {
			paceKmMinsStr: function () {
				return addLeadingZero(this.paceKmMins);
			},
			paceKmSecsStr: function () {
				return addLeadingZero(this.paceKmSecs);
			},
			paceMiMinsStr: function () {
				return addLeadingZero(this.paceMiMins);
			},
			paceMiSecsStr: function () {
				return addLeadingZero(this.paceMiSecs);
			},
			time5k: function () {
				return makeTime(5 * (this.paceKmMins + (this.paceKmSecs / 60)));
			},
			time10k: function () {
				return makeTime(10 * (this.paceKmMins + (this.paceKmSecs / 60)));
			},
			timeHalfMarathon: function () {
				return makeTime(21.0975 * (this.paceKmMins + (this.paceKmSecs / 60)));
			},
			timeMarathon: function () {
				return makeTime(42.195 * (this.paceKmMins + (this.paceKmSecs / 60)));
			}
		}
	});

	Array.from(document.querySelectorAll(".pace-section")).forEach(function (el) {
		var lastY;
		var diffSinceUpdate = 0;
		var threshold = 3;
		var increaseFn;
		var decreaseFn;

		el.addEventListener("touchstart", function (e) {
			lastY = e.changedTouches[ 0 ].pageY;
			if (this.dataset.unit === "km") {
				increaseFn = app.increaseSpeedKm;
				decreaseFn = app.decreaseSpeedKm;
			} else if (this.dataset.unit === "mi") {
				increaseFn = app.increaseSpeedMi;
				decreaseFn = app.decreaseSpeedMi;
			}
		});

		el.addEventListener("touchmove", function (e) {
			e.preventDefault();
			var newY = e.changedTouches[ 0 ].pageY;
			var diff = newY - lastY;
			lastY =  newY;

			if (diff > 0) {
				diff = Math.ceil(diff);
				diffSinceUpdate += diff;
				if (diffSinceUpdate > threshold) {
					increaseFn(Math.floor(diffSinceUpdate / threshold));
					diffSinceUpdate = 0;
				}
			} else if (diff < 0) {
				diff *= -1;
				diff = Math.ceil(diff);
				diffSinceUpdate -= diff;
				if (diffSinceUpdate < -threshold) {
					decreaseFn(Math.floor(diffSinceUpdate / -threshold));
					diffSinceUpdate = 0;
				}
			}
		});

		document.addEventListener("touchmove", function (e) {
			e.preventDefault();
		});

		el.addEventListener("touchend", function (e) {
			lastY = undefined;
			increaseFn = undefined;
			decreaseFn = undefined;
			diffSinceUpdate = 0;
		});
	});
});
