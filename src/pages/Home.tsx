import { ArrowRight, Music, Heart, School } from 'lucide-react';
import mainHero from '../assets/images/MainHomePage.jpg';
import fienbergFisher from '../assets/images/logos/fienberg-fisher-k8-center.jpg';
import miamiArts from '../assets/images/logos/miami-arts-charter-academy.webp';
import miamiBeach from '../assets/images/logos/miami-beach-senior-high.png';
import nautilus from '../assets/images/logos/nautilus-middle-school.png';
import southPointe from '../assets/images/logos/south-pointe-elementary.jpg';
import youngMens from '../assets/images/logos/young-mens-preparatory-academy.png';
import northBeach from '../assets/images/logos/north-beach-elementary.png';
import dreamMachine from '../assets/images/logos/DreamMachine.png';
import jam from '../assets/images/logos/Jam.png';
import lincolnRd from '../assets/images/logos/LincolnRD.png';
import makerfaire from '../assets/images/logos/MakerFaire.png';
import wynwoodSOM from '../assets/images/logos/WynwoodSOM.png';
import mmp from '../assets/images/logos/mmp.png';
import ymu from '../assets/images/logos/ymu.png';
import mdps from '../assets/images/logos/MDPS.png';
import adl from '../assets/images/logos/ADLLOGO.png';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const stats = [
    { value: '20+', label: 'Instruments Donated' },
    { value: '$35k+', label: 'Funds Invested in Programs' },
    { value: '1K+', label: 'Students Supported' },
  ];

  const features = [
    {
      icon: <Music size={22} className="text-amber-600" />,
      title: 'Connect and Build Arts Communities',
      desc: 'Artists, nonprofits, and communities are brought together through collaborative events, performances, and networking opportunities.',
    },
    {
      icon: <Heart size={22} className="text-amber-600" />,
      title: 'Support and Strengthen Music Programs',
      desc: 'Sustainable music programs are developed by modernizing ensembles through technology, upgraded equipment, and expanded performance opportunities.',
    },
    {
      icon: <School size={22} className="text-amber-600" />,
      title: 'Partnerships',
      desc: 'Partnerships are established with schools to provide high-quality afterschool programs where students are given the space and support to fully explore and develop their passions.',
    },
  ];

  const schools = [
    { name: 'Fienberg Fisher K-8 Center', logo: fienbergFisher },
    { name: 'Miami Arts Charter Academy', logo: miamiArts },
    { name: 'Miami Beach Senior High School', logo: miamiBeach },
    { name: 'Nautilus Middle School', logo: nautilus },
    { name: 'South Pointe Elementary', logo: southPointe },
    { name: "Young Men's Preparatory Academy", logo: youngMens },
    { name: 'North Beach Elementary', logo: northBeach },
    { name: 'Dream Machine', logo: dreamMachine },
    { name: 'FIU Jam Collective', logo: jam },
    { name: 'Lincoln Road', logo: lincolnRd },
    { name: 'Maker Faire', logo: makerfaire },
    { name: 'Wynwood School of Music', logo: wynwoodSOM },
    { name: 'MMP', logo: mmp },
    { name: 'YMU', logo: ymu },
    { name: 'Miami Dade Public Schools', logo: mdps },
    { name: 'Anti-Defamation League', logo: adl },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={mainHero}
            alt="Student playing violin"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/60 to-stone-900/20" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-40">
          <div className="max-w-2xl">
            <span className="inline-block text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6 border border-amber-400/40 rounded-full px-4 py-1.5">
              501(c)(3) Non-Profit Organization
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Where arts education, opportunity, and community come together.
            </h1>
            <p className="text-lg text-stone-300 leading-relaxed mb-10 max-w-lg">
              Providing instruments and musical education support to students who need it most.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('donate')}
                className="px-7 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2"
              >
                Donate an Instrument <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate('donate')}
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/30 transition-colors backdrop-blur-sm"
              >
                Support Our Mission
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* Impact Stats */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`px-10 py-12 text-center ${
                  i < stats.length - 1 ? 'border-b md:border-b-0 md:border-r border-stone-100' : ''
                }`}
              >
                <div className="text-4xl md:text-5xl font-bold text-stone-900 mb-3">{stat.value}</div>
                <div className="text-sm text-stone-500 font-medium tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Brief */}
      <section className="bg-stone-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mt-3 mb-6 leading-snug">
                Stronger arts communities are built through connection and collaboration
              </h2>
              <p className="text-stone-600 leading-relaxed mb-8 text-lg">
                The South Florida Arts Foundation expands access to arts education by supporting and modernizing arts programs while providing instruments and resources to students. Through performance opportunities and collaboration, it connects artists, schools, and nonprofits to build a stronger, more unified arts community.
              </p>
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:gap-3 transition-all"
              >
                Read Our Story <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {features.map((f, i) => (
                <div key={i} className="flex gap-5 p-6 bg-white rounded-xl border border-stone-100 hover:border-amber-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-1">{f.title}</h3>
                    <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Collaborating Schools */}
      <section className="bg-stone-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest block text-center">Our Network</span>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mt-3 mb-12 text-center">
            Organizations Collaborated With
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 items-center">
            {schools.map((school) => (
              <div key={school.name} className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 bg-white rounded-xl border border-stone-100 hover:border-amber-200 transition-all">
                <div className="w-full h-16 sm:h-20 md:h-24 flex items-center justify-center">
                  <img src={school.logo} alt={school.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-xs sm:text-sm text-stone-600 font-medium text-center leading-tight">{school.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-amber-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to make a difference?
          </h2>
          <p className="text-amber-100 mb-8 text-lg">
            Whether you have an instrument gathering dust or wish to make a financial contribution, your generosity changes lives.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('donate')}
              className="px-7 py-3.5 bg-white text-amber-700 font-semibold rounded-full hover:bg-amber-50 transition-colors"
            >
              Make a Contribution
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="px-7 py-3.5 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
