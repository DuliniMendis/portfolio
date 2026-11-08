"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState } from "react";
import { type ContactField, type ContactState, sendContactMessage } from "@/app/actions/contact";
import { cn } from "@/lib/utils";

const initialState: ContactState = { status: "idle" };

const inputClass =
  "mt-2 block w-full rounded-card border bg-surface px-4 py-3 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-blue focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-card border border-border bg-surface p-8">
        <CheckCircle2 className="text-blue" size={32} aria-hidden />
        <p className="mt-4 font-display text-2xl font-semibold">Thanks, your message is on its way.</p>
        <p className="mt-2 text-muted">I&apos;ll reply to the email address you gave me.</p>
      </div>
    );
  }

  const err = (f: ContactField) => state.errors?.[f];
  const describedBy = (f: ContactField) => (err(f) ? `contact-${f}-error` : undefined);

  return (
    <form action={formAction} noValidate className="relative rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            defaultValue={state.values?.name}
            aria-invalid={err("name") ? true : undefined}
            aria-describedby={describedBy("name")}
            className={cn(inputClass, err("name") ? "border-error" : "border-border")}
          />
          <FieldError id="contact-name-error" text={err("name")} />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            defaultValue={state.values?.email}
            aria-invalid={err("email") ? true : undefined}
            aria-describedby={describedBy("email")}
            className={cn(inputClass, err("email") ? "border-error" : "border-border")}
          />
          <FieldError id="contact-email-error" text={err("email")} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          defaultValue={state.values?.message}
          aria-invalid={err("message") ? true : undefined}
          aria-describedby={describedBy("message")}
          className={cn(inputClass, "resize-y", err("message") ? "border-error" : "border-border")}
        />
        <FieldError id="contact-message-error" text={err("message")} />
      </div>

      {/* Honeypot for bots: hidden from people and from screen readers. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-lg font-medium text-ink transition-colors hover:bg-blue-light disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
        <p aria-live="polite" className="text-sm text-error">
          {state.status === "error" ? state.message : null}
        </p>
      </div>
    </form>
  );
}

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="mt-2 text-sm text-error">
      {text}
    </p>
  );
}
