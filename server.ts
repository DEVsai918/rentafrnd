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
  const PORT = 3000;

  // Initialize Stripe lazily
  let stripeClient: Stripe | null = null;
  const getStripe = () => {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error("STRIPE_SECRET_KEY environment variable is required");
      }
      stripeClient = new Stripe(key);
    }
    return stripeClient;
  };

  // Initialize Razorpay lazily
  let razorpayClient: Razorpay | null = null;
  const getRazorpay = () => {
    if (!razorpayClient) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) {
        throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required");
      }
      razorpayClient = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    return razorpayClient;
  };

  // SMTP Status tracking
  let smtpStatus = {
    configured: false,
    verified: false,
    error: null as string | null
  };

  // Initialize Nodemailer transporter lazily
  let transporter: nodemailer.Transporter | null = null;
  const getTransporter = () => {
    if (!transporter) {
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;
      
      if (!user || !pass) {
        smtpStatus.configured = false;
        console.warn("EMAIL_USER and EMAIL_PASS environment variables are missing. Email notifications will be logged to console only.");
        return null;
      }
      
      smtpStatus.configured = true;
      console.log("Initializing SMTP: host=smtp.hostinger.com, port=465, user=" + (user ? user : "MISSING"));
      
      transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true, // Use SSL for Hostinger
        auth: {
          user: user,
          pass: pass,
        },
        debug: true,
        logger: true,
        tls: {
          rejectUnauthorized: false,
          minVersion: "TLSv1.2"
        }
      });

      // Verify connection configuration
      transporter.verify(function (error, success) {
        if (error) {
          smtpStatus.verified = false;
          smtpStatus.error = error.message;
          console.error("CRITICAL: Hostinger SMTP Authentication Failed (535).");
          console.error("DETAILS:", error.message);
          console.error("HOSTINGER ACTION REQUIRED:");
          console.error("1. Ensure EMAIL_USER is your full Hostinger email: " + user);
          console.error("2. Ensure EMAIL_PASS is the correct password for this account.");
          console.error("3. If you have 2FA enabled on Hostinger, you may need an 'App Password'.");
        } else {
          smtpStatus.verified = true;
          smtpStatus.error = null;
          console.log("SUCCESS: Hostinger SMTP Server is connected and authenticated.");
        }
      });
    }
    return transporter;
  };

  app.use(express.json());

  // Config Status API
  app.get("/api/config-status", (req, res) => {
    getTransporter(); // Ensure transporter is initialized
    res.json({
      smtp: smtpStatus,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      razorpay: !!process.env.RAZORPAY_KEY_ID
    });
  });

  // Stripe API routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = "inr" } = req.body;
      const stripe = getStripe();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents/paise
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Razorpay API routes
  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { amount, currency = "INR" } = req.body;
      const razorpay = getRazorpay();

      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Booking Notification API
  app.post("/api/notify-booking", async (req, res) => {
    try {
      const bookingData = req.body;
      const adminEmail = process.env.ADMIN_EMAIL || "contact@rentafrnd.in";
      const transporter = getTransporter();

      const emailContent = `
        <h3>New Booking Confirmed - RentAFrnd</h3>
        <p><strong>Service:</strong> ${bookingData.service}</p>
        <p><strong>Date:</strong> ${bookingData.date}</p>
        <p><strong>Time:</strong> ${bookingData.time}</p>
        <p><strong>User Email:</strong> ${bookingData.userEmail}</p>
        <p><strong>User Phone:</strong> ${bookingData.userPhone}</p>
        <p><strong>Reason:</strong> ${bookingData.reason}</p>
        <p><strong>Meeting Point:</strong> ${bookingData.meetingPoint}</p>
      `;

      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject: `New Booking: ${bookingData.service}`,
          html: emailContent,
        });
        console.log("Booking email sent to:", adminEmail);
      } else {
        console.log("------------------------------------------");
        console.log("NEW BOOKING NOTIFICATION (SIMULATED)");
        console.log("To:", adminEmail);
        console.log(emailContent.replace(/<[^>]*>/g, ""));
        console.log("------------------------------------------");
      }

      res.json({ success: true, message: "Notification sent successfully" });
    } catch (error: any) {
      console.error("Notification Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Newsletter Subscription API
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      const adminEmail = process.env.ADMIN_EMAIL || "contact@rentafrnd.in";
      const transporter = getTransporter();

      const emailContent = `
        <h3>New Newsletter Subscription - RentAFrnd</h3>
        <p><strong>Subscriber Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `;

      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject: `New Subscriber: ${email}`,
          html: emailContent,
        });
        console.log("Subscription email sent to:", adminEmail);
      } else {
        console.log("------------------------------------------");
        console.log("NEW SUBSCRIPTION NOTIFICATION (SIMULATED)");
        console.log("To:", adminEmail);
        console.log(emailContent.replace(/<[^>]*>/g, ""));
        console.log("------------------------------------------");
      }

      res.json({ success: true, message: "Subscription successful" });
    } catch (error: any) {
      console.error("Subscription Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Contact Form API
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      const adminEmail = process.env.ADMIN_EMAIL || "contact@rentafrnd.in";
      const transporter = getTransporter();

      const emailContent = `
        <h3>New Contact Form Submission - RentAFrnd</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `;

      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject: `Contact Form: ${subject}`,
          html: emailContent,
        });
        console.log("Contact email sent to:", adminEmail);
      } else {
        console.log("------------------------------------------");
        console.log("NEW CONTACT FORM SUBMISSION (SIMULATED)");
        console.log("To:", adminEmail);
        console.log(emailContent.replace(/<[^>]*>/g, ""));
        console.log("------------------------------------------");
      }

      res.json({ success: true, message: "Message sent successfully" });
    } catch (error: any) {
      console.error("Contact Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
