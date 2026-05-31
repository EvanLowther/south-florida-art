import { MapPin } from 'lucide-react';
import WinterShowcase1 from '../assets/images/WinterShowcase1.jpg';
import SpringShowcase1 from '../assets/images/SpringShowcase1.jpg';
import BOB1 from '../assets/images/BOB1.jpg';
import YMF1 from '../assets/images/YMF1.jpeg';
import EventsMain from '../assets/images/EventsMain.jpg';

export default function Events() {
  const events = [
    {
      title: 'FIU Battle of the Bands 2026',
      date: 'March 28, 2026',
      image: BOB1,
      description:
        'Florida International University\'s annual battle of the bands competition, co-presented by the South Florida Arts Foundation. Student bands compete for studio time, equipment grants, and the chance to perform at our summer concert series.',
      location: 'Parkview Turf, 11200 SW 8th St, Miami, FL 33199',
    },
    {
      title: 'Miami Beach Spring Arts Showcase 2025',
      date: 'April 26, 2025',
      image: SpringShowcase1,
      description:
        'A vibrant spring celebration of music, dance, and visual arts featuring students from Miami Beach public schools. Proceeds from the event supported continued arts programming and instrument maintenance for the following academic year.',
      location: '660 Lincoln Rd, Miami Beach, FL 33139',
    },
    {
      title: 'Miami Beach Winter Showcase 2025',
      date: 'January 18, 2025',
      image: WinterShowcase1,
      description:
        'An afternoon of winter-themed performances by student musicians from Miami Beach-area schools. The showcase highlighted the impact of our instrument donation program and featured special guest artists from the South Florida music community.',
      location: '660 Lincoln Rd, Miami Beach, FL 33139',
    },
    {
      title: 'Youth Music Festival 2023/2024',
      date: '2023–2024 Season',
      image: YMF1,
      description:
        'The Miami Beach Youth Music Festival is an annual community event showcasing the musical talents of young, local South Florida artists. Hosted by the City of Miami Beach, the festival highlights students and young bands performing everything from rock and pop to jazz and classical music.',
      location: '7275 Collins Avenue, Miami Beach, FL 33141',
    },
  ];

  return (
    <>
      {/* Page Header */}
      <section className="relative pt-32 pb-20 bg-stone-900 overflow-hidden">
        <img
          src={EventsMain}
          alt="Community event"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Events & Programs</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 max-w-2xl leading-tight">
            Events & Programs
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
    </>
  );
}
