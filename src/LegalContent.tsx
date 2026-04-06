import React, { useState } from 'react';

export const TermsAndConditions = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
    <p className="text-white/70 mb-4">Welcome to RentAFrnd. By accessing our website, you agree to be bound by these terms and conditions.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">1. Use of Service</h2>
    <p className="text-white/60 mb-4">RentAFrnd provides a platform for connecting users with local companions for social activities. Users must be at least 18 years old to use this service.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">2. User Conduct</h2>
    <p className="text-white/60 mb-4">Users are expected to maintain respectful and safe interactions. Any form of harassment, illegal activity, or violation of safety guidelines will result in immediate termination of access.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">3. Booking and Payments</h2>
    <p className="text-white/60 mb-4">All bookings are subject to availability. Payments are processed securely through our platform. Users agree to provide accurate information for all transactions.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">4. Limitation of Liability</h2>
    <p className="text-white/60 mb-4">RentAFrnd is a platform and is not responsible for the actions of individual users or companions. Users engage in activities at their own risk.</p>
  </div>
);

export const PrivacyPolicy = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="text-white/70 mb-4">Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">1. Information Collection</h2>
    <p className="text-white/60 mb-4">We collect information you provide directly to us, such as your name, email address, and phone number when you make a booking or subscribe to our newsletter.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">2. Use of Information</h2>
    <p className="text-white/60 mb-4">We use your information to facilitate bookings, send notifications, and improve our services. We do not sell your personal data to third parties.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">3. Data Security</h2>
    <p className="text-white/60 mb-4">We implement industry-standard security measures to protect your data from unauthorized access or disclosure.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">4. Your Rights</h2>
    <p className="text-white/60 mb-4">You have the right to access, update, or delete your personal information at any time by contacting us.</p>
  </div>
);

export const RefundPolicy = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
    <p className="text-white/70 mb-4">Our goal is to ensure your satisfaction. Please review our refund guidelines below.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">1. Cancellation by User</h2>
    <p className="text-white/60 mb-4">Cancellations made more than 24 hours before the scheduled activity are eligible for a full refund. Cancellations within 24 hours may be subject to a cancellation fee.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">2. Cancellation by Companion</h2>
    <p className="text-white/60 mb-4">If a companion cancels a booking, you will receive a full refund or the option to reschedule at no additional cost.</p>
    
    <h2 className="text-xl font-bold mt-8 mb-4">3. Refund Process</h2>
    <p className="text-white/60 mb-4">Refunds are processed back to the original payment method within 5-10 business days.</p>
  </div>
);

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      <p className="text-white/70 mb-12 text-center">Have questions or need assistance? We're here to help.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <h3 className="font-bold mb-2">Email Us</h3>
          <p className="text-white/50 text-sm">contact@rentafrnd.in</p>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
          </div>
          <h3 className="font-bold mb-2">Live Chat</h3>
          <p className="text-white/50 text-sm">Available 24/7 in-app</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Your Name" 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-colors" 
          />
          <input 
            type="email" 
            placeholder="Your Email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-colors" 
          />
        </div>
        <input 
          type="text" 
          placeholder="Subject" 
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-colors" 
        />
        <textarea 
          rows={4} 
          placeholder="Your Message" 
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-primary/50 transition-colors resize-none"
        ></textarea>
        
        {status === 'success' && (
          <p className="text-green-400 text-center text-sm">Message sent successfully! We'll get back to you soon.</p>
        )}
        {status === 'error' && (
          <p className="text-red-400 text-center text-sm">Failed to send message. Please try again later.</p>
        )}

        <button 
          type="submit" 
          disabled={status === 'sending'}
          className="w-full gradient-bg py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};
