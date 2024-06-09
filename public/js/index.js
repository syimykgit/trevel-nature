/* eslint-disable */

import '@babel/polyfill';

import { login, logout } from './login';
import { updateData } from './updateSettings';
import { bookTour } from './stripe';

document.querySelector('.form--login')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  login(email, password);
});

document.querySelector('.nav__el--logout')?.addEventListener('click', logout);

// ---------------------------------------------------------------------

document.querySelector('.form-user-data')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const form = new FormData();

  form.append('name', document.getElementById('name').value);
  form.append('email', document.getElementById('email').value);
  form.append('photo', document.getElementById('photo').files[0]);

  // const email = document.querySelector('.form-user-data #email').value;
  // const name = document.querySelector('.form-user-data #name').value;
  // const photo = document.querySelector('.form-user-data #photo').files[0];
  // console.log({ email, name, photo });
  // updateData({ email, name, photo }, 'update-me');

  updateData(form, 'update-me');
});

document
  .querySelector('.form-user-settings')
  ?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPass = document.querySelector(
      '.form-user-settings #password-current',
    ).value;
    const confirmPass = document.querySelector(
      '.form-user-settings #password-confirm',
    ).value;
    const newPassword = document.querySelector(
      '.form-user-settings #password',
    ).value;

    const userData = {
      userOldPassword: currentPass,
      password: newPassword,
      passwordConfirm: confirmPass,
    };
    await updateData(userData, 'update-password');
    confirmPass.value = '';
    newPassword.value = '';
    currentPass.value = '';
  });

document.querySelector('#book-tour')?.addEventListener('click', async (e) => {
  e.preventDefault();
  document.querySelector('#book-tour').textContent = 'Processing..';
  const tourId = e.target.dataset.tourId;

  await bookTour(tourId);
  document.querySelector('#book-tour').textContent = 'book tour now!';
});
