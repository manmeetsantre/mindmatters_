"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const sendEmail = async (to, subject, html) => {
    // For dev: log to console. Replace with SMTP provider as needed.
    // eslint-disable-next-line no-console
    console.log("[EMAIL] To:", to, "Subject:", subject, "HTML:", html);
};
exports.sendEmail = sendEmail;
