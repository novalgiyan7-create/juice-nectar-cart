export function Hero() {
  return (
    <section id="about" className="hero-bg overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-secondary-foreground">🌿 100% Organic & Freshly Squeezed Daily</span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Fuel Your Body With <span className="text-gradient">Pure Nature</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Handcrafted cold-pressed juices, immunity boosters, and delicious smoothies made with zero preservatives and 100% natural fruits.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#menu" className="btn-pop rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground shadow-lg">Order Now</a>
            <a href="#menu" className="btn-pop rounded-full border-2 border-primary px-7 py-3 font-semibold text-primary">Explore Menu</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
            {["⚡ Fast Delivery (30 mins)", "🌱 100% Natural", "⭐ 4.9/5 Rating"].map((b) => (
              <span key={b} className="rounded-full bg-card px-4 py-2 shadow-md">{b}</span>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-accent/20 blur-3xl" />
          <img
            src="https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80"
            alt="Fresh colorful juices"
            className="relative aspect-square w-full rounded-3xl object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
