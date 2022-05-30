// Check if value is empty
export function isEmpty(val) {
  return val.trim().length === 0;
}

// Check if email is valid
export function isValidEmail(val) {
  return new RegExp(
    '[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?'
  ).test(val);
}
