import { Fragment } from 'react';

/* ---------- Network visualization data ---------- */
const NODES = [
  { cx: 80, cy: 30 },
  { cx: 200, cy: 60 },
  { cx: 350, cy: 20 },
  { cx: 500, cy: 55 },
  { cx: 650, cy: 25 },
  { cx: 800, cy: 50 },
  { cx: 950, cy: 15 },
  { cx: 140, cy: 90 },
  { cx: 300, cy: 100 },
  { cx: 460, cy: 110 },
  { cx: 600, cy: 85 },
  { cx: 750, cy: 105 },
  { cx: 900, cy: 80 },
  { cx: 1050, cy: 45 },
  { cx: 1100, cy: 95 },
  { cx: 250, cy: 130 },
  { cx: 550, cy: 140 },
  { cx: 850, cy: 130 },
];

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [0, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],
  [6, 13], [13, 14], [12, 14],
  [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12],
  [8, 15], [9, 16], [11, 17],
  [15, 16], [16, 17],
];

const STATS = [
  { value: '99.97%', label: 'Uptime' },
  { value: '16+', label: 'Locations' },
  { value: '0', label: 'DNS Leaks' },
  { value: '10Gbps', label: 'Uplinks' },
];

function scrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Hero() {
  return (
    <section className="hero">
      {/* Background layers */}
      <div className="hero__bg">
        <div className="hero__grid-pattern" />
        <div className="hero__glow" />
      </div>

      <div className="container hero__inner">
        {/* Badge */}
        <span className="pill pill--gold hero__badge">
          Engineered for Professionals
        </span>

        {/* Heading */}
        <h1 className="hero__title">
          Your connection
          <br />
          should be <em>invisible.</em>
        </h1>

        {/* Subtitle */}
        <p className="hero__subtitle">
          Infrastructure-grade VPN for financial services, crypto trading, and AI
          development. Zero leaks. Zero compromises.
        </p>

        {/* CTAs */}
        <div className="hero__actions">
          <button
            className="btn btn--primary btn--lg"
            onClick={() => scrollTo('#plans-section')}
          >
            Explore Plans
          </button>
          <button
            className="btn btn--outline btn--lg"
            onClick={() => scrollTo('#network-section')}
          >
            View Network →
          </button>
        </div>

        {/* Stats bar */}
        <div className="hero__stats">
          {STATS.map((stat, i) => (
            <Fragment key={stat.label}>
              {i > 0 && <span className="hero__stat-divider" />}
              <div className="hero__stat">
                <span className="hero__stat-value">{stat.value}</span>
                <span className="hero__stat-label">{stat.label}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* SVG network visualization */}
      <svg
        className="hero__viz"
        viewBox="0 0 1200 160"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {EDGES.map(([a, b], i) => (
          <line
            key={`edge-${i}`}
            className="hero__viz-edge"
            x1={NODES[a].cx}
            y1={NODES[a].cy}
            x2={NODES[b].cx}
            y2={NODES[b].cy}
          />
        ))}
        {NODES.map((node, i) => (
          <circle
            key={`node-${i}`}
            className="hero__viz-node"
            cx={node.cx}
            cy={node.cy}
            r={3}
          />
        ))}
      </svg>
    </section>
  );
}
