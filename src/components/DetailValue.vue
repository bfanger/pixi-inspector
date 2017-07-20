<template>
  <span>
    <span contenteditable="true" @keydown="keydown" @input="input">{{field.value}}</span>
    <span>{{typeof field.value === 'undefined' ? field.type : ''}}</span>
  </span>
</template>

<script>
export default {
  props: {
    field: {}
  },
  methods: {
    input (e) {
      var value = e.target.innerText
      if (value.match(/[0-9.]+/)) {
        this.$emit('change', parseFloat(value, 10))
      } else if (['true', 'false', 'null'].indexOf(value.toLowerCase()) !== -1) {
        this.$emit('change', value.toLowerCase())
      }
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
