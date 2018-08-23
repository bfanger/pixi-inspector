<template>
  <span>
    <span 
      v-if="field.type === 'number' || field.type === 'string'" 
      class="detailvalue__input" 
      contenteditable="true" 
      v-html="content()"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="keydown" 
      @input="input"></span>
    <label 
      v-if="field.type === 'boolean'"
      class="detailvalue__label">
      <input 
        v-model="field.value" 
        type="checkbox" 
        @change="toggle()">{{ field.value }}</label>
    <span>{{ type() }}</span>
  </span>
</template>

<script>
export default {
  props: {
    field: { type: Object, required: true }
  },
  data: {
    isEdit: false,
    value: ""
  },
  methods: {
    content() {
      if (this.isEdit) {
        if (this.value === undefined) {
          this.value = this.field.value;
        }
        return this.value;
      } else {
        return this.field.value;
      }
    },
    onFocus() {
      this.isEdit = true;
      if (this.isEdit && this.value === undefined) {
        this.value = this.field.value;
      }
    },
    onBlur() {
      this.isEdit = false;
      this.setValue(this.value);
    },
    type() {
      const type = this.field.type;
      if (type === "object" && this.field.value === null) {
        return "null";
      }
      if (type === "boolean" || type === "number" || type === "string") {
        return "";
      }
      return type;
    },
    input(e) {
      const value = e.target.innerText;
      this.value = value;
      this.setValue(value);
    },
    toggle() {
      this.setValue(this.field.value);
    },
    keydown(e) {
      let value = parseFloat(e.target.innerText, 10);
      let update = false;
      let size = 1;
      if (e.altKey) {
        size = 0.1;
      } else if (e.shiftKey) {
        size = 10;
      }
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          break;
        case "ArrowUp":
          update = !isNaN(value);
          value += size;
          break;
        case "ArrowDown":
          update = !isNaN(value);
          value -= size;
          break;
      }
      if (update) {
        e.target.innerText = value;
        this.setValue(value);
      }
    },
    setValue(value) {
      if (!this.isEdit) {
        let newValue;
        if (value.match(/[0-9.]+/)) {
          newValue = parseFloat(newValue, 10);
        } else if (
          ["true", "false", "null"].indexOf(newValue.toLowerCase()) !== -1
        ) {
          newValue = newValue.toLowerCase();
        }
        this.$emit("change", newValue);
        this.value = newValue;
      }
    }
  }
};
</script>

<style lang="scss">
.detailvalue__input {
  border: none;
  min-width: 50px;
  display: block;
}
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
