<template>
  <span>
    <span v-if="field.type === 'number' || field.type === 'string'" contenteditable="true" @keydown="keydown" @input="input">{{field.value}}</span>
    <label class="detailvalue__label" v-if="field.type === 'boolean'"><input type="checkbox"  v-model="field.value" @change="toggle()">{{field.value}}</label>
    <span>{{type()}}</span>
  </span>
</template>

<script>
export default {
  props: {
    field: {}
  },
  methods: {
    type () {
      const type = this.field.type
      if (type === 'object' && this.field.value === null) {
        return 'null'
      }
      if (type === 'boolean' || type === 'number' || type === 'string') {
        return ''
      }
      return type
    },
    input (e) {
      var value = e.target.innerText
      if (value.match(/[0-9.]+/)) {
        this.$emit('change', parseFloat(value, 10))
      } else if (['true', 'false', 'null'].indexOf(value.toLowerCase()) !== -1) {
        this.$emit('change', value.toLowerCase())
      }
    },
    toggle () {
      console.log()
      this.$emit('change', this.field.value)
    },
    keydown (e) {
      var value = parseFloat(e.target.innerText, 10)
      var update = false
      var size = 1
      if (e.altKey) {
        size = 0.1
      } else if (e.shiftKey) {
        size = 10
      }
      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          break
        case 'ArrowUp':
          update = !isNaN(value)
          value = value + size
          break
        case 'ArrowDown':
          update = !isNaN(value)
          value = value - size
          break
      }
      if (update) {
        e.target.innerText = value
        this.$emit('change', value)
      }
    }
  }
}
</script>

<style>
.detailvalue__label {
  position: relative;
  padding-left: 12px;
}
.detailvalue__label input {
  position: absolute;
  top: -2px;
  left: -6px;
}
</style>