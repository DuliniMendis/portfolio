"use server";

// Contact form handler. Sends each message to Dulini's inbox through Resend (https://resend.com).
// Needs RESEND_API_KEY in the environment (Vercel project settings, and .env.local for local dev).
// Without a verified domain, Resend only delivers to the address the Resend account was created with,
// so that account must use the CONTACT_TO_EMAIL address below.

const TO = process.env.CONTACT_TO_EMAIL ?? "dulini.mendis@gmail.com";
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Portfolio contact form <onboarding@resend.dev>";

export type ContactField = "name" | "email" | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<ContactField, string>>;
  /** Echoed back on error so the form keeps what the visitor typed. */
  values?: Record<ContactField, string>;
};

const LIMITS = { name: 100, email: 200, message: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: field(formData, "name").slice(0, LIMITS.name),
    email: field(formData, "email").slice(0, LIMITS.email),
    message: field(formData, "message").slice(0, LIMITS.message),
  };

  // Honeypot: hidden from people, often filled in by bots. Pretend it worked.
  if (field(formData, "company")) return { status: "success" };

  const errors: ContactState["errors"] = {};
  if (!values.name) errors.name = "Please add your name.";
  if (!EMAIL_RE.test(values.email)) errors.email = "Please add an email address I can reply to.";
  if (values.message.length < 10) errors.message = "Please write a little more.";
  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the fields above.", errors, values };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form: RESEND_API_KEY is not set, so the message was not sent.");
    return { status: "error", message: "Sorry, your message couldn't be sent right now.", values };
  }

  const subject = `Portfolio message from ${values.name.replace(/[\r\n]+/g, " ")}`;
  const text = `${values.message}\n\n— ${values.name} <${values.email}>\nSent from the contact form on your portfolio.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [TO], reply_to: values.email, subject, text }),
    });
    if (!res.ok) {
      console.error("Contact form: Resend returned", res.status, await res.text());
      return { status: "error", message: "Sorry, your message couldn't be sent right now.", values };
    }
  } catch (err) {
    console.error("Contact form: request to Resend failed", err);
    return { status: "error", message: "Sorry, your message couldn't be sent right now.", values };
  }

  return { status: "success" };
}
