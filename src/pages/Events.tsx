import { MapPin } from 'lucide-react';

interface EventsProps {
  onNavigate: (page: string) => void;
}

export default function Events({ onNavigate }: EventsProps) {
  const events = [
    {
      title: 'Annual Instrument Drive & Community Concert',
      date: 'June 15, 2026',
      image: 'https://images.pexels.com/photos/164936/pexels-photo-164936.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description:
        "Join us for our signature fundraising event of the year — an afternoon of live performances by student musicians from across South Florida. Browse refurbished instruments, meet our partner educators, and learn how your contribution directly impacts young lives. Light refreshments and a silent auction will follow the concert.",
      location: 'Mizner Park Amphitheatre, 590 Plaza Real, Boca Raton, FL 33432',
    },
    {
      title: 'Strings for Success: Benefit Gala',
      date: 'September 12, 2026',
      image: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description:
        'An elegant evening of orchestral performances, student testimonials, and a seated dinner honoring our most dedicated supporters. Proceeds from the gala will fund string instrument repairs and new instrument purchases for under-resourced school programs in Palm Beach and Broward counties.',
      location: 'The Boca Raton, 501 E Camino Real, Boca Raton, FL 33432',
    },
    {
      title: 'Instrument Donation Drop-Off Day',
      date: 'November 7, 2026',
      image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description:
        'Clean out your closets and make a difference! Bring gently used band and orchestral instruments to our outdoor drive-thru drop-off event. Our volunteer technicians will provide a quick assessment on-site. Every donated instrument gets a second life in the hands of a deserving student.',
      location: 'FAU Bok Tower Gardens, 1151 S Rogers Cir, Boca Raton, FL 33487',
    },
  ];

  return (
    <>
      {/* Page Header */}
      <section className="relative pt-32 pb-20 bg-stone-900 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Community event"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Events</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 max-w-2xl leading-tight">
            Upcoming Events
          </h1>
          <p className="text-stone-300 mt-4 text-lg max-w-xl">
            Join us in making music education accessible to every student.
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="bg-stone-50 py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {events.map((event, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden grid md:grid-cols-2"
            >
              <div className={`relative aspect-[4/3] md:aspect-auto ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                <img
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">
                  {event.date}
                </span>
                <h2 className="text-2xl font-bold text-stone-900 mt-2 mb-4 leading-snug">
                  {event.title}
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                  {event.description}
                </p>
                <div className="flex items-start gap-2.5 text-stone-500 text-sm">
                  <MapPin size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-amber-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Want to host an event with us?
          </h2>
          <p className="text-amber-100 mb-8 text-lg">
            We are always looking for community partners. Reach out to discuss sponsorship, co-hosting, or volunteer opportunities.
          </p>
          <button
            onClick={() => onNavigate('donate')}
            className="px-7 py-3.5 bg-white text-amber-700 font-semibold rounded-full hover:bg-amber-50 transition-colors"
          >
            Support Our Mission
          </button>
        </div>
      </section>
    </>
  );
}
