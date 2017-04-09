<template>
  <div class="detailview">
  <div v-for="field in fields"
       class="detailview__item">
    <div class="detailview__label">{{field.label}}</div>
    <DetailValue class="detailview__value" :value="field.value" @change="updateValue(field.label, $event)"></DetailValue>
  </div>
  </div>
</template>

<script>
import DetailValue from './DetailValue'

export default {
  components: { DetailValue },
  props: {
    selected: Object,
    proxy: Object
  },
  computed: {
    fields () {
      const fields = []

      Object.keys(this.selected).forEach(property => {
        if (property[0] === '_' || ['children', 'parent', 'worldTransform'].indexOf(property) !== -1) {
          return
        }
        var value = this.selected[property]
        var type = typeof value
        if (type === 'string' || type === 'number') {
          fields.push({ label: property, value: value })
        } else if (type === 'boolean') {
          fields.push({ label: property, value: value ? 'true' : 'false' })
        } else if (value === null) {
          fields.push({ label: property, value: 'null' })
        } else if (type === 'object') {
          Object.keys(value).forEach(_property => {
            var _value = value[_property]
            var _type = typeof _value
            if (_type === 'string' || _type === 'number') {
              fields.push({ property: property + '.' + _property, value: _value })
            } else if (_type === 'boolean') {
              fields.push({ property: property + '.' + _property, value: _value ? 'true' : 'false' })
            } else {
              fields.push({ property: property + '.' + _property, value: '...' + _type })
            }
          })
        } else {
          fields.push({ property: property, value: '...' + type })
        }
      })
      return fields
    }
  },
  methods: {
    updateValue (property, value) {
      this.proxy.eval('$pixi.' + property + ' = ' + value)
    }
  }
}
</script>

<style lang="scss">
.detailview {
  // white-space: nowrap;
  padding: 4px;
}

.detailview__item {
  display: flex;
  margin-bottom: 2px;
}

.detailview__label {
  display: inline-block;
  color: #c00;
  padding-right: 5px;
  &:after {
  content: ':';
  color: #000;
  }
}

.detailview__value {
  color: #333;
}
</style>
