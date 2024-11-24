import nodeMailer from "nodemailer";

// Email sending options interface
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

// Email sending function
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodeMailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL, // Ensure this is set in your .env file
      pass: process.env.EMAIL_PASSWORD, // Ensure this is set in your .env file
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error);

    // Check for specific email error conditions
    if ((error as any).response) {
      const response = (error as any).response;
      if (response.includes("550") || response.includes("5.1.1")) {
        throw new Error(`Address not found: The email ${options.to} is not valid.`);
      }
    }

    throw new Error("Failed to send email. Please check the email address and try again.");
  }
};
