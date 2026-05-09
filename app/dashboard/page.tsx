"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { accountStorageKey, savedResumesStorageKey, savedVersionsStorageKey } from "@/lib/resume";
import type { SaasStatus } from "@/lib/saas";
import { createClient, isSupabaseBrowserConfigured } from "@/lib/supabase/client";

type LocalAccount = {
  name: string;
  email: string;
  plan: "free" | "pro";
};

type AuthUser = {
  id: string;
  email?: string;
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function StatusPill({ ready }: { ready: boolean }) {
  return <span className={ready ? "statusPill ready" : "statusPill pending"}>{ready ? "Connected" : "Needs setup"}</span>;
}

export default function DashboardPage() {
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [savedResumeCount, setSavedResumeCount] = useState(0);
  const [savedVersionCount, setSavedVersionCount] = useState(0);
  const [status, setStatus] = useState<SaasStatus | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    const storedAccount = safeParse<LocalAccount | null>(window.localStorage.getItem(accountStorageKey), null);
    const storedResumeCount = safeParse<unknown[]>(window.localStorage.getItem(savedResumesStorageKey), []).length;
    const storedVersionCount = safeParse<unknown[]>(window.localStorage.getItem(savedVersionsStorageKey), []).length;
    queueMicrotask(() => {
      setAccount(storedAccount);
      setSavedResumeCount(storedResumeCount);
      setSavedVersionCount(storedVersionCount);
    });
    void fetch("/api/saas/status")
      .then((response) => response.json())
      .then((data: SaasStatus) => setStatus(data));
    void fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: { user: AuthUser | null }) => setAuthUser(data.user));
  }, []);

  async function sendMagicLink() {
    setAuthMessage("");

    if (!authEmail.trim()) {
      setAuthMessage("Enter your email first.");
      return;
    }

    if (!isSupabaseBrowserConfigured()) {
      setAuthMessage("Supabase is not configured yet. Add Supabase env vars, then try again.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setAuthMessage(error ? error.message : "Magic link sent. Check your email to sign in.");
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setAuthUser(null);
    setAuthMessage("Signed out.");
  }

  async function startCheckout() {
    setCheckoutMessage("");
    const response = await fetch("/api/checkout", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setCheckoutMessage(data.error || "Checkout is not available yet.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <main className="dashboardShell">
      <nav className="dashboardNav">
        <Link href="/" className="brandLink">
          <span className="brandMark">CF</span>
          CareerForge
        </Link>
        <div>
          <Link className="secondaryButton" href="/templates">Templates</Link>
          <Link className="secondaryButton" href="/">Builder</Link>
          <Link className="secondaryButton" href="/tailor">AI Tailor</Link>
        </div>
      </nav>

      <section className="dashboardHero">
        <p className="eyebrow">SaaS dashboard</p>
        <h1>Manage resumes, versions, billing, and production setup.</h1>
        <p>This dashboard is the bridge from local prototype to real SaaS. Connect Supabase for users/data and Stripe for subscriptions.</p>
      </section>

      <section className="dashboardGrid">
        <article className="dashboardCard">
          <p className="eyebrow">Account</p>
          <h2>{authUser?.email || account?.name || "Create account"}</h2>
          <p>{authUser ? "Signed in with Supabase." : account?.email || "Use magic-link login when Supabase is connected."}</p>
          <span className={account?.plan === "pro" ? "planBadge pro" : "planBadge"}>{account?.plan === "pro" ? "Pro" : "Free"}</span>
          {authUser ? (
            <button className="secondaryButton" type="button" onClick={signOut}>Sign out</button>
          ) : (
            <div className="authForm">
              <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" type="email" />
              <button className="primaryButton" type="button" onClick={sendMagicLink}>Email Magic Link</button>
            </div>
          )}
          {authMessage ? <p className="noticeBox">{authMessage}</p> : null}
        </article>

        <article className="dashboardCard">
          <p className="eyebrow">Saved work</p>
          <h2>{savedResumeCount + savedVersionCount} local items</h2>
          <p>{savedResumeCount} builder resumes and {savedVersionCount} tailored CV versions saved in this browser.</p>
        </article>

        <article className="dashboardCard billingCard">
          <p className="eyebrow">Billing</p>
          <h2>Upgrade to Pro</h2>
          <p>Connect Stripe to unlock paid templates, unlimited saved resumes, and premium AI usage limits.</p>
          <button className="primaryButton" type="button" onClick={startCheckout}>Start Stripe Checkout</button>
          {checkoutMessage ? <p className="errorBox">{checkoutMessage}</p> : null}
        </article>
      </section>

      <section className="productionPanel">
        <div>
          <p className="eyebrow">Production readiness</p>
          <h2>Integration status</h2>
        </div>
        <div className="statusGrid">
          <article>
            <div><h3>OpenAI</h3><StatusPill ready={Boolean(status?.openai.configured)} /></div>
            <p>Required for AI enhancement, tailoring, and the career agent.</p>
          </article>
          <article>
            <div><h3>Supabase</h3><StatusPill ready={Boolean(status?.supabase.configured)} /></div>
            <p>Required for real auth, user profiles, saved resumes, and saved CV versions.</p>
          </article>
          <article>
            <div><h3>Stripe</h3><StatusPill ready={Boolean(status?.stripe.configured)} /></div>
            <p>Required for subscriptions, plan gates, invoices, and payment lifecycle.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
