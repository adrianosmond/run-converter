<template>
  <div id="app">
    <h1>Run Converter</h1>
    <shaded-section ref="km">
      <pace
        title="Metric"
        unit="km"
        :pace="pacePerKm"
        :modify-pace="modifySpeedKm"
      ></pace>
    </shaded-section>
    <shaded-section ref="mile">
      <pace
        title="Imperial"
        unit="mile"
        :pace="pacePerMile"
        :modify-pace="modifySpeedMiles"
      ></pace>
    </shaded-section>
    <shaded-section>
      <time-table :speed="speed"></time-table>
    </shaded-section>
  </div>
</template>

<script>
import ShadedSection from "@/components/ShadedSection.vue";
import Pace from "@/components/Pace.vue";
import TimeTable from "@/components/TimeTable.vue";

const DRAG_DEFAULTS = {
  changing: undefined,
  touchY: undefined,
  diffSinceChange: 0
};
const MOVE_THRESHOLD = 3;
const KM_CONST = 60000;
const MI_CONST = 96561;

export default {
  name: "App",
  components: {
    ShadedSection,
    Pace,
    TimeTable
  },
  data() {
    return {
      speed: 12000,
      lastDiff: 0,
      ...DRAG_DEFAULTS
    };
  },
  computed: {
    pacePerKm() {
      return this.roundPace(KM_CONST / this.speed);
    },
    pacePerMile() {
      return this.roundPace(MI_CONST / this.speed);
    }
  },
  methods: {
    roundPace(pace) {
      const mins = Math.floor(pace);
      const secs = Math.round((pace - mins) * 60);
      if (secs > 59) {
        return Math.round(pace);
      }
      return mins + secs / 60;
    },
    modifySpeedKm(count) {
      this.speed = KM_CONST / (this.pacePerKm + count / 60);
      this.keepSpeedInBounds();
    },
    modifySpeedMiles(count) {
      this.speed = MI_CONST / (this.pacePerMile + count / 60);
      this.keepSpeedInBounds();
    },
    keepSpeedInBounds() {
      this.speed = Math.min(this.speed, 30000);
      this.speed = Math.max(this.speed, 4000);
    },
    preventBodyScroll(e) {
      e.preventDefault();
    },
    onTouchStart(e) {
      this.touchY = e.changedTouches[0].pageY;
      const key = Object.entries(this.$refs).find(([, el]) =>
        el.contains(e.target)
      )[0];
      this.changing = key;
    },
    onTouchMove(e) {
      e.preventDefault();
      const newY = e.changedTouches[0].pageY;
      this.lastDiff = newY - this.touchY;
      this.touchY = newY;
      this.diffSinceChange += this.lastDiff;
      if (Math.abs(this.diffSinceChange) > MOVE_THRESHOLD) {
        const d = Math.trunc(this.diffSinceChange / MOVE_THRESHOLD);
        this.diffSinceChange -= d * MOVE_THRESHOLD;
        if (this.changing === "km") {
          this.modifySpeedKm(d);
        } else if (this.changing === "mile") {
          this.modifySpeedMiles(d);
        }
      }
    },
    onTouchEnd() {
      if (Math.abs(this.lastDiff) > MOVE_THRESHOLD) {
        if (this.changing === "km") {
          this.kineticEffect(this.modifySpeedKm);
        }
        if (this.changing === "mile") {
          this.kineticEffect(this.modifySpeedMiles);
        }
      }
      Object.entries(DRAG_DEFAULTS).forEach(([key, val]) => {
        this[key] = val;
      });
    },
    kineticEffect(modifyFn) {
      this.lastDiff *= 0.9;
      const absDiff = Math.abs(this.lastDiff);

      if (absDiff > 1) {
        modifyFn(this.lastDiff);
        window.setTimeout(() => {
          this.kineticEffect(modifyFn);
        }, 150 / absDiff);
      } else {
        window.setTimeout(() => {
          modifyFn(this.lastDiff < 0 ? -1 : 1);
        }, 50);
      }
    }
  },
  mounted() {
    Object.values(this.$refs).forEach(el => {
      el.addEventListener("touchstart", this.onTouchStart);
      el.addEventListener("touchmove", this.onTouchMove);
      el.addEventListener("touchend", this.onTouchEnd);
    });
  },
  beforeDestroy() {
    Object.values(this.$refs).forEach(el => {
      el.removeEventListener("touchstart", this.onTouchStart);
      el.removeEventListener("touchmove", this.onTouchMove);
      el.removeEventListener("touchend", this.onTouchEnd);
    });
  }
};
</script>

<style>
:root {
  --bp-small: 640px;

  --bg-grad-blue: rgb(155, 228, 255);
  --bg-grad-green: rgb(81, 185, 86);

  --white: #ffffff;
  --white--30: rgba(255, 255, 255, 0.3);

  --black: #000000;
  --black--50: rgba(0, 0, 0, 0.5);
  --black--30: rgba(0, 0, 0, 0.3);
  --black--10: rgba(0, 0, 0, 0.1);
}

html {
  font-size: 1.5rem;
  box-sizing: border-box;
  height: 100%;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

body {
  margin: 0;
  padding: 0.8333333rem;
  line-height: 1;
  background: linear-gradient(
    136deg,
    var(--bg-grad-blue),
    var(--bg-grad-green)
  );
  color: var(--white);
  font-family: "Open Sans", Arial, sans-serif;
  font-weight: 300;
  letter-spacing: -0.05em;
}

h1,
h2 {
  margin: 0;
  font-weight: 300;
}

h1 {
  font-size: 1.5rem;
  color: var(--black--50);
}
</style>
