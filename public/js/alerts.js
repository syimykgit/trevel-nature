/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.remove();
};

//type success or error
export const showAllert = (type, msg) => {
  hideAlert();
  const murkup = `<div class="alert alert--${type}">${msg}</div>.`;

  document.querySelector('body').insertAdjacentHTML('beforebegin', murkup);
  window.setTimeout(hideAlert, 5000);
};
