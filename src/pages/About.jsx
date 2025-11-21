import React from 'react'
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import BottomNav from '../component/BottomNav'
import { useI18n } from '../context/I18nContext'
import { Code, Bug, Heart, Github, User, ShieldCheck } from 'lucide-react'

// --- Helper Component: Avatar ---
// Generates a colorful circle with initials based on the name
const Avatar = ({ name, type }) => {
  const initials = name.slice(0, 2).toUpperCase();
  
  // vary styles based on type using your CSS variables
  let bgClass = "secBg border border-gray-200 dark:border-slate-700";
  let textClass = "secText";

  if (type === 'lead') {
    bgClass = "accentPrimBg"; 
    textClass = "text-white";
  } else if (type === 'dev') {
    bgClass = "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800";
    textClass = "accentPrimText";
  } else {
    bgClass = "bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800";
    textClass = "accentSuccessText";
  }

  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${bgClass} ${textClass}`}>
      {initials}
    </div>
  );
};

// --- Helper Component: Developer Card ---
const DevCard = ({ name, role, type, icon: Icon }) => (
  <div className={`card flex items-center gap-4 transition-all duration-200 ${type === 'lead' ? 'border-l-4 border-l-blue-500 dark:border-l-blue-400 shadow-md' : ''}`}>
    <Avatar name={name} type={type} />
    <div className="flex-1 min-w-0">
      <h3 className="font-bold primText text-lg truncate">{name}</h3>
      <div className="flex items-center gap-1.5">
        <Icon size={14} className={type === 'lead' ? 'accentPrimText' : 'secText'} />
        <p className="text-sm secText font-medium">{role}</p>
      </div>
    </div>
    {/* {type === 'lead' && <div className="badgePrimary text-[10px] py-0.5 px-2 uppercase tracking-wider">Lead</div>} */}
  </div>
);

// --- Helper Component: Tester Row ---
const TesterRow = ({ name }) => (
  <div className="flex items-center justify-between p-3 rounded-lg secHoverBg transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
        <ShieldCheck size={14} className="secText" />
      </div>
      <span className="font-medium primText">{name}</span>
    </div>
    <span className="badgeSuccess text-[10px] py-0.5 px-2">QA Team</span>
  </div>
);

export default function About() {
  const { t } = useI18n()

  // Hardcoded Data (Wrapped in memo or defined outside if static, 
  // but here inside to access 't' if you want to translate roles later)
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
      <main className="flex-1 overflow-y-auto primBg min-h-full">
        <div className="max-w-[430px] mx-auto p-4 space-y-6">
          
          {/* 1. Intro Section - Sets the tone */}
          <section className="text-center space-y-2 py-2">
            <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center rotate-3 mb-2">
              <Heart className="accentPrimText fill-current" size={32} />
            </div>
            <h1 className="text-2xl font-bold primText">
              {t('about.heading') || "Built with Passion"}
            </h1>
            <p className="text-sm secText max-w-[280px] mx-auto leading-relaxed">
              {t('about.description') || "Crafted to provide the best shopping experience with a focus on accessibility and speed."}
            </p>
          </section>

          {/* 2. Engineering Team Section */}
          <section className="space-y-3 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <Code size={18} className="accentPrimText" />
              <h2 className="font-semibold primText text-sm uppercase tracking-wide opacity-80">
                {t('about.engineering') || "Engineering"}
              </h2>
            </div>

            {/* Lead Dev - Prominent Card */}
            <DevCard name={leadDev.name} role={leadDev.role} type={leadDev.type} icon={Code} />

            {/* Co-Devs - Grid Layout for variety */}
            <div className="grid grid-cols-1 gap-3 pt-1">
              {sideDevs.map((dev) => (
                <DevCard key={dev.name} name={dev.name} role={dev.role} type={dev.type} icon={Github} />
              ))}
            </div>
          </section>

          {/* 3. QA / Testers Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-2 pt-2">
              <Bug size={18} className="accentSuccessText" />
              <h2 className="font-semibold primText text-sm uppercase tracking-wide opacity-80">
                {t('about.qa') || "Quality Assurance"}
              </h2>
            </div>
            
            {/* List container with divider borders */}
            <div className="secBg primBorder rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-slate-800">
              {testers.map((name) => (
                <TesterRow key={name} name={name} />
              ))}
            </div>
            
            <p className="text-xs secText text-center pt-2 italic">
              {t('about.thanks') || "Special thanks to our testers for breaking things so we could fix them."}
            </p>
          </section>

        </div>
      </main>
    </Layout>
  )
}