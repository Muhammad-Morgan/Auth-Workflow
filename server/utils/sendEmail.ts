// we create a function that sends email
import nodemailer from "nodemailer";
import { nodemailerConfig } from "./nodemailerConfig";

type SendEmailProps = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport(nodemailerConfig);

  try {
    return transporter.sendMail({
      from: '"Muhammad Morgan" <mmorgan@me.com>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};
