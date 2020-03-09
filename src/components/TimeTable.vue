<template>
  <table class="time-table">
    <tr v-for="time in times" class="time-table__row" :key="time.distance">
      <td class="time-table__cell time-table__cell--distance">
        {{ time.name }}
      </td>
      <td class="time-table__cell time-table__cell--time">{{ time.time }}</td>
    </tr>
  </table>
</template>

<script>
export default {
  name: "TimeTable",
  data() {
    return {
      distances: [
        {
          name: "5k",
          distance: 5000
        },
        {
          name: "10k",
          distance: 10000
        },
        {
          name: "Half marathon",
          distance: 21097.5
        },
        {
          name: "Marathon",
          distance: 42195
        }
      ]
    };
  },
  props: {
    speed: {
      type: Number,
      required: true
    }
  },
  computed: {
    times() {
      return this.distances.map(distance => ({
        ...distance,
        time: this.makeTimeString(this.speed, distance.distance)
      }));
    }
  },
  methods: {
    makeTimeString(speed, distance) {
      const time = distance / speed;
      const hours = Math.floor(time);
      const rest = (time - hours) * 60;
      const mins = Math.floor(rest);
      const secs = Math.round((rest - mins) * 60);
      if (hours > 0) {
        return `${hours}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
  }
};
</script>

<style scoped>
.time-table {
  width: 100%;
  border-collapse: collapse;
}

.time-table__row {
  border-bottom: 1px solid var(--white--30);
}

.time-table__row:first-child .time-table__cell {
  padding-top: 0;
}

.time-table__row:last-child {
  border-bottom: 0;
}

.time-table__row:last-child .time-table__cell {
  padding-bottom: 0;
}

.time-table__cell {
  padding: 0.2rem 0;
}

.time-table__cell--distance {
  font-size: 0.666666rem;
  letter-spacing: 0;
}

.time-table__cell--time {
  text-align: right;
  letter-spacing: 0;
}
</style>
