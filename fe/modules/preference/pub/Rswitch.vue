<template>
  <div class="r-switch">
    <input type="checkbox" v-model="checked" @change="onChange($event.target.checked)" />
  <span class="r-switch-track"></span>
</div>
</template>

<script>
export default {
  name: "rswitch",
  model: {
    prop: 'defaultChecked',
    event: 'change'
  },
  props: {
    defaultChecked: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    checked: {
      get() {
        return this.defaultChecked
      },
      set() {}
    }
  },
  methods: {
    onChange: function(value) {
      this.$emit('change', value)
    }
  },
}
</script>

<style scoped>
.r-switch {
  display: inline-flex;
  width: 29px;
  height: 18px;
  border-radius: 16px;
  position: relative;
}
.r-switch input {
  height: 100%;
  width: 100%;
  margin: 0;
  opacity: 0;
  position: absolute;
}
.r-switch .r-switch-track {
  display: inline-block;
  width: 100%;
  height: 100%;
  background-color: #ddd;
  border-radius: 16px;
  transition: all 0.2s ease;
  padding: 1px 0;
  padding-left: 1px;
}
.r-switch .r-switch-track:before {
  content: "";
  display: block;
  width: 16px;
  height: 16px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.05);
}
.r-switch input:checked + .r-switch-track {
  padding-left: 12px;
  background-color: #66c850;
}
</style>