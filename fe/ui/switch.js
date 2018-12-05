const Vue = require('vue')

const template = `
<div class="r-switch">
  <input type="checkbox" v-model="checked" @change="onChange($event.target.checked)" />
  <span class="r-switch-track"></span>
</div>
`;

Vue.component('r-switch', {
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
        return this.defaultChecked;
      },
      set() {}
    }
  },
  template,
  methods: {
    onChange: function(value) {
      this.$emit('change', value)
    }
  },
})