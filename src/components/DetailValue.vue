<template>
  <span>
    <span
      v-if="field.type === 'number' || field.type === 'string' || field.type === 'object'"
      :class="{
        'encrypted__input': isEncrypted
      }" 
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
    <span 
      v-if="field.type !== 'object'"
      class="static__output"
    >{{ type() }}</span>
  </span>
</template>

<script>
import DataTypeConverter from "../util.dataTypeConverter";

export default {
  props: {
    field: { type: Object, required: true }
  },
  data: () => ({
    isEdit: false,
    fieldValue: undefined,
    isEncrypted: false
  }),
  watch: {
    field(newField) {
      this.field = newField;
      if (!this.isEdit) {
        this.setFieldValue(this.field.value);
      }
    }
  },
  methods: {
    onFocus() {
      this.isEdit = true;
      if (this.isEdit && this.fieldValue === undefined) {
        this.setFieldValue(this.field.value);
      }
    },
    onBlur(e) {
      const oldValue = this.fieldValue;
      this.setFieldValue(e.target.innerText);
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
      if (e.key === "Enter") {
        e.preventDefault();
        this.sentNewValue(e.target.innerText);
      } else if (this.field.type !== "number") {
        return;
      }
      let value = parseFloat(e.target.innerText, 10);
      let update = false;
      let size = 1;
      if (e.altKey) {
        size = 0.1;
      } else if (e.shiftKey) {
        size = 10;
      }
      switch (e.key) {
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
        this.sentNewValue(value);
      }
    },
    setFieldValue(newValue) {
      const encryption = DataTypeConverter.encryption(newValue, true);
      this.fieldValue = encryption.newValue;
      this.isEncrypted = encryption.isSpecial;
    },
    sentNewValue(value) {
      const newValue = DataTypeConverter.decode(value);
      this.setFieldValue(newValue);
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
.encrypted__input {
  font-style: italic;
}
.static__output {
  font-weight: bold;
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
