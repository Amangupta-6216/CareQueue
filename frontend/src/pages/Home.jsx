import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, Heart, Activity, UserCheck, ShieldCheck, 
  Calendar, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';

const services = [
  {
    name: 'General Consultation',
    desc: 'Comprehensive health assessments, routine check-ups, and personalized treatment planning with dedicated physicians.',
    icon: Stethoscope
  },
  {
    name: 'Cardiology Care',
    desc: 'Advanced cardiovascular health checkups, ECG monitoring, and preventative heart care with specialized cardiologists.',
    icon: Heart
  },
  {
    name: 'Pediatric Health',
    desc: 'Gentle, comforting medical attention for infants, children, and teenagers in a calm, welcoming environment.',
    icon: Activity
  },
  {
    name: 'Dermatology & Skin Care',
    desc: 'Specialized clinical dermatology covering skin health, allergies, routine screenings, and restorative care.',
    icon: UserCheck
  },
  {
    name: 'Orthopedic Consults',
    desc: 'Expert care for bones, joints, and muscular health to restore natural movement and alleviate pain.',
    icon: ShieldCheck
  },
  {
    name: 'ENT & Specialist Care',
    desc: 'Focused diagnoses and treatments for ear, nose, throat, and sinus conditions with leading clinical specialists.',
    icon: Stethoscope
  }
];

export const Home = () => {
  return (
    <div className="w-full flex flex-col bg-[#FAF8F5] text-slate-900 font-sans selection:bg-[#FAD4D4] selection:text-slate-900">
      
      {/* 1. HERO SECTION (Pure Vector Design Behind) */}
      <section className="relative w-full min-h-[82vh] flex items-center justify-center text-center overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#FFF5F5] to-white py-24 sm:py-32 px-6">
        {/* Subtle Geometric Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#FAD4D4]/35 via-[#FDF0F2]/70 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-80 h-80 bg-[#F6B2B2]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-96 h-96 bg-[#FAF0F0]/70 rounded-full blur-3xl pointer-events-none" />
        
        {/* Delicate Medical Cross Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="medical-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M24 16v16M16 24h16" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medical-grid)" />
        </svg>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center space-y-6">

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight flex flex-col items-center gap-1 sm:gap-2">
            <span>Less Waiting.</span>
            <span className="text-[#D87070]">More Healing.</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
            Modern clinical care focused on comfort, precision, and respectful treatment that makes every doctor visit stress-free.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-md transform hover:-translate-y-0.5"
            >
              Book Appointment
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-6 py-3.5 rounded-xl text-sm shadow-sm transition-colors"
            >
              Doctor & Staff Login
            </Link>
          </div>

          {/* Clinical Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-Time Live Queue
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Senior & Emergency Priority
            </span>
          </div>
        </div>
      </section>


      {/* 2. OUR MEDICAL SERVICES SECTION */}
      <section id="our-services" className="w-full bg-white py-20 sm:py-28 px-6 lg:px-12 border-y border-slate-100">
        <div className="max-w-6xl mx-auto space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#E08585]">
              Specialized Care
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Our Medical Services
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Personalized treatments tailored to each patient's individual comfort and well-being.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div 
                  key={idx} 
                  className="p-8 rounded-3xl border border-slate-200/80 hover:border-[#F6B2B2] bg-white hover:shadow-xl hover:shadow-[#F6B2B2]/10 transition-all duration-300 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FDF0F2] text-[#D87070] flex items-center justify-center shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{svc.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {svc.desc}
                    </p>
                  </div>

                  <Link
                    to="/register"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#D87070] hover:text-[#B55050] transition-colors"
                  >
                    <span>Book Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* 3. ABOUT US PILLARS */}
      <section id="about-us" className="w-full bg-[#FAF9F6] py-20 sm:py-28 px-6 lg:px-12 border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[#E08585]">
              Why Choose CareQueue
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
              A healthcare experience built around patient comfort & zero waiting.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We reimagined clinical visits from the ground up. By blending certified clinical specialists with real-time digital scheduling, we eliminate crowded waiting rooms so you can focus completely on your health.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-slate-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No long waiting rooms:</strong> Arrive right on time with smart queue updates.</span>
              </div>
              <div className="flex items-start space-x-3 text-slate-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Board-certified doctors:</strong> Thorough examinations with unhurried care.</span>
              </div>
              <div className="flex items-start space-x-3 text-slate-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Emergency & senior fast-track:</strong> Prompt attention for those who need it most.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">99%</div>
              <div className="text-xs text-slate-500 font-medium">Patient Satisfaction Rate</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#D87070]">&lt; 15m</div>
              <div className="text-xs text-slate-500 font-medium">Average Visit Wait Time</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">6+</div>
              <div className="text-xs text-slate-500 font-medium">Specialized Departments</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">24/7</div>
              <div className="text-xs text-slate-500 font-medium">Emergency Triage Access</div>
            </div>
          </div>
        </div>
      </section>


      {/* 4. READY FOR YOUR NEXT VISIT? CTA BANNER */}
      <section className="relative w-full py-24 sm:py-28 px-6 flex items-center justify-center text-center overflow-hidden bg-gradient-to-r from-[#FAF8F5] via-[#FDF0F2] to-[#FAF8F5] border-b border-[#F6B2B2]/40">
        {/* Concentric vector circles & ambient blush glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-[#F6B2B2]/25 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#F6B2B2]/15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FAD4D4]/35 rounded-full blur-3xl pointer-events-none" />

        {/* CTA Content */}
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center space-y-5">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Ready for your next visit?
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed sm:whitespace-nowrap">
            Book your appointment online – it's quick, easy, and takes less than a minute.
          </p>

          <div className="pt-2">
            <Link
              to="/register"
              className="bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-md transform hover:-translate-y-0.5 inline-block"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </section>


      {/* 5. FULL FOOTER */}
      <footer id="contact-us" className="w-full bg-[#18181B] text-white py-16 px-6 lg:px-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-16 items-start pb-12 border-b border-slate-800/80">
            
            {/* Column 1: Brand & Motto */}
            <div className="space-y-3 md:col-span-1">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                CareQueue
              </h3>
              <p className="text-slate-400 text-sm font-normal">
                Gentle care. Confident smiles.
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Navigation:
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">Home</Link>
                </li>
                <li>
                  <a href="#our-services" className="hover:text-white transition-colors">Our Services</a>
                </li>
                <li>
                  <a href="#about-us" className="hover:text-white transition-colors">About Us</a>
                </li>
                <li>
                  <a href="#contact-us" className="hover:text-white transition-colors">Contact Us</a>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Hours (Indian Phone Code) */}
            <div className="space-y-3 md:col-span-1">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Get in touch:
              </h4>
              <div className="space-y-1.5 text-sm text-slate-400">
                <div>
                  <a href="tel:+919876543210" className="text-white hover:underline font-medium">
                    +91 98765 43210
                  </a>
                </div>
                <div>
                  <a href="mailto:hello@carequeue.hospital" className="hover:text-white transition-colors">
                    hello@carequeue.hospital
                  </a>
                </div>
                <div className="pt-1 text-slate-400">
                  Mon – Fri: 8:00 AM – 7:00 PM
                </div>
              </div>
            </div>

            {/* Column 4: Secondary Book CTA */}
            <div className="flex md:justify-end items-end h-full">
              <Link
                to="/register"
                className="bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-semibold px-6 py-2.5 rounded-lg text-sm transition-all shadow-md inline-block text-center"
              >
                Book Appointment
              </Link>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              &copy; {new Date().getFullYear()} CareQueue. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link to="/login" className="hover:text-slate-400 transition-colors">Staff Portal</Link>
              <Link to="/register" className="hover:text-slate-400 transition-colors">Patient Portal</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;
