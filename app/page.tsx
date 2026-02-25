import Link from "next/link";

export default function HomePage() {
  return (
    <div className="h-full bg-neutral-950 text-neutral-200 flex items-center justify-center px-4 py-20 overflow-hidden relative">

      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#c9a96e 1px, transparent 1px), linear-gradient(90deg, #c9a96e 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-2xl mx-auto text-center space-y-10">

        {/* Eyebrow */}
        <p className="text-amber-400 text-xs tracking-widest uppercase">
          Welcome to
        </p>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-light text-neutral-100 tracking-tight leading-none">
            Market
            <span className="text-amber-400">Store</span>
          </h1>
          <div className="w-16 h-px bg-amber-400/40 mx-auto mt-6" />
        </div>

        {/* Description */}
        <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          We pride ourselves on offering carefully selected products that bring
          style, comfort, and value to your everyday life. Discover a store
          built around you.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 bg-amber-400 text-neutral-950 px-10 py-4 text-xs font-medium tracking-widest uppercase rounded hover:bg-amber-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20">
              Shop Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </Link>
          <Link href="/cart">
            <button className="flex items-center gap-2 border border-neutral-700 text-neutral-400 px-10 py-4 text-xs tracking-widest uppercase rounded hover:border-neutral-500 hover:text-neutral-200 transition-all duration-200">
              View Cart
            </button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          {["Curated Products", "Seamless Experience", "Friendly Service"].map((feat) => (
            <span
              key={feat}
              className="text-xs text-neutral-500 border border-neutral-800 px-4 py-2 rounded-full tracking-wide"
            >
              {feat}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}