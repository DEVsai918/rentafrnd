/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_RAZORPAY_KEY_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
