const cards = [
  {
    emoji: '🤖',
    title: 'Automated Discipline',
    body: 'No spreadsheets. No manual budgeting. Money is split automatically the second it lands — before you can spend it wrong.',
    delay: '',
  },
  {
    emoji: '🧠',
    title: 'AI Money Coach',
    body: 'Weekly spending insights, behavior warnings, and celebrations. Your coach celebrates wins and flags problems before they grow.',
    delay: 'reveal-delay-100',
  },
  {
    emoji: '🔐',
    title: 'Emergency Wallet Lock',
    body: 'Your emergency fund is locked by default. Accessing it requires friction — a confirmation step that makes you pause before dipping in.',
    delay: 'reveal-delay-200',
  },
  {
    emoji: '📊',
    title: 'Built for Nigerian Reality',
    body: 'Supports ₦100 minimum transactions. Works with bank transfer and USSD. No dollar cards or foreign infrastructure needed.',
    delay: 'reveal-delay-300',
  },
];

export default function WhySection() {
  return (
    <section
      id="why"
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{ background: '#EDE9FF' }}
    >
      {/* Decorative */}
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(91,79,207,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative">

        {/* Header */}
        <div className="text-center mb-14 reveal">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold font-jakarta uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(91,79,207,0.15)', color: '#5B4FCF' }}
          >
            Why PocketWise
          </span>
          <h2
            className="font-jakarta font-bold text-foreground mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.5px' }}
          >
            Why PocketWise?
          </h2>
          <p
            className="text-secondary max-w-2xl mx-auto leading-relaxed"
            style={{ fontSize: '17px' }}
          >
            Nigerian youth aren&apos;t bad with money. They just never had a tool that made discipline effortless.
          </p>
        </div>

        {/* 2×2 bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards?.map((card) => (
            <div
              key={card?.title}
              className={`card-hover reveal ${card?.delay} bg-white rounded-3xl p-7 sm:p-8 shadow-card`}
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl mb-5"
                style={{ background: '#EDE9FF' }}
              >
                {card?.emoji}
              </div>
              <h3 className="font-jakarta font-bold text-foreground text-lg mb-3">
                {card?.title}
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                {card?.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}