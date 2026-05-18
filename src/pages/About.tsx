import { ArrowRight, ShieldCheck, FileText, TrendingUp, Award } from 'lucide-react';

interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
  const steps = [
    {
      number: '01',
      title: 'Donation',
      desc: 'Generous individuals, corporate partners, and retiring musicians contribute instruments or financial support. Every donation — regardless of size — directly fuels our mission.',
      color: 'bg-amber-50 border-amber-200',
      numColor: 'text-amber-600',
    },
    {
      number: '02',
      title: 'Refurbishment',
      desc: 'Each donated instrument is professionally inspected, deep-cleaned, and repaired by certified technicians to meet or exceed school-band standards before it ever reaches a student.',
      color: 'bg-sky-50 border-sky-200',
      numColor: 'text-sky-600',
    },
    {
      number: '03',
      title: 'The Impact',
      desc: "Fully restored instruments are matched with eager students in partnered local music programs. Our placement coordinators work directly with directors to ensure the right fit for every child.",
      color: 'bg-emerald-50 border-emerald-200',
      numColor: 'text-emerald-600',
    },
  ];


  return (
    <>
      {/* Page Header */}
      <section className="relative pt-32 pb-20 bg-stone-900 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/164936/pexels-photo-164936.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Orchestra performance"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">About Us</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 max-w-2xl leading-tight">
            Our Story &amp; Mission
          </h1>
        </div>
      </section>

      {/* Core Narrative */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
            <img
              src="https://images.pexels.com/photos/7095517/pexels-photo-7095517.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Young student with instrument"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-6 leading-snug">
              Why we started, and why it matters more than ever.
            </h2>
            <div className="space-y-5 text-stone-600 leading-relaxed">
              <p>
                Noteworthy Foundation was founded in 2018 after our co-founders witnessed firsthand how budget cuts were silencing school music programs across Central Texas. Instruments were sitting in closets — too expensive for families to rent — while talented students were being turned away from band, orchestra, and choir.
              </p>
              <p>
                We fill the structural gap between instrument availability and student access. Rather than pushing for systemic policy change alone, we take direct action: sourcing instruments, funding their restoration, and placing them in the hands of children who are ready to play.
              </p>
              <p>
                The research is unambiguous. Students who participate in music education demonstrate stronger academic performance, higher graduation rates, and measurable improvements in cognitive development, emotional regulation, and social cohesion. Music is not an extracurricular — it is an educational cornerstone, and we intend to protect it.
              </p>
            </div>
            <button
              onClick={() => onNavigate('donate')}
              className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-amber-600 text-white font-semibold rounded-full hover:bg-amber-700 transition-colors"
            >
              Support Our Work <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-stone-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mt-3">How It Works</h2>
            <p className="text-stone-500 mt-4 max-w-xl mx-auto">
              Every donation follows a rigorous three-step process designed to maximize impact and ensure quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`relative p-8 rounded-2xl border ${step.color}`}
              >
                <div className={`text-6xl font-black mb-4 leading-none ${step.numColor} opacity-30`}>
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{step.title}</h3>
                <p className="text-stone-600 leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo break */}
      <section className="grid md:grid-cols-2 h-72 md:h-96">
        <img
          src="https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Children in music lesson"
          className="w-full h-full object-cover"
        />
        <img
          src="https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Young violinist performing"
          className="w-full h-full object-cover"
        />
      </section>

      {/* Trust & Transparency */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <br />
            <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Accountability</span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mt-3">
              Built for Institutional Trust
            </h2>
            <p className="text-stone-500 mt-4 max-w-xl mx-auto">
              We understand that large-scale donors and corporate sponsors require rigorous financial transparency before committing resources. Here is what we provide.
            </p>
          </div>


          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-lg mb-1">Download our 501(c)(3) Documentation</h3>
              <p className="text-stone-500 text-sm">
                Full IRS determination letter, audited financials, and program cost breakdown available for institutional review.
              </p>
            </div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-semibold rounded-full hover:bg-stone-800 transition-colors text-sm"
            >
              <FileText size={15} /> Download PDF
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
