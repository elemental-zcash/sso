
// HTML template guide:
// https://app.postdrop.io/
// Centralise around Postmark API or nodemailer API?

import { sendEmail } from '../elemental-mail';

export const sendVerificationEmail = async (address: string) => {
  await sendEmail({
    to: address,
    text: 'This is a test verification email',
    subject: 'Test verification email',
    from: process.env.NO_REPLY_FROM_ADDRESS,
  });

  console.log('Success');
}

// ReactDOMServer.renderToStaticMarkup