<template>
  <span>
    <!-- eslint-disable vue/no-v-html -->
    <span
      v-if="
        field.type === 'number' ||
        field.type === 'string' ||
        field.type === 'object'
      "
      class="detailvalue__input"
      :class="{
        detailvalue__encrypted: isEncrypted,
      }"
      contenteditable="true"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="keydown"
      v-html="fieldValue"
    />
    <label v-if="field.type === 'boolean'" class="detailvalue__checkbox">
      <input v-model="fieldValue" type="checkbox" @change="toggle()" />
      {{ field.value }}
    </label>
    <span v-if="field.type !== 'object'" class="detailvalue__static">{{ staticType }}</span>
  </span>
</template>

<script>
import DataTypeConverter from "../util.dataTypeConverter";

export default {
  props: {
    field: { type: Object, required: true },
  },
  data: () => ({
    isEdit: false,
    fieldValue: undefined,
    isEncrypted: false,
  }),
  computed: {
    staticType() {
      const type = this.field.type;
      if (type === "object" && this.field.value === null) {
        return "null";
      }
      if (type === "boolean" || type === "number" || type === "string") {
        return "";
      }
      return type;
    },
  },
  watch: {
    field(newField) {
      // eslint-disable-next-line vue/no-mutating-props
      this.field = newField;
      if (!this.isEdit) {
        this.setFieldValue(this.field.value);
      }
    },
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

    toggle() {
      this.sentNewValue(!this.field.value);
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
        const match = e.target.innerText.match(/^[0-9]+\.([0-9]+)$/);
        if (match) {
          value = parseFloat(value.toFixed(Math.max(1, match[1].length)));
        }
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
    },
  },
};
</script>

<style lang="scss">
.detailvalue__input {
  border: none;
  min-width: 50px;
  display: block;
}
.detailvalue__encrypted {
  font-style: italic;
}
.detailvalue__static {
  font-style: italic;
  opacity: 0.5;
}
.detailvalue__checkbox {
  position: relative;
  padding-left: 14px;
}
.detailvalue__checkbox input {
  position: absolute;
  top: -2px;
  left: -6px;
}
</style>
