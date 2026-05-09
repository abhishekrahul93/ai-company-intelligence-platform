import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/saas";
import { getStripe } from "@/lib/stripe";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function POST() {
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!process.env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json(
      {
        error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID to enable paid plans."
      },
      { status: 503 }
    );
  }

  const appUrl = getAppUrl();
  let customerEmail: string | undefined;

  if (isSupabaseServerConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    customerEmail = data.user?.email;
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
    customer_email: customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true
  });

  return NextResponse.json({ url: session.url });
}
