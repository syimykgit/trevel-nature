const htmlToText = require('html-to-text');

const pug = require('pug');
const nodeMailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name;
    this.url = url;
    this.from = `Syimyk <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env === 'production') return 1;

    return nodeMailer.createTransport({
      host: process.env.HOST_EMAILER,
      port: process.env.PORT_EMAILER,
      auth: {
        user: process.env.USER_NAME_EMAILER,
        pass: process.env.PASSWORD_EMAILER,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      url: this.url,
      firstName: this.firstName,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the nature family');
  }

  async sendForgotPassword() {
    await this.send('passwordReset', 'token is valit only for 10 minutes');
  }
};
