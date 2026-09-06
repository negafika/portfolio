/* ================================================================
   React Islands — contact form (first island)
   Mounts into #cf-root, replacing the static fallback form.
   Same classes/ids as the legacy markup, so theme.css styles apply
   unchanged. Build: npm run build:islands
   ================================================================ */
import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState(null); // { kind: "ok" | "bad", text }

  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    if (errs[k]) setErrs({ ...errs, [k]: false });
  };

  function validate() {
    const e = {
      name: !f.name.trim(),
      email: !EMAIL_RE.test(f.email.trim()),
      message: f.message.trim().length < 10,
    };
    setErrs(e);
    return !e.name && !e.email && !e.message;
  }

  function mailtoFallback() {
    const body = `Hi Negaye,\n\n${f.message.trim()}\n\n— ${f.name.trim()} (${f.email.trim()})`;
    setAlert({ kind: "ok", text: "Opening your email app — your message is pre-filled and ready to send." });
    window.location.href =
      "mailto:negafika17@gmail.com?subject=" +
      encodeURIComponent(f.subject.trim() || "Portfolio inquiry from " + f.name.trim()) +
      "&body=" + encodeURIComponent(body);
    setBusy(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlert(null);
    if (!validate()) {
      setAlert({ kind: "bad", text: "Please fix the highlighted fields and try again." });
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.trim(), email: f.email.trim(),
          subject: f.subject.trim(), message: f.message.trim(),
          website: f.website, // honeypot — bots fill this, humans can't see it
        }),
      });
      const res = await r.json().catch(() => ({ ok: r.ok }));
      if (res && res.ok) {
        setAlert({ kind: "ok", text: "Message sent — thank you! I'll get back to you within a day." });
        setF({ name: "", email: "", subject: "", message: "", website: "" });
        setBusy(false);
      } else {
        mailtoFallback();
      }
    } catch {
      mailtoFallback();
    }
  }

  return (
    <form className="form-card" id="contact-form" noValidate onSubmit={onSubmit}>
      <div className={"form-alert" + (alert ? " show " + alert.kind : "")} id="form-alert" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="8 12.5 11 15.5 16 9.5" /></svg>
        <span>{alert ? alert.text : ""}</span>
      </div>

      {/* Honeypot: invisible to humans, irresistible to bots */}
      <input type="text" className="hp-field" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true"
        value={f.website} onChange={set("website")} />

      <div className="row">
        <div className="col-md-6">
          <div className={"f-group" + (errs.name ? " err" : "")} id="fg-name">
            <input type="text" id="cf-name" placeholder=" " autoComplete="name" value={f.name} onChange={set("name")} />
            <label htmlFor="cf-name">Your name</label>
            <div className="f-msg">Please tell me your name.</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className={"f-group" + (errs.email ? " err" : "")} id="fg-email">
            <input type="email" id="cf-email" placeholder=" " autoComplete="email" value={f.email} onChange={set("email")} />
            <label htmlFor="cf-email">Email address</label>
            <div className="f-msg">A valid email helps me reply.</div>
          </div>
        </div>
      </div>
      <div className="f-group">
        <input type="text" id="cf-subject" placeholder=" " value={f.subject} onChange={set("subject")} />
        <label htmlFor="cf-subject">Subject (optional)</label>
      </div>
      <div className={"f-group" + (errs.message ? " err" : "")} id="fg-msg">
        <textarea id="cf-msg" placeholder=" " value={f.message} onChange={set("message")}></textarea>
        <label htmlFor="cf-msg">Tell me about your project or problem…</label>
        <div className="f-msg">A few more words would help (10+ characters).</div>
      </div>
      <button type="submit" className="btn btn-primary btn-block magnetic" disabled={busy}
        style={busy ? { opacity: 0.65, pointerEvents: "none" } : undefined}>
        {busy ? "Sending…" : "Send Message"}
        <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
      </button>
      <p className="form-note">
        Messages are delivered straight to my inbox (stored securely on the server) — or write me directly at{" "}
        <a href="mailto:negafika17@gmail.com">negafika17@gmail.com</a>
      </p>
    </form>
  );
}

const root = document.getElementById("cf-root");
if (root) {
  window.__REACT_ISLANDS__ = true;
  createRoot(root).render(<ContactForm />);
}
