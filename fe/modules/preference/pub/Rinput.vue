<template>
  <div :class="['r-input', { 'r-input-has-append': hasAppend }]">
    <input
      type="text"
      :readonly="readonly"
      :placeholder="placeholder"
      v-model="defaultInput"
      @keydown="onKeyDown"
      @change="onChange($event.target.value)"
    />
    <div class="r-input-append" v-if="hasAppend" @click="onAppendclick">
      <slot name="append"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "rinput",
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
      CharCodeMap: {
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
    }
  },
  computed: {
    // 是否有append
    hasAppend() {
      if (this.$slots.append) return true
      else return false
    }
  },
  methods: {
    onAppendclick() {
      this.$emit('appendClick')
    },
    onChange(value){
      this.$emit('change', value)
    },
    onKeyDown(e) {
      if (this.hotkeyMode) {
        e.preventDefault()
        if (e.key === 'Dead') return
        const char = this.fromCharCode(e.keyCode)
        if (!char) return
        const fnKeys = []
        if (e.metaKey) {
          if (process.platform === 'darwin') {
            fnKeys.push('Command')
          } else {
            fnKeys.push('Super')
          }
        }
        if (e.ctrlKey) {
          fnKeys.push('Ctrl')
        }
        if (e.altKey) {
          if (process.platform === 'darwin') {
            fnKeys.push('Option')
          } else {
            fnKeys.push('Alt')
          }
        }
        if (e.shiftKey) {
          fnKeys.push('Shift')
        }
        if (fnKeys.length) {
          this.defaultInput = [...fnKeys, char].join('+')
          this.$emit('change', this.defaultInput)
        }
      }
    },
    fromCharCode(code) {
      const char = String.fromCharCode(code)
      if (/[a-z]|[0-9]/i.test(char)) {
        return char.toUpperCase()
      } else if (this.CharCodeMap[code]) {
        return this.CharCodeMap[code]
      }
    }
  },
  mounted() {
    this.$watch('input', (newVal) => {
      this.defaultInput = newVal
    })
  }
}
</script>

<style scoped>
.r-input {
  width: 180px;
  display: inline-flex;
  height: 30px;
  overflow: hidden;
}
.r-input > input {
  flex: 1 0 auto;
  border: 1px solid #DDDDDD;
  border-radius: 15px;
  padding-left: 15px;
  outline: none;
  width: 40px;
}
.r-input > input[readonly] {
  background-color: #f7f7f7;
  cursor: default;
}
.r-input.r-input-has-append > input {
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.r-input .r-input-append {
  width: 48px;
  background-color: #6BC859;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.r-input .r-input-append:hover {
  opacity: 0.8;
}
</style>