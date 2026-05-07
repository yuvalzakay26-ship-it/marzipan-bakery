import Stripe from "stripe";
import { findProduct } from "../lib/catalog.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const MAX_QUANTITY_PER_LINE = 50;
const MAX_LINES = 50;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[create-checkout-session] STRIPE_SECRET_KEY is not set");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const { items } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }
    if (items.length > MAX_LINES) {
      return res.status(400).json({ error: "Too many items in cart" });
    }

    // Reject duplicate ids — cart should consolidate before sending. A duplicate
    // id is either a client bug or a tampering attempt; either way, fail loud.
    const seenIds = new Set();

    const line_items = items.map((item, index) => {
      const id = Number(item?.id);
      const quantity = Number(item?.quantity);

      if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError(`Item at index ${index} has an invalid id`);
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ValidationError(`Item ${id} has an invalid quantity`);
      }
      if (quantity > MAX_QUANTITY_PER_LINE) {
        throw new ValidationError(`Item ${id} exceeds max quantity per line`);
      }
      if (seenIds.has(id)) {
        throw new ValidationError(`Item ${id} appears more than once`);
      }
      seenIds.add(id);

      const product = findProduct(id);
      if (!product) {
        throw new ValidationError(`Unknown product id: ${id}`);
      }
      if (!Number.isFinite(product.priceValue) || product.priceValue <= 0) {
        // Catalog corruption — must not silently fall through to Stripe.
        console.error(
          `[create-checkout-session] Catalog price invalid for id=${id}`,
          product
        );
        throw new Error("catalog_price_invalid");
      }

      return {
        price_data: {
          currency: "ils",
          product_data: { name: product.name },
          unit_amount: Math.round(product.priceValue * 100),
        },
        quantity,
      };
    });

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    if (err instanceof ValidationError) {
      console.warn("[create-checkout-session] Validation failed:", err.message);
      return res.status(400).json({ error: err.message });
    }

    if (err?.type && typeof err.type === "string" && err.type.startsWith("Stripe")) {
      console.error("[create-checkout-session] Stripe error:", {
        type: err.type,
        code: err.code,
        message: err.message,
      });
      return res.status(502).json({ error: "Payment provider error" });
    }

    console.error("[create-checkout-session] Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}
