export type SaasStatus = {
  supabase: {
    configured: boolean;
    urlConfigured: boolean;
    anonKeyConfigured: boolean;
    serviceKeyConfigured: boolean;
  };
  stripe: {
    configured: boolean;
    secretKeyConfigured: boolean;
    priceIdConfigured: boolean;
    webhookSecretConfigured: boolean;
  };
  openai: {
    configured: boolean;
  };
};

export function getSaasStatus(): SaasStatus {
  const supabaseUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKeyConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabaseServiceKeyConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const stripeSecretKeyConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const stripePriceIdConfigured = Boolean(process.env.STRIPE_PRO_PRICE_ID);
  const stripeWebhookSecretConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);

  return {
    supabase: {
      configured: supabaseUrlConfigured && supabaseAnonKeyConfigured && supabaseServiceKeyConfigured,
      urlConfigured: supabaseUrlConfigured,
      anonKeyConfigured: supabaseAnonKeyConfigured,
      serviceKeyConfigured: supabaseServiceKeyConfigured
    },
    stripe: {
      configured: stripeSecretKeyConfigured && stripePriceIdConfigured,
      secretKeyConfigured: stripeSecretKeyConfigured,
      priceIdConfigured: stripePriceIdConfigured,
      webhookSecretConfigured: stripeWebhookSecretConfigured
    },
    openai: {
      configured: Boolean(process.env.OPENAI_API_KEY)
    }
  };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
