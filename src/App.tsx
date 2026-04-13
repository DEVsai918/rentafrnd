/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Search, 
  MapPin, 
  Star, 
  CheckCircle2, 
  MessageCircle, 
  ArrowRight, 
  ChevronLeft,
  Utensils,
  Map,
  Ticket,
  Trees,
  Dumbbell,
  Film,
  Palmtree,
  Music,
  Flower2,
  ShieldCheck,
  Zap,
  Users,
  X,
  Send,
  CreditCard,
  Phone,
  Video,
  HeartHandshake,
  Smartphone,
  QrCode,
  Calendar,
  Clock,
  Mail
} from 'lucide-react';
import { StripePayment } from './components/StripePayment';
import { RazorpayPayment } from './components/RazorpayPayment';
import { AppState, Mood, Companion, UserPreferences } from './types';
import { MOODS, ACTIVITIES, MOCK_COMPANIONS, INTERESTS, VIBES } from './constants';
import { TermsAndConditions, PrivacyPolicy, RefundPolicy, ContactPage } from './LegalContent';

const IconMap: Record<string, any> = {
  Utensils,
  Map,
  Ticket,
  Trees,
  Dumbbell,
  Film,
  Palmtree,
  Music,
  Flower2,
  Phone,
  Video,
  HeartHandshake
};

const BackgroundAnimation = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden mesh-bg">
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
  </div>
);

export default function App() {
  const [state, setState] = useState<AppState>('hero');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [matches, setMatches] = useState<Companion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chatCompanion, setChatCompanion] = useState<Companion | null>(null);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'companion' }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [bookingReason, setBookingReason] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [bookingPoint, setBookingPoint] = useState('');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay'>('stripe');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    ageRange: [18, 35],
    interests: [],
    vibe: []
  });

  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<{ smtp: { verified: boolean; error: string | null } } | null>(null);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch('https://www.rentafrnd.in/api/config-status');
        const data = await res.json();
        setConfigStatus(data);
      } catch (err) {
        console.error("Config check failed:", err);
      }
    };
    checkConfig();
  }, []);

  const handleStart = () => setState('booking-service');

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setState('activity-selection');
  };

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
    setState('preferences');
  };

  const handleInstantBooking = (activityId: string) => {
    setSelectedActivity(activityId);
    setState('booking-reason');
  };

  const handleReasonSubmit = () => {
    if (!bookingReason.trim() || !userPhone.trim() || !userEmail.trim()) return;
    setState('payment');
  };

  const handlePointSubmit = async () => {
    if (!bookingPoint.trim()) return;
    
    setIsNotifying(true);
    setNotificationError(null);

    // Notify server
    try {
      const response = await fetch('https://www.rentafrnd.in/api/notify-booking'){
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: ACTIVITIES.find(a => a.id === selectedActivity)?.label || 'Unknown',
          date: selectedDate,
          time: selectedTime,
          userEmail,
          userPhone,
          reason: bookingReason,
          meetingPoint: bookingPoint
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send notification');
      }

      setState('booking-success');
    } catch (err: any) {
      console.error("Failed to notify server:", err);
      setNotificationError(err.message || "Something went wrong while sending the notification. Please try again or contact support.");
    } finally {
      setIsNotifying(false);
    }
  };

  const handleSubscribe = async () => {
    if (!subscribeEmail.trim() || !subscribeEmail.includes('@')) return;
    setIsSubscribing(true);
    setNotificationError(null);
    try {
      const response = await fetch('https://www.rentafrnd.in/api/subscribe') {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSubscribeSuccess(true);
      setSubscribeEmail('');
      setTimeout(() => setSubscribeSuccess(false), 5000);
    } catch (err: any) {
      console.error("Subscription failed:", err);
      setNotificationError(err.message || "Subscription failed. Please try again later.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handlePreferencesSubmit = () => {
    setState('matching');
    
    // Simulate Matching with preferences
    setTimeout(() => {
      const filtered = MOCK_COMPANIONS.filter(c => 
        c.age >= userPreferences.ageRange[0] && 
        c.age <= userPreferences.ageRange[1]
      ).sort((a, b) => {
        const aScore = a.tags.filter(t => userPreferences.interests.includes(t)).length + 
                       (userPreferences.vibe.some(v => a.vibe.includes(v)) ? 2 : 0);
        const bScore = b.tags.filter(t => userPreferences.interests.includes(t)).length + 
                       (userPreferences.vibe.some(v => b.vibe.includes(v)) ? 2 : 0);
        return bScore - aScore;
      });
      
      setMatches(filtered.length > 0 ? filtered : MOCK_COMPANIONS.sort(() => Math.random() - 0.5));
      setState('results');
    }, 2500);
  };

  const handleConnect = (companion: Companion) => {
    setChatCompanion(companion);
    setMessages([
      { text: `Hi! I'm ${companion.name}. I saw you're looking for someone to go ${selectedActivity} with. I'm free now!`, sender: 'companion' }
    ]);
    setState('chat');
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { text: inputText, sender: 'user' }]);
    setInputText('');
    
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "That sounds great! Where should we meet?", sender: 'companion' }]);
    }, 1000);
  };

  const reset = () => {
    setState('hero');
    setSelectedMood(null);
    setSelectedActivity(null);
    setCurrentIndex(0);
    setIsCalling(false);
    setCallDuration(0);
  };

  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-white selection:bg-brand-primary selection:text-white relative">
      <BackgroundAnimation />
      {/* Call Overlay */}
      <AnimatePresence>
        {isCalling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-primary mb-8 animate-pulse">
              <img src={chatCompanion?.photo} alt="Calling" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-2">{chatCompanion?.name}</h2>
            <p className="text-brand-primary font-medium mb-12">
              {callDuration > 0 ? `In Call: ${formatDuration(callDuration)}` : 'Connecting...'}
            </p>
            
            <div className="flex gap-8">
              <button className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                <X className="w-8 h-8" />
              </button>
              <button 
                onClick={() => setIsCalling(false)}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/40"
              >
                <X className="w-8 h-8 rotate-45" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-12 md:py-8 flex justify-between items-center backdrop-blur-md bg-black/10 border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight leading-none">RentAFrnd</span>
            <span className="text-[10px] font-bold text-brand-primary tracking-[0.2em] uppercase opacity-80">Hyderabad connection</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          {state === 'hero' && (
            <div className="hidden md:flex items-center gap-8 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            </div>
          )}
          {state !== 'hero' ? (
            <button 
              onClick={() => setState('hero')}
              className="px-6 py-2 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
            >
              Exit
            </button>
          ) : (
            <button 
              onClick={handleStart}
              className="px-6 py-2 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors shadow-xl shadow-white/10"
            >
              Get Started
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-20">
        <AnimatePresence mode="wait">
          {state === 'hero' && (
            <motion.section 
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex-1 flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Hero Split Layout */}
              <div className="w-full max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center z-10">
                <div className="text-left">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-8"
                  >
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Live in your city</span>
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-display text-6xl md:text-8xl font-bold mb-8 leading-[0.85] tracking-tighter"
                  >
                    Get Your Perfect <br />
                    <span className="bg-brand-primary px-8 py-6 italic inline-block mt-4">
                      Local Companion <br />
                      Instantly
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-white/60 mb-12 max-w-lg leading-relaxed"
                  >
                    Connect with verified locals for real-life experiences. Whether you're exploring a new city or just need a friend, RentAFrnd finds your perfect match.
                  </motion.p>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-6"
                  >
                    <button 
                      onClick={handleStart}
                      className="gradient-bg px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                      <Zap className="w-5 h-5 group-hover:animate-pulse" /> Instant Booking
                    </button>
                  </motion.div>

                  {/* Trust Badges */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 flex flex-wrap gap-8 text-white/30"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Verified Locals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Matching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">50k+ Connections</span>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="relative hidden lg:block"
                >
                  <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden border border-white/10 group shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920" 
                      alt="Social moment" 
                      className="w-full h-full object-cover grayscale-[0.1] group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    
                    {/* Floating Feature Cards */}
                    <motion.div 
                      animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-12 -left-12 glass-card p-5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center shadow-inner">
                          <Utensils className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Dinner Date</p>
                          <p className="text-base font-bold">24 Available</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-24 -right-12 glass-card p-5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-secondary/20 flex items-center justify-center shadow-inner">
                          <Film className="w-6 h-6 text-brand-secondary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Movie Night</p>
                          <p className="text-base font-bold">12 Available</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Layer 1: Categories */}
              <div className="relative z-10 w-full max-w-7xl mx-auto mt-40 px-8 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em] mb-4">Curated Experiences</p>
                    <h2 className="font-display text-5xl font-bold">Explore by <span className="gradient-text italic">Category</span></h2>
                  </div>
                  <button 
                    onClick={() => setState('booking-service')}
                    className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-3"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {ACTIVITIES.slice(0, 5).map((activity, i) => {
                    const Icon = IconMap[activity.icon];
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        onClick={() => handleInstantBooking(activity.id)}
                        className="glass-card p-8 rounded-[2.5rem] group cursor-pointer glass-card-hover border border-white/5 hover:border-brand-primary/30 relative overflow-hidden"
                      >
                        {activity.image && (
                          <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                            <img src={activity.image} alt={activity.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40" />
                          </div>
                        )}
                        <div className="relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <Icon className="w-8 h-8 text-brand-primary" />
                          </div>
                          <h3 className="font-display text-2xl font-bold mb-2">{activity.label}</h3>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">1.2k+ Available</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

            </div>


            {/* Layer 3: How It Works */}
            <div className="relative z-10 w-full max-w-7xl mx-auto mt-32 px-6 mb-32">
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
                <p className="text-white/50">Four simple steps to find your perfect companion</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: "01", title: "Choose Your Mood", desc: "Tell us how you're feeling today.", icon: Zap, color: "from-orange-500/20 to-brand-primary/20" },
                  { step: "02", title: "Smart Matching", desc: "Our matching finds the perfect local for you.", icon: MessageCircle, color: "from-brand-primary/20 to-brand-secondary/20" },
                  { step: "03", title: "Instant Meeting", desc: "Meet your companion and enjoy!", icon: MapPin, color: "from-brand-secondary/20 to-purple-500/20" }
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative p-8 rounded-[2.5rem] glass-card glass-card-hover overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10">
                      <div className="text-6xl font-display font-black text-white/5 absolute -top-4 -right-4">{item.step}</div>
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                        <item.icon className="w-7 h-7 text-brand-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-3">{item.title}</h3>
                      <p className="text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Layer 4: Testimonials */}
            <div className="relative z-10 w-full max-w-7xl mx-auto mt-32 px-6 mb-32">
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl font-bold mb-4">What Our <span className="gradient-text">Users Say</span></h2>
                <p className="text-white/50">Real stories from real travelers</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: "Sarah J.", role: "Solo Traveler", text: "RentAFrnd made my trip to Bangalore so much better. I found a great companion for dinner and felt completely safe.", rating: 5 },
                  { name: "Mark T.", role: "Business Traveler", text: "The matching is spot on. Found a local who knew all the best hidden spots in Hyderabad. Highly recommended!", rating: 5 },
                  { name: "Elena R.", role: "Digital Nomad", text: "I use RentAFrnd whenever I'm in a new city. It's the best way to meet locals without the pressure of dating apps.", rating: 5 }
                ].map((testimonial, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="glass-card p-8 rounded-3xl border border-white/10"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-white/80 italic mb-6">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center font-bold text-brand-primary">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{testimonial.name}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{testimonial.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>


            {/* Subscribe Section */}
            <div className="relative z-10 w-full max-w-7xl mx-auto mt-32 px-6 mb-32">
              <div className="glass-card p-12 md:p-20 rounded-[3rem] border border-white/10 text-center relative overflow-hidden">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brand-secondary/5 blur-[120px] rounded-full" />
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">we were in...</h2>
                  <p className="text-xl text-white/80 font-bold mb-4">Subscribe to see more local friends.</p>
                  <p className="text-white/50 mb-12">Our periodic newsletter with news delivered directly to your inbox.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input 
                      type="email" 
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      placeholder="Your email address" 
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-primary/50 transition-colors"
                    />
                    <button 
                      onClick={handleSubscribe}
                      disabled={isSubscribing}
                      className="gradient-bg px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </div>
                  {subscribeSuccess && (
                    <p className="text-brand-primary mt-4 font-bold animate-bounce">Thank you for subscribing!</p>
                  )}
                  {notificationError && (
                    <p className="text-red-500 mt-4 font-medium">{notificationError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Safety Measures Section */}
            <div className="relative z-10 w-full max-w-7xl mx-auto mt-32 px-6 mb-40">
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl font-bold mb-4">Safety <span className="gradient-text">Measures</span></h2>
                <p className="text-white/50">Your security is our top priority</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { title: "Identity Verification", desc: "All companions undergo strict identity checks." },
                  { title: "Secure Payments", desc: "Encrypted transactions for your peace of mind." },
                  { title: "24/7 Support", desc: "Our team is always here to help you." },
                  { title: "Real-time Monitoring", desc: "Active meetups are monitored for safety." }
                ].map((measure, i) => (
                  <div key={i} className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center group hover:border-green-400/30 transition-all">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse mb-6 shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                    <h4 className="font-bold text-lg mb-2">{measure.title}</h4>
                    <p className="text-white/40 text-sm leading-relaxed">{measure.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            </motion.section>
          )}

          {state === 'booking-service' && (
            <motion.section 
              key="booking-service"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <button 
                onClick={() => setState('hero')}
                className="absolute top-24 left-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-center">Select a <span className="gradient-text italic">Service</span></h2>
              <p className="text-white/60 mb-16 text-center max-w-lg">Choose the perfect activity for your next local experience.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-6xl">
                {ACTIVITIES.map((activity) => {
                  const Icon = IconMap[activity.icon];
                  return (
                    <motion.button
                      key={activity.id}
                      whileHover={{ y: -10 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInstantBooking(activity.id)}
                      className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center text-center group glass-card-hover border border-white/5 hover:border-brand-primary/30 relative overflow-hidden"
                    >
                      {activity.image && (
                        <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-30 transition-opacity duration-500">
                          <img src={activity.image} alt={activity.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                      )}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-brand-primary/10 transition-colors" />
                        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                          <Icon className="w-8 h-8 text-brand-primary" />
                        </div>
                        <span className="font-display text-xl font-bold mb-2">{activity.label}</span>
                        <div className="flex items-center gap-1 text-brand-primary font-bold">
                          <span className="text-xs opacity-60">₹</span>
                          <span>{activity.price}</span>
                          <span className="text-[10px] opacity-40 font-normal">/{activity.unit || 'hr'}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {state === 'booking-reason' && (
            <motion.section 
              key="booking-reason"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <button 
                onClick={() => setState('booking-service')}
                className="absolute top-24 left-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <div className="w-full max-w-2xl glass-card p-12 rounded-[3.5rem] text-center relative overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/5 blur-[100px] rounded-full -ml-32 -mb-32" />

                <div className="w-24 h-24 rounded-3xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-10 shadow-inner relative z-10">
                  <MessageCircle className="w-12 h-12 text-brand-primary" />
                </div>
                <h2 className="font-display text-4xl font-bold mb-4 relative z-10">Booking <span className="gradient-text italic">Details</span></h2>
                <p className="text-white/60 mb-12 relative z-10">Customize your experience with your local companion.</p>
                
                <div className="grid md:grid-cols-2 gap-8 mb-10 relative z-10">
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-bold text-white/40 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <Calendar className="w-4 h-4 text-brand-primary" /> SELECT DATE
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-brand-primary/50 transition-all backdrop-blur-md hover:bg-white/10"
                    />
                  </div>
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-bold text-white/40 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <Clock className="w-4 h-4 text-brand-secondary" /> SELECT TIME
                    </label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-brand-primary/50 transition-all backdrop-blur-md hover:bg-white/10"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-10 relative z-10">
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-bold text-white/40 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <Phone className="w-4 h-4 text-brand-primary" /> PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-brand-primary/50 transition-all backdrop-blur-md hover:bg-white/10"
                    />
                  </div>
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-bold text-white/40 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <Mail className="w-4 h-4 text-brand-secondary" /> EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-brand-primary/50 transition-all backdrop-blur-md hover:bg-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-3 text-left mb-12 relative z-10">
                  <label className="text-[10px] font-bold text-white/40 flex items-center gap-2 uppercase tracking-[0.2em]">
                    <MessageCircle className="w-4 h-4 text-brand-primary" /> REASON FOR BOOKING
                  </label>
                  <textarea
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    placeholder="e.g. I'm new in town and want to explore the local food scene..."
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-primary/50 transition-all resize-none backdrop-blur-md hover:bg-white/10 min-h-[120px]"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReasonSubmit}
                  disabled={!bookingReason.trim() || !selectedDate || !selectedTime || !userPhone.trim() || !userEmail.trim()}
                  className="w-full py-6 rounded-3xl bg-brand-primary text-white font-bold text-lg shadow-[0_20px_40px_rgba(242,125,38,0.3)] hover:shadow-[0_25px_50px_rgba(242,125,38,0.4)] transition-all flex items-center justify-center gap-3 relative z-10 disabled:opacity-50"
                >
                  Next Step <ArrowRight className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.section>
          )}

          {state === 'payment' && (
            <motion.section 
              key="payment"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <button 
                onClick={() => setState('booking-reason')}
                className="absolute top-24 left-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              
              <div className="w-full max-w-5xl glass-card p-10 md:p-16 rounded-[3.5rem] grid md:grid-cols-2 gap-16 relative overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
                
                <div className="relative z-10">
                  <h2 className="font-display text-4xl font-bold mb-10">Order <span className="gradient-text italic">Summary</span></h2>
                  <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-brand-primary" />
                        </div>
                        <span className="text-white/60 font-medium">Service</span>
                      </div>
                      <span className="font-bold text-lg">{ACTIVITIES.find(a => a.id === selectedActivity)?.label}</span>
                    </div>
                    <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-brand-secondary" />
                        </div>
                        <span className="text-white/60 font-medium">Service Fee</span>
                      </div>
                      <span className="font-bold text-lg">₹{(ACTIVITIES.find(a => a.id === selectedActivity)?.price || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-white/60" />
                        </div>
                        <span className="text-white/60 font-medium">Processing</span>
                      </div>
                      <span className="font-bold text-lg">₹50</span>
                    </div>
                    <div className="h-px bg-white/10 my-8" />
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Total Amount</p>
                        <span className="font-display text-5xl font-bold text-brand-primary">
                          ₹{((ACTIVITIES.find(a => a.id === selectedActivity)?.price || 0) + 50)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] mb-1">Guaranteed</p>
                        <p className="text-xs text-white/40">Safe & Secure</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                  <h3 className="font-display text-2xl font-bold mb-6">Payment <span className="text-white/40">Method</span></h3>
                  
                  <div className="flex gap-4 mb-8">
                    <button 
                      onClick={() => setPaymentMethod('stripe')}
                      className={`flex-1 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${paymentMethod === 'stripe' ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Stripe</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`flex-1 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${paymentMethod === 'razorpay' ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Razorpay</span>
                    </button>
                  </div>

                  {paymentMethod === 'stripe' ? (
                    <StripePayment 
                      amount={(ACTIVITIES.find(a => a.id === selectedActivity)?.price || 0) + 50}
                      onSuccess={() => setState('booking-point')}
                      onCancel={() => setState('booking-reason')}
                    />
                  ) : (
                    <RazorpayPayment 
                      amount={(ACTIVITIES.find(a => a.id === selectedActivity)?.price || 0) + 50}
                      onSuccess={() => setState('booking-point')}
                      onCancel={() => setState('booking-reason')}
                      userEmail={userEmail}
                      userPhone={userPhone}
                    />
                  )}

                  <div className="flex items-center justify-center gap-6 opacity-20 grayscale hover:opacity-40 transition-opacity">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Google_Pay_%28GPay%29_Logo.svg" alt="GPay" className="h-5" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-5" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_logo%2C_revised_2016.svg" alt="Stripe" className="h-8" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-8" />
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {state === 'booking-point' && (
            <motion.section 
              key="booking-point"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <button 
                onClick={() => setState('booking-reason')}
                className="absolute top-24 left-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <div className="w-full max-w-2xl glass-card p-12 rounded-[3.5rem] text-center relative overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                
                <div className="w-24 h-24 rounded-3xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-10 shadow-inner relative z-10">
                  <MapPin className="w-12 h-12 text-brand-primary" />
                </div>
                <h2 className="font-display text-4xl font-bold mb-4 relative z-10">Where should you <span className="gradient-text italic">meet?</span></h2>
                <p className="text-white/60 mb-12 relative z-10">Specify a meeting point or a general location for your companion.</p>
                
                <div className="relative mb-12 relative z-10 group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="text"
                    value={bookingPoint}
                    onChange={(e) => setBookingPoint(e.target.value)}
                    placeholder="e.g. Central Park Entrance, 5th Ave..."
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-white focus:outline-none focus:border-brand-primary/50 transition-all backdrop-blur-md hover:bg-white/10"
                  />
                </div>

                {notificationError && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                    <p className="font-bold mb-1">Notification Error</p>
                    <p className="opacity-80">{notificationError}</p>
                    {notificationError.includes("535") && (
                      <div className="mt-3 pt-3 border-t border-red-500/20 text-xs">
                        <p className="font-bold uppercase tracking-widest mb-1">Hostinger Action Required:</p>
                        <p className="mb-2">Your Hostinger SMTP login failed. Please check your credentials.</p>
                        <ol className="list-decimal ml-4 space-y-1">
                          <li>Go to <strong>Settings</strong> in AI Studio.</li>
                          <li>Update <strong>EMAIL_USER</strong> with your full Hostinger email (e.g., contact@yourdomain.com).</li>
                          <li>Update <strong>EMAIL_PASS</strong> with your correct password.</li>
                          <li>If you have 2FA enabled on Hostinger, you may need to generate an <strong>App Password</strong>.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {configStatus && !configStatus.smtp.verified && !notificationError && (
                  <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-medium">
                    <p className="font-bold mb-1">Email System Offline</p>
                    <p className="opacity-80">The notification system is not configured correctly. You can still complete the booking, but we won't be able to send an email notification.</p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePointSubmit}
                  disabled={!bookingPoint.trim() || isNotifying}
                  className="w-full py-6 rounded-3xl bg-brand-primary text-white font-bold text-lg shadow-[0_20px_40px_rgba(242,125,38,0.3)] hover:shadow-[0_25px_50px_rgba(242,125,38,0.4)] transition-all flex items-center justify-center gap-3 relative z-10 disabled:opacity-50"
                >
                  {isNotifying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <>Complete Booking <ArrowRight className="w-6 h-6" /></>
                  )}
                </motion.button>
              </div>
            </motion.section>
          )}

          {state === 'booking-success' && (
            <motion.section 
              key="booking-success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <div className="w-full max-w-xl glass-card p-12 rounded-[3rem] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-orange-600"></div>
                
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                  <ShieldCheck className="w-12 h-12 text-green-500" />
                </div>

                <h2 className="font-display text-4xl font-bold mb-6">Booking <span className="gradient-text">Confirmed!</span></h2>
                
                <div className="space-y-6 text-lg text-white/80 mb-10 leading-relaxed">
                  <p>
                    RentAFrnd will accept your status and <span className="text-brand-primary font-bold">they will contact you</span> shortly via email or phone.
                  </p>
                  <p className="text-sm text-white/40">
                    A notification has been sent to our team with your booking details.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setState('hero')}
                  className="px-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                >
                  Back to Home
                </motion.button>
              </div>
            </motion.section>
          )}

          {state === 'mood-selection' && (
            <motion.section 
              key="mood"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">How are you feeling?</h2>
              <p className="text-white/60 mb-10">Select your current mood to find the best match</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-5xl">
                {MOODS.map((mood) => (
                  <motion.button
                    key={mood.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMoodSelect(mood.id)}
                    className="glass-card p-8 rounded-3xl flex flex-col items-center text-center group hover:bg-white/10 transition-all"
                  >
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{mood.emoji}</span>
                    <span className="font-bold text-xl mb-1">{mood.label}</span>
                    <span className="text-sm text-white/50">{mood.description}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {state === 'activity-selection' && (
            <motion.section 
              key="activity"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <button 
                onClick={() => setState('mood-selection')}
                className="absolute top-24 left-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">What's on your mind?</h2>
              <p className="text-white/60 mb-10">Pick an activity for your companionship</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-5xl">
                {ACTIVITIES.map((activity) => {
                  const Icon = IconMap[activity.icon];
                  return (
                    <motion.button
                      key={activity.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActivitySelect(activity.label)}
                      className="glass-card p-6 rounded-2xl flex flex-col items-center text-center group hover:bg-white/10 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-brand-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-white group-hover:text-brand-primary transition-colors" />
                      </div>
                      <span className="font-medium">{activity.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {state === 'preferences' && (
            <motion.section 
              key="preferences"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full"
            >
              <button 
                onClick={() => setState('activity-selection')}
                className="absolute top-24 left-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Refine your match</h2>
              <p className="text-white/60 mb-10">Tell us what you're looking for in a companion</p>
              
              <div className="w-full space-y-10">
                {/* Age Range */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-primary" /> Age Range: {userPreferences.ageRange[0]} - {userPreferences.ageRange[1]}
                  </h3>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="18" 
                      max="60" 
                      value={userPreferences.ageRange[0]}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, ageRange: [parseInt(e.target.value), prev.ageRange[1]] }))}
                      className="flex-1 accent-brand-primary"
                    />
                    <input 
                      type="range" 
                      min="18" 
                      max="60" 
                      value={userPreferences.ageRange[1]}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, ageRange: [prev.ageRange[0], parseInt(e.target.value)] }))}
                      className="flex-1 accent-brand-primary"
                    />
                  </div>
                </div>

                {/* Interests */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-brand-primary" /> Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(interest => (
                      <button
                        key={interest}
                        onClick={() => {
                          const exists = userPreferences.interests.includes(interest);
                          setUserPreferences(prev => ({
                            ...prev,
                            interests: exists 
                              ? prev.interests.filter(i => i !== interest)
                              : [...prev.interests, interest]
                          }));
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                          userPreferences.interests.includes(interest)
                            ? 'bg-brand-primary border-brand-primary text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vibe */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-brand-primary" /> Preferred Vibe
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {VIBES.map(vibe => (
                      <button
                        key={vibe}
                        onClick={() => {
                          const exists = userPreferences.vibe.includes(vibe);
                          setUserPreferences(prev => ({
                            ...prev,
                            vibe: exists 
                              ? prev.vibe.filter(v => v !== vibe)
                              : [...prev.vibe, vibe]
                          }));
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                          userPreferences.vibe.includes(vibe)
                            ? 'bg-brand-primary border-brand-primary text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        {vibe}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handlePreferencesSubmit}
                  className="w-full gradient-bg py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  Find My Perfect Match <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.section>
          )}

          {state === 'matching' && (
            <motion.section 
              key="matching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6"
            >
              <div className="relative w-48 h-48 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-brand-primary/30 rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 gradient-bg rounded-full flex items-center justify-center shadow-2xl shadow-brand-primary/50"
                >
                  <Search className="w-10 h-10 text-white" />
                </motion.div>
                
                {/* Floating Avatars */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -10, 0],
                      x: [0, i % 2 === 0 ? 10 : -10, 0]
                    }}
                    transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                    className="absolute w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden"
                    style={{
                      top: i === 0 ? '-20%' : i === 1 ? '80%' : '30%',
                      left: i === 2 ? '-20%' : i === 3 ? '80%' : '30%',
                    }}
                  >
                    <img src={MOCK_COMPANIONS[i].photo} alt="Match" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </motion.div>
                ))}
              </div>
              <h2 className="mt-12 font-display text-2xl font-bold">Finding your perfect match...</h2>
              <p className="text-white/50 mt-2">We are analyzing {selectedMood} vibes for {selectedActivity}</p>
              <div className="mt-8 flex flex-col gap-2 items-center">
                <div className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] animate-pulse">Analyzing profiles...</div>
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Checking availability...</div>
              </div>
            </motion.section>
          )}

          {state === 'results' && matches.length === 0 && (
            <motion.section 
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                <Search className="w-12 h-12 text-white/20" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-4">No Matches Found</h2>
              <p className="text-white/50 mb-10 max-w-md">We couldn't find any companions matching your exact vibes right now. Try our direct instant booking service instead!</p>
              <button
                onClick={() => setState('booking-service')}
                className="gradient-bg px-10 py-5 rounded-full font-bold text-lg shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform flex items-center gap-3"
              >
                <Zap className="w-6 h-6" /> Start Instant Booking
              </button>
            </motion.section>
          )}

          {state === 'results' && matches.length > 0 && (
            <motion.section 
              key="results"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-8"
            >
              <div className="w-full max-w-md relative h-[600px]">
                <AnimatePresence mode="popLayout">
                  {matches.slice(currentIndex, currentIndex + 1).map((companion) => (
                    <motion.div
                      key={companion.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ x: 300, opacity: 0, rotate: 20 }}
                      className="absolute inset-0 glass-card rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                      <div className="relative h-3/5">
                        <img 
                          src={companion.photo} 
                          alt={companion.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display text-3xl font-bold">{companion.name}, {companion.age}</h3>
                            {companion.verified && <CheckCircle2 className="w-5 h-5 text-blue-400 fill-blue-400/20" />}
                          </div>
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <MapPin className="w-4 h-4" /> {companion.location}
                          </div>
                        </div>
                        
                        <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold">{companion.rating}</span>
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                              <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Response Time</p>
                              <p className="text-xs font-bold text-green-400">{companion.responseTime}</p>
                            </div>
                            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                              <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Response Rate</p>
                              <p className="text-xs font-bold text-brand-primary">{companion.responseRate}%</p>
                            </div>
                            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                              <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Last Active</p>
                              <p className="text-xs font-bold">{companion.lastActive}</p>
                            </div>
                            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                              <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Sessions</p>
                              <p className="text-xs font-bold">{companion.completedSessions}+</p>
                            </div>
                          </div>
                          
                          <p className="text-white/80 italic text-sm mb-3">"{companion.vibe}"</p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {companion.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-medium bg-white/10 px-2.5 py-1 rounded-full text-white/60">#{tag}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button 
                            onClick={() => setCurrentIndex(prev => (prev + 1) % matches.length)}
                            className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                          >
                            <X className="w-5 h-5" /> Skip
                          </button>
                          <button 
                            onClick={() => handleConnect(companion)}
                            className="flex-[2] py-4 rounded-2xl gradient-bg font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                          >
                            <Heart className="w-5 h-5 fill-current" /> Connect
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <button 
                onClick={() => setState('mood-selection')}
                className="mt-8 text-white/40 hover:text-white transition-colors flex items-center gap-2"
              >
                Try a Different Mood
              </button>
            </motion.section>
          )}

          {state === 'chat' && chatCompanion && (
            <motion.section 
              key="chat"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-4"
            >
              <div className="flex items-center gap-4 p-4 glass-card rounded-2xl mb-4">
                <button onClick={() => setState('results')} className="text-white/60 hover:text-white">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary">
                  <img src={chatCompanion.photo} alt={chatCompanion.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{chatCompanion.name}</h3>
                  <p className="text-xs text-green-400">Online now</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsCalling(true)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary/20 hover:text-brand-primary transition-all"
                  >
                    <Zap className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary/20 hover:text-brand-primary transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 p-2">
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-brand-primary text-white rounded-tr-none' 
                        : 'bg-white/10 text-white rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Replies */}
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                {['Hey!', 'How are you?', 'Where are you?', 'Coffee?', 'Movie?'].map((reply) => (
                  <button
                    key={reply}
                    onClick={() => {
                      setInputText(reply);
                      // Auto send? Maybe just set it.
                    }}
                    className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <div className="p-2 glass-card rounded-3xl flex items-center gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-white placeholder:text-white/30"
                />
                <button 
                  onClick={sendMessage}
                  className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.section>
          )}
        {/* Legal and Contact Pages */}
        {state === 'terms' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20"
          >
            <button onClick={reset} className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" /> Back to Home
            </button>
            <div className="glass-card p-12 rounded-[3rem] border border-white/10">
              <TermsAndConditions />
            </div>
          </motion.section>
        )}

        {state === 'privacy' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20"
          >
            <button onClick={reset} className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" /> Back to Home
            </button>
            <div className="glass-card p-12 rounded-[3rem] border border-white/10">
              <PrivacyPolicy />
            </div>
          </motion.section>
        )}

        {state === 'refund' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20"
          >
            <button onClick={reset} className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" /> Back to Home
            </button>
            <div className="glass-card p-12 rounded-[3rem] border border-white/10">
              <RefundPolicy />
            </div>
          </motion.section>
        )}

        {state === 'contact' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20"
          >
            <button onClick={reset} className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" /> Back to Home
            </button>
            <ContactPage />
          </motion.section>
        )}
      </AnimatePresence>
    </main>

    {/* Footer */}
    {(state === 'hero' || state === 'terms' || state === 'privacy' || state === 'refund' || state === 'contact') && (
      <footer className="px-6 py-12 border-t border-white/5 bg-black/40 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">RentAFrnd</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-white/40 text-sm font-medium">
            <span onClick={() => setState('terms')} className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</span>
            <span className="text-white/10">|</span>
            <span onClick={() => setState('privacy')} className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-white/10">|</span>
            <span onClick={() => setState('refund')} className="hover:text-white cursor-pointer transition-colors">Refund Policy</span>
            <span className="text-white/10">|</span>
            <span onClick={() => setState('contact')} className="hover:text-white cursor-pointer transition-colors">Contact Us</span>
          </div>

          <p className="text-white/20 text-xs mt-4">
            Rent a friend © 2026 - All rights reserved.
          </p>
        </div>
      </footer>
    )}

      {/* Sticky Bottom CTA for Mobile (if not in chat/matching) */}
      {state !== 'hero' && state !== 'chat' && state !== 'matching' && (
        <div className="md:hidden fixed bottom-8 left-8 right-8 z-50">
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="w-full bg-red-500/10 backdrop-blur-2xl border border-red-500/20 py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 text-red-500 shadow-[0_20px_40px_rgba(239,68,68,0.2)]"
          >
            <X className="w-6 h-6" /> 
            <span className="uppercase tracking-[0.2em] text-xs">Cancel Session</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
