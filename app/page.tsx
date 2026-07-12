"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    document.querySelectorAll("section").forEach((section) => {
      section.classList.add("transition-all", "duration-1000", "opacity-0", "translate-y-10");
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* TopNavBar */}
      <nav className="sticky top-0 z-50 bg-surface border-b border-tertiary flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-full">
        <div className="flex items-center gap-2">
          <img alt="BOARDS. Logo" className="h-8 md:h-10 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2blFSvhfS9jHGCBXITovua9NLN6SXNJnqVDMXc9CHOYrjzSyHKGk1G-nSIA7Y-pA8IE5OxPbz97Q4ItVK4bGlq9lrPC-fPD7SteKIuT4T3u-Rpvye8uHZDBc_ZOElnEozIrYHZsTVDzmtwG7qjlgwEnOwk48CHFzu2Uz8bKKXs4zGBZ1iBaWI8Xw2n6H4kErKXEz9UJQbSR2YoV_iFBGvDST0_zMLuobj8XeygXkZ2mX4QSh4FXqa" />
        </div>
        <div className="hidden md:flex items-center gap-10">
          <Link className="font-headline-lg text-body-md text-primary border-b-2 border-primary pb-1" href="/dashboard">Dashboard</Link>
          <Link className="font-headline-lg text-body-md text-on-secondary-fixed-variant hover:text-on-surface transition-colors duration-200" href="/practice">Practice</Link>
          <Link className="font-headline-lg text-body-md text-on-secondary-fixed-variant hover:text-on-surface transition-colors duration-200" href="/progress">Progress</Link>
          <Link className="font-headline-lg text-body-md text-on-secondary-fixed-variant hover:text-on-surface transition-colors duration-200" href="/pricing">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface">notifications</button>
          <Link href="/sign-up" className="bg-primary text-white font-label-caps px-6 py-3 hover:bg-primary-container transition-all active:scale-95 inline-block">START PROJECT</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative grid-pattern min-h-[80vh] flex flex-col justify-center px-margin-mobile md:px-margin-desktop pt-12">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-gutter items-end pb-12 border-b border-tertiary">
          <div className="md:col-span-8">
            <span className="text-primary font-label-caps tracking-widest block mb-4 uppercase">Academic Excellence Studio</span>
            <h1 className="font-display-md md:font-display-lg text-[48px] md:text-display-lg uppercase leading-none mb-6">
              PASS THE NLE.<br />
              <span className="text-primary">YOUR FIRST TAKE.</span>
            </h1>
            <p className="font-body-lg text-secondary max-w-xl mb-12">
              AI-powered practice exams designed for Philippine nursing boards. We bridge the gap between classroom theory and licensure success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link href="/sign-up" className="bg-primary text-on-primary font-headline-lg px-8 py-5 flex items-center gap-4 hover:bg-primary-container transition-all group">
                START FREE PRACTICE
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
              <div className="p-6 bg-on-surface text-surface max-w-xs">
                <p className="font-mono-data text-sm opacity-80 leading-snug">
                  An innovative review platform dedicated to creating striking results for nurses who are fearless in their pursuit of excellence.
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 hidden md:flex flex-col gap-2 items-end justify-end pb-4 font-mono-data text-tertiary">
            <div className="flex gap-4 items-center w-full justify-end border-b border-tertiary/20 py-2">
              <span>{'//01'}</span>
              <div className="flex-grow border-t border-tertiary/20 mx-2"></div>
              <span>Medical-Surgical</span>
            </div>
            <div className="flex gap-4 items-center w-full justify-end border-b border-tertiary/20 py-2">
              <span>{'//02'}</span>
              <div className="flex-grow border-t border-tertiary/20 mx-2"></div>
              <span>Maternal &amp; Child</span>
            </div>
            <div className="flex gap-4 items-center w-full justify-end border-b border-tertiary/20 py-2">
              <span>{'//03'}</span>
              <div className="flex-grow border-t border-tertiary/20 mx-2"></div>
              <span>Community Health</span>
            </div>
            <div className="flex gap-4 items-center w-full justify-end py-2">
              <span>{'//04'}</span>
              <div className="flex-grow border-t border-tertiary/20 mx-2"></div>
              <span>Psychiatric Nursing</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div className="border-l border-tertiary pl-6 py-4">
            <h3 className="font-display-md text-headline-lg-mobile md:text-[48px] leading-none mb-2">5,000+</h3>
            <p className="font-label-caps text-secondary uppercase">Questions Delivered</p>
          </div>
          <div className="border-l border-tertiary pl-6 py-4">
            <h3 className="font-display-md text-headline-lg-mobile md:text-[48px] leading-none mb-2">95%</h3>
            <p className="font-label-caps text-secondary uppercase">Passing Rate</p>
          </div>
          <div className="border-l border-tertiary pl-6 py-4">
            <h3 className="font-display-md text-headline-lg-mobile md:text-[48px] leading-none mb-2">15</h3>
            <p className="font-label-caps text-secondary uppercase">Years Experience</p>
          </div>
          <div className="border-l border-tertiary pl-6 py-4">
            <h3 className="font-display-md text-headline-lg-mobile md:text-[48px] leading-none mb-2">50+</h3>
            <p className="font-label-caps text-secondary uppercase">Nursing Colleges</p>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-primary font-label-caps uppercase mb-2 block">Works</span>
              <h2 className="font-display-md text-headline-lg md:text-display-md uppercase leading-tight">
                ENGINEERED FOR <br /><span className="text-outline text-on-surface">CLINICAL PRECISION</span>
              </h2>
            </div>
            <Link className="hidden md:flex items-center gap-2 font-label-caps text-on-surface hover:text-primary transition-colors" href="#">
              EXPLORE MORE <span className="bg-primary text-white p-1 material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Large Feature Card */}
            <div className="md:col-span-8 bg-on-surface text-surface p-12 flex flex-col justify-between min-h-[500px] border border-secondary transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <span className="font-label-caps text-primary uppercase">Feature 01</span>
                <span className="material-symbols-outlined text-4xl">psychology</span>
              </div>
              <div>
                <h3 className="font-display-md text-headline-lg md:text-display-md uppercase mb-6 leading-none">Adaptive Learning <br />Algorithms</h3>
                <p className="font-body-lg max-w-md opacity-70">
                  Our AI analyzes your performance in real-time, identifying weak areas and adjusting question difficulty to maximize your retention.
                </p>
              </div>
            </div>

            {/* Secondary Card Stack */}
            <div className="md:col-span-4 grid grid-rows-2 gap-gutter">
              <div className="bg-surface border border-tertiary p-8 hover:bg-surface-container transition-colors">
                <img className="w-full h-32 object-cover mb-6 grayscale brightness-90" alt="Medical equipment in a clinical setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD94-PQv_nTWXsaZcnWsCwuWl-yZVwYGI1r6h6ST7vHDGDTRgBgflWgbtGPM-5lMmlZ0j6-H0kerD0evVUM1pD6K-hIQmvQCQxaOph6NKJOSTYSVYIN8kES4vQVVDVYIPWwsyf2kJUf_Inu2MXIZS2MxSvBbqyAz0DFZakkVsyN8r4ewEWehga3dokEvlVkyH1yfibWBBTwa7zOg_iG4ZKQIB44Iumq9qP0LK9_FqtK-N_2pX_2-ksY" />
                <div className="flex justify-between items-center">
                  <h4 className="font-headline-lg uppercase text-xl">Rationale Library</h4>
                  <span className="material-symbols-outlined">north_east</span>
                </div>
              </div>
              <div className="bg-primary text-white p-8 hover:opacity-95 transition-opacity">
                <div className="mb-8">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                </div>
                <h4 className="font-headline-lg uppercase text-xl mb-2">Progress Tracking</h4>
                <p className="font-body-md opacity-80">Detailed metrics of your mastery level across all five NLE NP segments.</p>
              </div>
            </div>

            {/* Three smaller cards */}
            <div className="md:col-span-4 bg-surface border border-tertiary p-6 h-64 flex flex-col justify-end group">
              <div className="flex justify-between items-end">
                <h5 className="font-headline-lg uppercase text-lg">Simulated Board Environment</h5>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </div>
            <div className="md:col-span-4 bg-tertiary text-white p-6 h-64 flex flex-col justify-end group">
              <div className="flex justify-between items-end">
                <h5 className="font-headline-lg uppercase text-lg">Expert-Verified Item Banks</h5>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </div>
            <div className="md:col-span-4 bg-surface border border-tertiary p-6 h-64 flex flex-col justify-end group">
              <div className="flex justify-between items-end">
                <h5 className="font-headline-lg uppercase text-lg">Focus Mode Interface</h5>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-7xl mx-auto">
          <span className="text-primary font-label-caps uppercase mb-2 block text-center">The Methodology</span>
          <h2 className="font-display-md text-headline-lg md:text-display-md uppercase text-center mb-20">HOW IT <span className="text-primary">WORKS</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 border-y border-tertiary">
            <div className="p-12 md:border-r border-tertiary group hover:bg-on-surface hover:text-surface transition-all duration-500">
              <span className="font-display-md text-headline-lg text-outline text-on-surface group-hover:text-surface mb-8 block transition-colors">01</span>
              <h3 className="font-headline-lg uppercase mb-4">CHOOSE AREA</h3>
              <p className="font-body-md opacity-60">Select from NP 1-5 or specific sub-categories like Pharmacology or Nursing Research.</p>
            </div>
            <div className="p-12 md:border-r border-tertiary group hover:bg-primary hover:text-surface transition-all duration-500">
              <span className="font-display-md text-headline-lg text-outline text-on-surface group-hover:text-surface mb-8 block transition-colors">02</span>
              <h3 className="font-headline-lg uppercase mb-4">ANSWER &amp; REVIEW</h3>
              <p className="font-body-md opacity-60">Practice with timed mock boards. Receive instant rationales for every single option provided.</p>
            </div>
            <div className="p-12 group hover:bg-on-surface hover:text-surface transition-all duration-500">
              <span className="font-display-md text-headline-lg text-outline text-on-surface group-hover:text-surface mb-8 block transition-colors">03</span>
              <h3 className="font-headline-lg uppercase mb-4">TRACK PERFORMANCE</h3>
              <p className="font-body-md opacity-60">Visualize your growth. Identify specific competencies that require further review before exam day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-highest">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-4">
            <h2 className="font-display-md text-headline-lg md:text-display-md uppercase leading-none mb-8">INVEST IN YOUR <span className="text-primary">LICENSE</span></h2>
            <p className="font-body-lg text-secondary mb-12">No hidden fees. Just premium content designed to get you registered.</p>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            {/* Monthly Plan */}
            <div className="bg-surface p-12 border border-tertiary relative overflow-hidden group">
              <div className="relative z-10">
                <span className="font-label-caps text-secondary uppercase mb-8 block">Subscription</span>
                <h3 className="font-headline-lg uppercase text-3xl mb-2">MONTHLY</h3>
                <p className="font-display-md text-headline-lg text-primary leading-none mb-8">₱349</p>
                <ul className="space-y-4 mb-12 font-mono-data text-sm">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Unlimited Questions</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> All NP Categories</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Performance Dashboard</li>
                </ul>
                <Link href="/sign-up" className="block w-full border-2 border-on-surface py-4 font-headline-lg uppercase text-center hover:bg-on-surface hover:text-surface transition-colors">Subscribe</Link>
              </div>
            </div>

            {/* Final Push Plan */}
            <div className="bg-on-surface text-surface p-12 border border-secondary relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-primary text-white font-label-caps px-3 py-1 text-[10px] uppercase">Recommended</div>
              <div className="relative z-10">
                <span className="font-label-caps text-secondary-fixed-dim uppercase mb-8 block">Full Review</span>
                <h3 className="font-headline-lg uppercase text-3xl mb-2">FINAL PUSH</h3>
                <p className="font-display-md text-headline-lg text-primary leading-none mb-8">₱799</p>
                <ul className="space-y-4 mb-12 font-mono-data text-sm">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> 3-Month Access</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Predictive Exam Score</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check</span> Priority Content Updates</li>
                </ul>
                <Link href="/sign-up" className="block w-full bg-primary py-4 font-headline-lg uppercase text-center hover:bg-primary-container transition-colors">Start Review</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-tertiary px-margin-mobile md:px-margin-desktop py-section-gap w-full text-on-primary">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <img alt="BOARDS. Logo" className="h-12 w-auto brightness-0 invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2blFSvhfS9jHGCBXITovua9NLN6SXNJnqVDMXc9CHOYrjzSyHKGk1G-nSIA7Y-pA8IE5OxPbz97Q4ItVK4bGlq9lrPC-fPD7SteKIuT4T3u-Rpvye8uHZDBc_ZOElnEozIrYHZsTVDzmtwG7qjlgwEnOwk48CHFzu2Uz8bKKXs4zGBZ1iBaWI8Xw2n6H4kErKXEz9UJQbSR2YoV_iFBGvDST0_zMLuobj8XeygXkZ2mX4QSh4FXqa" />
            </div>
            <p className="font-body-md text-secondary-fixed-dim max-w-sm">
              Empowering the next generation of Filipino nurses through cutting-edge technology and pedagogical excellence.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-primary-fixed uppercase tracking-widest mb-2">Quick Links</span>
            <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">About Us</Link>
            <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">Curriculum</Link>
            <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">Contact Support</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-primary-fixed uppercase tracking-widest mb-2">Legal</span>
            <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">Privacy Policy</Link>
            <Link className="font-body-md text-secondary-fixed-dim hover:text-primary-fixed-dim transition-colors duration-300" href="#">Terms of Service</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-tertiary/20 flex flex-col md:flex-row justify-between gap-4">
          <p className="font-body-md text-tertiary-fixed-dim text-sm">© 2024 BOARDS. Nursing Excellence Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="material-symbols-outlined text-secondary-fixed-dim hover:text-white transition-colors">brand_facebook</button>
            <button className="material-symbols-outlined text-secondary-fixed-dim hover:text-white transition-colors">brand_linkedin</button>
            <button className="material-symbols-outlined text-secondary-fixed-dim hover:text-white transition-colors">alternate_email</button>
          </div>
        </div>
      </footer>
    </>
  );
}
