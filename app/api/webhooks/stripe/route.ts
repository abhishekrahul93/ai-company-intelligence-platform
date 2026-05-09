import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

function getServiceSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is missing." }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid webhook signature." }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json({ received: true, warning: "Supabase service role is not configured." });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email;

    if (email) {
      await supabase.from("billing_events").insert({
        type: event.type,
        customer_email: email,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
        payload: session
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await supabase.from("billing_events").insert({
      type: event.type,
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : null,
      stripe_subscription_id: subscription.id,
      payload: subscription
    });
  }

  return NextResponse.json({ received: true });
}
