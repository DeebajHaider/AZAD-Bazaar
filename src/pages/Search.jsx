import React from 'react'
import { ArrowLeft, Search as SearchIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Search() {
  const navigate = useNavigate()

  return (
    <div style={{minHeight:'100vh', background:'var(--color-bg)', color:'var(--color-text-primary)'}}>
      {/* Header */}
      <div style={{position:'sticky', top:0, background:'var(--color-surface)', borderBottom:'1px solid var(--color-border)', padding:'var(--space-2) var(--space-4)', display:'flex', alignItems:'center', gap:'var(--space-3)', zIndex:10}}>
        <button onClick={() => navigate(-1)} style={{padding:'var(--space-1)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-primary)', display:'flex', alignItems:'center'}}>
          <ArrowLeft size={24} />
        </button>
        <div style={{flex:1}}>
          <input
            autoFocus
            type="text"
            placeholder="Search for items..."
            style={{width:'100%', padding:'var(--space-2) var(--space-4)', background:'var(--color-surface-alt)', borderRadius:'var(--radius-md)', color:'var(--color-text-primary)', border:'none', outline:'none', fontSize:'inherit'}}
          />
        </div>
      </div>

      {/* Placeholder for search results */}
      <div style={{padding:'var(--space-4)', textAlign:'center', color:'var(--color-text-muted)'}}>
        Start typing to search...
      </div>
    </div>
  )
}