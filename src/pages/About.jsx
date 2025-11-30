import React from 'react'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import { useI18n } from '../context/I18nContext'
import { Code, Bug, Heart, Github, ShieldCheck } from 'lucide-react'

// --- Helper Component: Avatar ---
// MD3: Uses different container colors to distinguish roles visually
const Avatar = ({ name, type }) => {
  const initials = name.slice(0, 2).toUpperCase();
  
  let bgClass, textClass;

  if (type === 'lead') {
    // Lead: Primary color (High Prominence)
    bgClass = "bg-md-primary"; 
    textClass = "text-md-on-primary";
  } else if (type === 'dev') {
    // Devs: Secondary Container (Medium Prominence)
    bgClass = "bg-md-secondary-container";
    textClass = "text-md-on-secondary-container";
  } else {
    // Others: Surface Container Highest (Low Prominence)
    bgClass = "bg-md-surface-container-highest";
    textClass = "text-md-on-surface-variant";
  }

  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${bgClass} ${textClass}`}>
      {initials}
    </div>
  );
};

// --- Helper Component: Developer Card ---
// MD3: Surface Container for the card background
const DevCard = ({ name, role, type, icon: Icon }) => (
  <div className={`
    flex items-center gap-4 p-4 rounded-md transition-all duration-200
    bg-md-surface-container hover:bg-md-surface-container-high
    ${type === 'lead' ? 'border-l-4 border-l-md-primary shadow-sm' : 'border border-transparent'}
  `}>
    <Avatar name={name} type={type} />
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-md-on-surface text-lg truncate">{name}</h3>
      <div className="flex items-center gap-1.5 mt-0.5">
        <Icon size={14} className={type === 'lead' ? 'text-md-primary' : 'text-md-on-surface-variant'} />
        <p className="text-sm text-md-on-surface-variant font-medium">{role}</p>
      </div>
    </div>
  </div>
);

// --- Helper Component: Tester Row ---
const TesterRow = ({ name }) => (
  <div className="flex items-center justify-between p-3 hover:bg-md-surface-container-highest/50 transition-colors">
    <div className="flex items-center gap-3">
      {/* Icon Container: Surface Container Highest */}
      <div className="w-8 h-8 rounded-full bg-md-surface-container-highest flex items-center justify-center">
        <ShieldCheck size={14} className="text-md-on-surface-variant" />
      </div>
      <span className="font-medium text-md-on-surface">{name}</span>
    </div>
    {/* Badge: Tertiary Container (distinct from Primary/Secondary roles above) */}
    <span className="text-[10px] py-0.5 px-2 rounded-md bg-md-tertiary-container text-md-on-tertiary-container font-bold uppercase tracking-wider">
      QA Team
    </span>
  </div>
);

export default function About() {
  const { t } = useI18n()

  const leadDev = { name: "Abdul Wasay Imran", role: "Lead Developer", type: "lead" };
  const sideDevs = [
    { name: "Deebaj Kazmi", role: "Core Contributor", type: "dev" },
    { name: "Zuhair Farhan", role: "Core Contributor", type: "dev" },
  ];
  const testers = ["Talha Shahid", "Saad Imad", "Mohib Ali"];

  return (
    <Layout
      header={<HeaderWithName title={t('about.title') || "About & Contributors"} to="/settings" />}
      footer={<BottomNav />}
    >
      <main className="flex-1 overflow-y-auto bg-md-surface min-h-full">
        <div className="max-w-[430px] mx-auto p-4 space-y-6">
          
          {/* 1. Intro Section */}
          <section className="text-center space-y-2 py-4">
            {/* Logo/Icon Container: Primary Container */}
            <div className="w-16 h-16 mx-auto bg-md-primary-container rounded-2xl flex items-center justify-center rotate-3 mb-3 shadow-sm">
              <Heart className="text-md-on-primary-container fill-current" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-md-on-surface">
              {t('about.heading') || "Built with Passion"}
            </h1>
            <p className="text-sm text-md-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
              {t('about.description') || "Crafted to provide the best shopping experience with a focus on accessibility and speed."}
            </p>
          </section>

          {/* 2. Engineering Team Section */}
          <section className="space-y-3 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Code size={18} className="text-md-primary" />
              <h2 className="font-semibold text-md-on-surface text-sm uppercase tracking-wide opacity-80">
                {t('about.engineering') || "Engineering"}
              </h2>
            </div>

            {/* Lead Dev */}
            <DevCard name={leadDev.name} role={leadDev.role} type={leadDev.type} icon={Code} />

            {/* Co-Devs */}
            <div className="grid grid-cols-1 gap-3 pt-1">
              {sideDevs.map((dev) => (
                <DevCard key={dev.name} name={dev.name} role={dev.role} type={dev.type} icon={Github} />
              ))}
            </div>
          </section>

          {/* 3. QA / Testers Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-2 pt-2 px-1">
              <Bug size={18} className="text-md-tertiary" />
              <h2 className="font-semibold text-md-on-surface text-sm uppercase tracking-wide opacity-80">
                {t('about.qa') || "Quality Assurance"}
              </h2>
            </div>
            
            {/* List container: Surface Container with Outline Variant dividers */}
            <div className="bg-md-surface-container rounded-md overflow-hidden border border-md-outline-variant/50 divide-y divide-md-outline-variant/50">
              {testers.map((name) => (
                <TesterRow key={name} name={name} />
              ))}
            </div>
            
            <p className="text-xs text-md-on-surface-variant/70 text-center pt-2 italic">
              {t('about.thanks') || "Special thanks to our testers for breaking things so we could fix them."}
            </p>
          </section>

        </div>
      </main>
    </Layout>
  )
}