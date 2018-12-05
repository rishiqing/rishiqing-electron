const Vue = require('vue');

const template = `
  <div class="section restore-setting">
    <div class="content">
      <button @click="onClick" title="恢复默认设置">恢复设置</button>
    </div>
  </div>
`;

Vue.component('r-restore', {
  template,
  methods: {
    onClick() {
      this.$emit('restore');
    }
  }
})