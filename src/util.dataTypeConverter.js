function decode(value) {
  let newValue;
  const isNumber = parseFloat(value, 10);
  const isNullOrNaN =
    typeof value === "string"
      ? value.match(/^(\\null|\\NaN|\\undefined)$/)
      : false;
  if (!isNaN(isNumber)) {
    // is number
    newValue = isNumber;
  } else if (isNullOrNaN) {
    // is null or NaN or undefined sent not like string
    switch (value) {
      case "\\null":
        newValue = null;
        break;
      case "\\NaN":
        newValue = NaN;
        break;
      case "\\undefined":
        newValue = undefined;
        break;
    }
  } else {
    // is just string
    newValue = value;
  }
  return newValue;
}

function encript(value) {
  if (
    value === null ||
    value === undefined ||
    (typeof value !== "string" && isNaN(value))
  ) {
    return "\\" + value;
  }
  return value;
}

export default {
  decode,
  encript
};
