import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

export default function Address() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div style={{minHeight:'100vh', background:'var(--color-bg)', color:'var(--color-text-primary)'}}>
      {/* Header */}
      <div style={{position:'sticky', top:0, background:'var(--color-surface)', borderBottom:'1px solid var(--color-border)', padding:'var(--space-3) var(--space-4)', display:'flex', alignItems:'center', gap:'var(--space-3)', zIndex:10}}>
        <button onClick={() => navigate(-1)} style={{padding:'var(--space-1)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-primary)', display:'flex', alignItems:'center'}} aria-label={t('addressPage.backButtonAriaLabel')}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{fontSize:'var(--font-size-lg)', fontWeight:600, margin:0, color:'var(--color-text-primary)'}}>{t('addressPage.title')}</h1>
      </div>

      {/* Placeholder for address form */}
      <div style={{padding:'var(--space-4)', textAlign:'center', color:'var(--color-text-muted)'}}>
        {t('addressPage.placeholder')}
      </div>
    </div>
  )
}