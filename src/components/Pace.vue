<template>
  <div class="pace">
    <h2 class="pace__heading">{{ title }}</h2>
    <div class="pace__time">
      <span class="pace__number">{{ paceMins }}</span>
      <span class="pace__divider">:</span>
      <span class="pace__number">{{ paceSecs }}</span>
      <span class="pace__units">min / {{ unit }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Pace",
  props: {
    title: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    pace: {
      type: Number,
      required: true
    },
    modifyPace: {
      type: Function,
      required: true
    }
  },
  computed: {
    paceMins() {
      return Math.floor(this.pace)
        .toString()
        .padStart(2, "0");
    },
    paceSecs() {
      return Math.round((this.pace - Math.floor(this.pace)) * 60)
        .toString()
        .padStart(2, "0");
    }
  }
};
</script>

<style scoped>
.pace {
  font-size: 0.666666rem;
  user-select: none;
}

.pace__heading {
  font-size: 0.666666rem;
  letter-spacing: 0;
  padding-bottom: 0.5em;
  margin-bottom: 0.5em;
  border-bottom: 1px solid var(--white--30);
}

.pace__time {
  display: flex;
  align-items: baseline;
}

.pace__number {
  width: 1.15em;
  font-size: 2rem;
  text-align: right;
}

.pace__divider {
  font-size: 2rem;
}

.pace__units {
  padding-left: 0.25rem;
  font-size: 0.666666rem;
  letter-spacing: 0;
}

@media (min-width: 375px) {
  .pace__time {
    margin-top: -0.35rem;
  }

  .pace__number {
    font-size: 3rem;
  }

  .pace__divider {
    font-size: 3rem;
  }
}
</style>
