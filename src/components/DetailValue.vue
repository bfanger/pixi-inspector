<template>
  <span>
    <span 
      v-if="field.type === 'number' || field.type === 'string'" 
      class="detailvalue__input" 
      contenteditable="true" 
      @focus="onFocus"
      @blur="onBlur"
      @keydown="keydown"
      v-html="fieldValue"/>
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
  data: () => ({
    isEdit: false,
    fieldValue: undefined
  }),
  watch: {
    field(newField) {
      this.field = newField;
      if (!this.isEdit) {
        this.fieldValue = this.field.value;
      }
    }
  },
  methods: {
    onFocus() {
      this.isEdit = true;
      if (this.isEdit && this.fieldValue === undefined) {
        this.fieldValue = this.field.value;
      }
    },
    onBlur(e) {
      const oldValue = this.fieldValue;
      this.fieldValue = e.target.innerText;
      this.isEdit = false;
      if (oldValue !== this.fieldValue) {
        this.sentNewValue(this.fieldValue);
      }
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
    toggle() {
      this.sentNewValue(this.field.value);
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
          update = true;
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
        this.sentNewValue(e.target.innerText);
      }
    },
    sentNewValue(value) {
      let newValue;
      if (value.match(/[0-9.]+/)) {
        newValue = parseFloat(value, 10);
      } else if (
        ["true", "false", "null"].indexOf(value.toLowerCase()) !== -1
      ) {
        newValue = value.toLowerCase();
      }
      this.fieldValue = newValue;
      this.$emit("change", newValue);
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
