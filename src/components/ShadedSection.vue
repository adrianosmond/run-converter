<template functional>
  <section
    class="section"
    :ref="data.ref"
    :class="[data.class, data.staticClass]"
    :style="[data.style, data.staticStyle]"
    v-bind="data.attrs"
    v-on="listeners"
  >
    <slot></slot>
  </section>
</template>

<script>
export default {
  name: "ShadedSection"
};
</script>

<style scoped>
.section {
  margin-top: 0.833333rem;
  padding: 0.666666rem;
  background: linear-gradient(136deg, var(--black--30), var(--black--10));
}
</style>
