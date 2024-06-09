import { showAllert } from './alerts';
import axios from 'axios';

export const updateData = async function (data, endPoint) {
  try {
    const response = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/${endPoint}`,
      data,
    });
    if (response.data.status === 'success') {
      showAllert('success', 'you updated successfuly ');
      location.reload(true);
    }
  } catch (err) {
    showAllert('error', err.response.data.message);
  }
};

// export const updateData = async function (data, endPoint) {
//   try {
//     const response = await fetch(
//       `http://localhost:3000/api/v1/users/${endPoint}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         method: 'PATCH',
//         body: JSON.stringify(data),
//       },
//     );
//     const res = await response.json();

//     if (res.status === 'success') {
//       showAllert('success', 'you updated successfuly ');

//       location.reload(true);
//     } else {
//       throw new Error(res.message);
//     }
//   } catch (err) {
//     console.log(err);
//     showAllert('error', err);
//   }
// };
