export const sendEmail = async (to: string, subject: string, html: string) => {
  // For dev: log to console. Replace with SMTP provider as needed.
  // eslint-disable-next-line no-console
  console.log("[EMAIL] To:", to, "Subject:", subject, "HTML:", html);
};



