import { motion } from 'framer-motion';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import JourneyTimeline from '../components/JourneyTimeline.jsx';
import PortfolioGrid from '../components/PortfolioGrid.jsx';
import CVSection from '../components/CVSection.jsx';
import ContactSection from '../components/ContactSection.jsx';
import Footer from '../components/Footer.jsx';

const TICKER = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'YouTube long-form', 'Documentaries', 'Motion Graphics', 'VFX', 'Colour grading', 'Sound design'];

function Ticker() {
  return (
    <div className="relative flex overflow-hidden border-y border-white/10 bg-slate-950/50 py-4">
      <div className="flex min-w-max animate-marquee gap-10 pr-10">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span key={`${t}-${i}`} className="flex items-center gap-10 font-display text-sm uppercase tracking-[0.25em] text-slate-500">
            {t} <span className="text-neon">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <JourneyTimeline />
        <PortfolioGrid />
        <CVSection />
        <ContactSection />
      </main>
      <Footer />
    </motion.div>
  );
}
