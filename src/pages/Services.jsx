import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Disc3, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getActiveClientCount } from '../lib/db';
import Button from '../components/ui/Button';

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [capacity, setCapacity] = useState(0);

  useEffect(() => {
    getActiveClientCount().then(setCapacity).catch(console.error);
  }, []);

  const isFull = capacity >= 3;
  const services = [
    {
      title: "Master Only",
      price: "£40",
      description: (
        <div className="flex flex-col gap-2 text-sm mt-2">
          <p className="text-[#0F172A]/60">
            For mixes that are already perfected. We apply the final analog polish and competitive loudness for optimal translation.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#0F172A]/50 text-xs mt-2 mb-4">
            <li><strong className="text-[#0F172A]/70">Requirements:</strong> Unmastered WAV (-6db headroom)</li>
          </ul>
        </div>
      ),
      shortCard: true
    },
    {
      title: "Full Service: Mix & Master",
      price: "£140",
      description: (
        <div className="flex flex-col gap-4 text-sm mt-2">
          <p>
            Vocal cleaning, precise EQ, and dynamic processing to make your vocals punch through. Includes creative effects (Reverbs, Delays, beat drops) and industry-standard mastering so your track sounds loud and clear on Spotify, Apple Music, and in the club.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#0F172A]/50">
            <li><strong className="text-[#0F172A]/70">Turnaround:</strong> 4 to 10 days</li>
            <li><strong className="text-[#0F172A]/70">Track Limit:</strong> 3 track upload limit (more upon request)</li>
            <li><strong className="text-[#0F172A]/70">Revisions:</strong> 2 free revisions</li>
          </ul>
          <div className="pt-2 border-t border-white/5">
            <strong className="text-[#0F172A]/70 block mb-1">What I Need From You:</strong>
            <ul className="list-disc pl-4 space-y-1 text-[#0F172A]/50 text-xs">
              <li>Dry, UNMIXED vocal stems (WAV preferred)</li>
              <li>The beat/instrumental track & BPM</li>
              <li>A reference track for the desired vibe</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Recording Session",
      price: "£225",
      description: (
        <div className="flex flex-col gap-4 text-sm mt-2">
          <p>
            An intensive 1-to-1 in-person studio day in Brighton. You focus purely on the vocal performance and artistic delivery while I handle the complete tracking, technical engineering, and A&R direction.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#0F172A]/50">
            <li><strong className="text-[#0F172A]/70">Session Type:</strong> Start-to-finish live tracking</li>
            <li><strong className="text-[#0F172A]/70">A&R Services:</strong> High-quality beat procurement & split negotiation</li>
            <li><strong className="text-[#0F172A]/70">Deliverables:</strong> A competitive rough mix by the end of the day</li>
          </ul>
          <div className="pt-2 border-t border-white/5">
            <strong className="text-[#0F172A]/70 block mb-1">Booking Details:</strong>
            <ul className="list-disc pl-4 space-y-1 text-[#0F172A]/50 text-xs">
              <li>Located strictly in Brighton (Must be able to commute)</li>
              <li>Requires an introductory consultation</li>
              <li>Requires a £50 deposit to lock the studio slot</li>
            </ul>
          </div>
        </div>
      ),
      isConsult: true
    }
  ];

  // Stripe Payment Link Map
  const STRIPE_LINKS = {
    "Master Only": "https://buy.stripe.com/test_master",
    "Mix & Master": "https://buy.stripe.com/test_mixmaster",
    "The Debut Tape": "https://buy.stripe.com/test_debut",
  };

  const handleCheckout = (title) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-32 px-6 pb-20">
      
      {/* Header */}
      <section className="max-w-4xl mx-auto w-full text-center mb-20">
        <h1 className="mb-6">Pure Fidelity.</h1>
        <p className="text-[#0F172A]/60 text-lg">
          Uncompromising audio engineering. Order direct, securely upload your stems, and track your project in the bespoke client portal.
        </p>
      </section>

      {/* The Debut Tape Hero Block */}
      <section className="max-w-6xl mx-auto w-full mb-20">
        <div className="mindwave-glass w-full p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1E3A8A]/30 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex-1 relative z-10">
            <div className="inline-block bg-[#3B82F6] text-black text-[9px] font-black uppercase px-2 py-1 rounded-sm mb-4 tracking-[0.2em] shadow-2xl">
              Free for portfolio work
            </div>
            <h2 className="text-[#3B82F6] mb-4">The Debut Tape</h2>
            <p className="text-[#0F172A]/70 text-lg mb-8 max-w-lg">
              A full 4-week partnership. We handle beat licensing, recording, mixing, mastering, and the overall creative direction to build your first statement piece (4-track EP).
            </p>
            <div className="flex items-center gap-2 text-[#0F172A]/50 text-sm mb-8">
              <ShieldCheck size={16} /> <span>Price upon consultation (£2,000 baseline)</span>
            </div>
            <Button 
              onClick={() => handleCheckout('The Debut Tape')} 
              disabled={isFull}
            >
              {isFull ? 'Currently Full' : 'Book A Consultation'}
            </Button>
          </div>
          
          <div className="relative z-10">
             <div className="w-32 h-32 md:w-64 md:h-64 rounded-full border border-white/10 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                 <Disc3 size={80} className="text-[#0F172A]/20" />
             </div>
          </div>
        </div>
      </section>

      {/* Standard Services Grid */}
      <section className="max-w-6xl mx-auto w-full">
        <h3 className="mb-12 text-center text-[#0F172A]/40">À La Carte Engineering</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              className={`mindwave-feature-card flex flex-col items-start ${s.shortCard ? 'self-start' : 'h-full'}`}
            >
              <div className="w-full flex justify-between items-start mb-6 border-b border-white/5 pb-6">
                <h3 className="text-2xl">{s.title}</h3>
                <div className="text-right">
                  <span className="font-display text-[#0F172A]/30 text-sm tracking-tight line-through mr-3">{s.price}</span>
                  <span className="font-display text-[#3B82F6] text-2xl tracking-tighter uppercase font-black">Free</span>
                </div>
              </div>
              
              <div className={`text-[#0F172A]/60 mb-10 flex-1 leading-relaxed ${s.shortCard ? 'flex-none' : ''}`}>
                {s.description}
              </div>
              
              {s.isConsult ? (
                <Button 
                  onClick={() => handleCheckout(s.title)} 
                  disabled={isFull}
                  className="w-full py-4 text-xs"
                >
                  {isFull ? 'Currently Full' : 'Request Consultation'}
                </Button>
              ) : (
                <Button 
                  onClick={() => handleCheckout(s.title)} 
                  disabled={isFull}
                  className="w-full py-4 text-xs"
                >
                  {isFull ? 'Currently Full' : 'Order Now'}
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Waitlist Bridge */}
        {isFull && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-16 w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <Lock size={24} className="text-[#3B82F6]/40 mb-4" />
            <h4 className="text-[#0F172A] font-bold uppercase tracking-widest mb-3">Capacity Reached</h4>
            <p className="text-[#0F172A]/40 text-sm leading-relaxed mb-6">
              To ensure every project receives maximum technical attention and sonic precision, I only accept 3 clients per fortnight.
            </p>
            <Link to="/login" className="px-6 py-3 rounded-xl border border-[#3B82F6]/20 text-[#3B82F6] text-xs font-black uppercase tracking-widest hover:bg-[#3B82F6]/10 transition-colors">
              Join Waitlist
            </Link>
          </motion.div>
        )}
      </section>

    </div>
  );
}
