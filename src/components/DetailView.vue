<template>
  <div class="detailview">
    <div v-for="field in fields" class="detailview__item" :key="field.path">
      <div class="detailview__label">{{field.path}}</div>
      <DetailValue class="detailview__value" :field="field" @change="setProperty(field.path, $event)"></DetailValue>
    </div>
  </div>
</template>

<script>
import { Observable } from 'rxjs/Observable'
import DetailValue from './DetailValue'
import lastestInspector$ from '../services/lastestInspector$.js'

export default {
  components: { DetailValue },

  subscriptions () {
    return {
      fields: lastestInspector$.switchMap(inspector => {
        if (inspector === null) {
          return Observable.empty()
        }
        return Observable.interval(10000).merge(inspector.selected$).switchMap(() => {
          return inspector.call('properties.all')
        })
      }),
      setProperty: lastestInspector$.method('setProperty')
    }
    // const fields = []

    // Object.keys(this.selected).forEach(property => {
    //   if (property[0] === '_' || ['children', 'parent', 'worldTransform'].indexOf(property) !== -1) {
    //     return
    //   }
    //   var value = this.selected[property]
    //   var type = typeof value
    //   if (type === 'string' || type === 'number') {
    //     fields.push({ label: property, value: value })
    //   } else if (type === 'boolean') {
    //     fields.push({ label: property, value: value ? 'true' : 'false' })
    //   } else if (value === null) {
    //     fields.push({ label: property, value: 'null' })
    //   } else if (type === 'object') {
    //     Object.keys(value).forEach(_property => {
    //       var _value = value[_property]
    //       var _type = typeof _value
    //       if (_type === 'string' || _type === 'number') {
    //         fields.push({ property: property + '.' + _property, value: _value })
    //       } else if (_type === 'boolean') {
    //         fields.push({ property: property + '.' + _property, value: _value ? 'true' : 'false' })
    //       } else {
    //         fields.push({ property: property + '.' + _property, value: '...' + _type })
    //       }
    //     })
    //   } else {
    //     fields.push({ property: property, value: '...' + type })
    //   }
    // })
    // return fields
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
