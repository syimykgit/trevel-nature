/* eslint-disable */
import axios from 'axios';
import { showAllert } from './alerts';
const Stripe = require('stripe');
const stripe = Stripe(
  'pk_test_51PPAW7P5WdWO1adjoRLgLYQaByPAig8jRwh0ZV9txOo41NIAocoU3eTnsKOeFXbymaxXIaoGA1zLwQGVu35AMbbe007YBMUnoV',
);

exports.bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    window.location.replace(session.data.session.url);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAllert('err', err, 1111111111);
  }
};
