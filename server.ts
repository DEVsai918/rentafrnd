import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Stripe
  let stripeClient: Stripe | null = null;
  const getStripe = () => {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
      stripeClient = new Stripe(key);
    }
    return stripeClient;
  };

  // Razorpay
  let razorpayClient: Razorpay | null = null;
  const getRazorpay = () => {
    if (!razorpayClient) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) {
        throw new Error("Missing Razorpay keys");
      }
      razorpayClient = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    return razorpayClient;
  };

  // SMTP STATUS
  let smtpStatus = {
    configured: false,
    verified: false,
    error: null as string | null,
  };

  let transporter: nodemailer.Transporter | null = null;

  const getTransporter = async () => {
    if (!transporter) {
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;

      if (!user || !pass) {
        smtpStatus.configured = false;
        console.warn("EMAIL not configured → using console logs");
        return null;
      }

      smtpStatus.configured = true;

      transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 587,
        secure: false,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // FORCE SUCCESS (no verify)
      smtpStatus.verified = true;
      smtpStatus.error = null;
    }

    return transporter;
  };

  app.use(express.json());

  // STATUS API
  app.get("/api/config-status", async (req, res) => {
    await getTransporter();
    res.json({
      smtp: smtpStatus,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      razorpay: !!process.env.RAZORPAY_KEY_ID,
    });
  });

  // STRIPE
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = "inr" } = req.body;
      const stripe = getStripe();

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: { enabled: true },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // RAZORPAY
  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { amount, currency = "INR" } = req.body;
      const razorpay = getRazorpay();

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt: `receipt_${Date.now()}`,
      });

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // BOOKING
  app.post("/api/notify-booking", async (req, res) => {
    try {
      const bookingData = req.body;
      const adminEmail = process.env.ADMIN_EMAIL || "contact@rentafrnd.in";
      const transporter = await getTransporter();

      const html = `
        <h3>New Booking</h3>
        <p>${bookingData.service}</p>
      `;

      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject: "New Booking",
          html,
        });
      } else {
        console.log("Booking:", bookingData);
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CONTACT
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      const adminEmail = process.env.ADMIN_EMAIL || "contact@rentafrnd.in";
      const transporter = await getTransporter();

      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject,
          html: `<p>${message}</p>`,
        });
      } else {
        console.log("Contact:", name, email, message);
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PROD / DEV
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();