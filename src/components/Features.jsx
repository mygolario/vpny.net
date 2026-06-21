
import { ShieldCheck, Globe, Cpu, Zap } from 'lucide-react';

const FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Zero Leak Guarantee',
    desc: 'DNS and WebRTC protection verified on every connection. Your real IP stays completely hidden.',
  },
  {
    Icon: Globe,
    title: 'Global Network',
    desc: '16+ server locations across North America, Europe, and Asia with city-level geolocation accuracy.',
  },
  {
    Icon: Cpu,
    title: 'AI Platform Optimized',
    desc: 'Custom routing for ChatGPT, Claude, Gemini, Midjourney, Cursor, and 20+ AI platforms.',
  },
  {
    Icon: Zap,
    title: 'Instant Provisioning',
    desc: 'Configure, pay, and connect in under 60 seconds. Automatic subscription link delivery.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features-section">
      <div className="container">
        {/* Section header */}
        <div className="section-header">
          <span className="section-label">Why VPNy</span>
          <h2 className="section-title">
            Built for professionals
            <br />
            who need zero compromises.
          </h2>
          <p className="section-subtitle">
            Whether you're trading crypto, building AI workflows, or managing
            sensitive financial data — VPNy delivers the privacy infrastructure
            your work demands.
          </p>
        </div>

        {/* Feature cards */}
        <div className="features__grid reveal">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div className="features__card" key={title}>
              <div className="features__card-icon">
                <Icon size={24} />
              </div>
              <h3 className="features__card-title">{title}</h3>
              <p className="features__card-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
