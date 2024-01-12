<script setup lang="ts">
import { computed, useSlots } from 'vue'

defineOptions({
  name: 'RInput',
})

const defaultInput = defineModel<string>()

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false,
  },
  hotkeyMode: {
    // 快捷键模式
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['appendClick'])
const hasAppend = computed(() => useSlots().append)

const CharCodeMap: {
  [code: string]: string
} = {
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: "'",
  186: ';',
  188: ',',
  190: '.',
  191: '/',
  37: 'Left',
  38: 'Up',
  39: 'Right',
  40: 'Down',
}

const fromCharCode = (code: number) => {
  const char = String.fromCharCode(code)
  const codeString = String(code)
  if (/[a-z]|[0-9]/i.test(char)) {
    return char.toUpperCase()
  } else if (CharCodeMap[codeString]) {
    return CharCodeMap[codeString]
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  if (props.hotkeyMode) {
    e.preventDefault()
    if (e.key === 'Dead') return
    const char = fromCharCode(e.keyCode)
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
      defaultInput.value = [...fnKeys, char].join('+')
    }
  }
}

const onAppendClick = () => {
  emit('appendClick')
}
</script>

<template>
  <div :class="['r-input', { 'r-input-has-append': hasAppend }]">
    <input
      type="text"
      :readonly="readonly"
      :placeholder="placeholder"
      v-model="defaultInput"
      @keydown="onKeyDown"
    />
    <div class="r-input-append" v-if="hasAppend" @click="onAppendClick">
      <slot name="append"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.r-input {
  width: 180px;
  display: inline-flex;
  height: 30px;
  overflow: hidden;

  > input {
    flex: 1 0 auto;
    border: 1px solid #DDDDDD;
    border-radius: 15px;
    padding-left: 15px;
    outline: none;
    width: 40px;
    font-size: 12px;

    &[readonly] {
      background-color: #f7f7f7;
      cursor: default;
    }
  }

  &.r-input-has-append > input {
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .r-input-append {
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

    &:hover {
      opacity: 0.8;
    }
  }
}

</style>
