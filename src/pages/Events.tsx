import { MapPin } from 'lucide-react';
import WinterShowcase1 from '../assets/images/WinterShowcase1.jpg';
import SpringShowcase1 from '../assets/images/SpringShowcase1.jpg';
import BOB1 from '../assets/images/BOB1.jpg';
import YMF1 from '../assets/images/YMF1.jpeg';
import EventsMain from '../assets/images/EventsMain.jpg';
import makerfair from '../assets/images/makerfair.jpg';
import miamiGardens from '../assets/images/miami-gardens.jpg';
import southDade from '../assets/images/south-dade.jpg';

export default function Events() {
  const events = [
    {
      title: 'Maker Faire Miami',
      date: 'April, Annually',
      image: makerfair,
      description:
        'An interactive showcase of invention, creativity, and resourcefulness. Maker Faire Miami brings together tech enthusiasts, artists, engineers, and students to exhibit DIY projects, robotics, interactive installations, and hands-on workshops. A family-friendly event celebrating the maker spirit and STEM education.',
      location: '10901 SW 24th St, Miami, FL 33165',
    },
    {
      title: 'South Dade Youth Music Festival',
      date: 'March, Annually',
      image: southDade,
      description:
        'The South Dade Youth Music Festival brings together student musicians from across South Dade County for a day of live performances, workshops, and collaborative showcases. From classical ensembles to modern bands, the event highlights the rich musical diversity of the region\'s youth.',
      location: 'South Dade, FL',
    },
    {
      title: 'Miami Gardens Youth Music Festival',
      date: 'February, Annually',
      image: miamiGardens,
      description:
        'A high-energy celebration of young musical talent from the Miami Gardens community. Featuring student bands, solo performers, and ensemble acts spanning hip-hop, jazz, gospel, and Latin rhythms, the festival provides a platform for emerging artists to share their craft with the community.',
      location: 'Miami Gardens, FL',
    },
    {
      title: 'FIU Battle of the Bands',
      date: 'Fall, Spring, Annually',
      image: BOB1,
      description:
        'Florida International University\'s annual battle of the bands competition, co-presented by the South Florida Arts Foundation. Student bands compete for studio time, equipment grants, and the chance to perform at our Miami Beach showcases.',
      location: 'Parkview Turf, 11200 SW 8th St, Miami, FL 33199',
    },
    {
      title: 'Miami Beach Schools Spring Arts Showcase',
      date: 'March, Annually',
      image: SpringShowcase1,
      description:
        'A vibrant spring celebration of music, dance, and visual arts featuring students from Miami Beach public schools. Proceeds from the event supported continued arts programming and instrument maintenance for the following academic year.',
      location: '660 Lincoln Rd, Miami Beach, FL 33139',
    },
    {
      title: 'Miami Beach Schools Holiday Showcase',
      date: 'December, Annually',
      image: WinterShowcase1,
      description:
        'An afternoon of winter-themed performances by student musicians from Miami Beach-area schools. The showcase highlighted the impact of our instrument donation program and featured special guest artists from the South Florida music community.',
      location: '660 Lincoln Rd, Miami Beach, FL 33139',
    },
    {
      title: 'Miami Beach Youth Music Festival',
      date: 'March, Annually',
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
