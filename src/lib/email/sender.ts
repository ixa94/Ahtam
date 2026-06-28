import nodemailer from "nodemailer";

type LeadData = {
  name?: string;
  phone: string;
  eventDate?: string;
  guestCount?: number;
  message?: string;
};

export async function sendLeadEmail(data: LeadData) {
  const to = process.env.SMTP_TO;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!to || !host || !user || !pass) return;

  const port = Number(process.env.SMTP_PORT ?? "465");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const lines = [
    "Новая заявка с сайта банкетного зала АХТАМ",
    "",
    `Имя: ${data.name || "не указано"}`,
    `Телефон: ${data.phone}`,
    `Дата мероприятия: ${data.eventDate || "не указана"}`,
    `Кол-во гостей: ${data.guestCount ?? "не указано"}`,
    data.message ? `Комментарий: ${data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await transporter
    .sendMail({
      from: `"Сайт АХТАМ" <${user}>`,
      to,
      subject: `Заявка от ${data.name || data.phone}`,
      text: lines,
    })
    .catch(() => {});
}
