/* eslint-disable */
import { showAllert } from './alerts';

export const login = async function (email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/v1/users/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const res = await response.json();

    if (res.status === 'success') {
      showAllert('success', 'you successfuly logged in');
      // window.location.replace('/');
      // or...
      location.assign('/');
    } else {
      throw new Error(res.message);
    }
  } catch (err) {
    showAllert('error', err);
  }
};

export const logout = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/users/logout', {
      method: 'GET',
    });

    console.log(response);

    const res = await response.json();
    if (res.status === 'success') {
      location.replace('/login');

      // to update server and browser : location.reload(true);
    }
  } catch (err) {
    showAllert('error', 'Error try again');
  }
};

// const login = async function (email, password) {
//   try {
//     const response = await axios({
//       method: 'POST',
//       url: 'http://localhost:8000/api/v1/users/login',
//       data: { email: email, password: password },
//     });
//   } catch (err) {
//     return console.error(err.response.data.message);
//   }
// };

// form.addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const email = document.querySelector('#email').value;
//   const password = document.querySelector('#password').value;
//   const data = await login(email, password);
// });
