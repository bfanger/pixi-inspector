function isSpecial(value) {
  if (
    typeof value === "string" &&
    value.match(/^(\\null|\\NaN|\\undefined)$/)
  ) {
    return true;
  }
  return false;
}

function decode(value) {
  let newValue;
  const isNumber = parseFloat(value, 10);
  const isNullOrNaN = isSpecial(value);
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

function encryption(value, detailedResponse) {
  let newValue;
  let isSpecial;
  if (
    value === null ||
    value === undefined ||
    (typeof value !== "string" && isNaN(value))
  ) {
    isSpecial = true;
    newValue = String(value);
  } else {
    isSpecial = false;
    newValue = value;
  }
  return detailedResponse
    ? {
        oldValue: value,
        isSpecial,
        newValue
      }
    : newValue;
}

export default {
  decode,
  encryption,
  isSpecial
};
