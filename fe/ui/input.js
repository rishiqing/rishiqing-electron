const Vue = require('vue')

const template = `
  <div :class="['r-input', { 'r-input-has-append': hasAppend }]">
    <input
      type="text"
      :readonly="readonly"
      :placeholder="placeholder"
      v-model="defaultInput"
      @keydown="onKeyDown"
      @change="onChange($event.target.value)"
    ></input>
    <div class="r-input-append" v-if="hasAppend" @click="onAppendclick">
      <slot name="append"></slot>
    </div>
  </div>
`;

const CharCodeMap = {
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: '\'',
  186: ';',
  188: ',',
  190: '.',
  191: '/',
  37: 'Left',
  38: 'Up',
  39: 'Right',
  40: 'Down',
}

function fromCharCode(code) {
  const char = String.fromCharCode(code);
  if (/[a-z]|[0-9]/i.test(char)) {
    return char.toUpperCase();
  } else if (CharCodeMap[code]) {
    return CharCodeMap[code];
  }
}

Vue.component('r-input', {
  model: {
    prop: 'input',
    event: 'change'
  },
  props: {
    input: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    hotkeyMode: { // 快捷键模式
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultInput: this.input,
    };
  },
  computed: {
    // 是否有append
    hasAppend() {
      if (this.$slots.append) return true
      else return false
    }
  },
  template,
  methods: {
    onAppendclick() {
      this.$emit('appendClick');
    },
    onChange(value){
      this.$emit('change', value);
    },
    onKeyDown(e) {
      if (this.hotkeyMode) {
        e.preventDefault();
        if (e.key === 'Dead') return;
        const char = fromCharCode(e.keyCode);
        if (!char) return;
        const fnKeys = [];
        if (e.metaKey) {
          if (process.platform === 'darwin') {
            fnKeys.push('Command');
          } else {
            fnKeys.push('Super');
          }
        }
        if (e.ctrlKey) {
          fnKeys.push('Ctrl');
        }
        if (e.altKey) {
          if (process.platform === 'darwin') {
            fnKeys.push('Option');
          } else {
            fnKeys.push('Alt');
          }
        }
        if (e.shiftKey) {
          fnKeys.push('Shift');
        }
        if (fnKeys.length) {
          this.defaultInput = [...fnKeys, char].join('+');
          this.$emit('change', this.defaultInput)
        }
      }
    }
  },
  mounted() {
    this.$watch('input', function(newVal) {
      this.defaultInput = newVal;
    })
  }
})