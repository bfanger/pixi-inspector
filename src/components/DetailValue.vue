<template>
  <span>
    <span 
      v-if="field.type === 'number' || field.type === 'string'" 
      class="detailvalue__input" 
      contenteditable="true" 
      @keydown="keydown" 
      @input="input">{{ field.value }}</span>
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
  methods: {
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
      if (value.match(/[0-9.]+/)) {
        this.$emit("change", parseFloat(value, 10));
      } else if (
        ["true", "false", "null"].indexOf(value.toLowerCase()) !== -1
      ) {
        this.$emit("change", value.toLowerCase());
      }
    },
    toggle() {
      this.$emit("change", this.field.value);
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
        this.$emit("change", value);
      }
    }
  }
};
</script>

<style>
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