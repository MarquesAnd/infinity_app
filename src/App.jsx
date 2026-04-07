import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";

// ─── SUPABASE ───
const SUPABASE_URL = "https://yresgunnnazzjexbajyk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZXNndW5ubmF6empleGJhanlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI4MzcsImV4cCI6MjA5MTEwODgzN30.ve_S3ji2mYOYycr6MizRKMzeHnNqBK-o5TiPc9Qymy0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── ICONS ───
const Icon = ({ name, size = 20 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    wallet: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="15" rx="2"/><path d="M16 12h.01"/><path d="M2 10h20"/></svg>,
    cart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    whatsapp: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    arrow_up: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>,
    arrow_down: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    infinity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/></svg>,
    tag: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  };
  return icons[name] || null;
};

// ─── CSS ───
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@400;500;600;700&display=swap');
:root {
  --cream:#FAF7F2; --beige:#F0EBE3; --sand:#E8E0D5; --warm-gray:#C4BAA8;
  --taupe:#9C8E7C; --brown:#6B5B4E; --dark:#3D3229; --accent:#B8926A;
  --accent-light:#D4B896; --success:#7BA387; --danger:#C4716C; --warning:#D4A843;
  --white:#FFFFFF; --shadow-sm:0 1px 3px rgba(61,50,41,.06);
  --shadow-md:0 4px 16px rgba(61,50,41,.08); --shadow-lg:0 8px 32px rgba(61,50,41,.12);
  --radius:16px; --radius-sm:10px; --radius-xs:8px;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--dark);}
@keyframes fadeScaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes expandIn{from{opacity:0;transform:scale(0.9) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.anim-fade{animation:fadeScaleIn 0.4s cubic-bezier(.22,1,.36,1) both;}
.anim-slide{animation:slideUp 0.45s cubic-bezier(.22,1,.36,1) both;}
.anim-expand{animation:expandIn 0.5s cubic-bezier(.22,1,.36,1) both;}
.btn-press{transition:all .15s ease;cursor:pointer;user-select:none;}
.btn-press:active{transform:scale(0.96);}
.btn-press:hover{filter:brightness(0.97);}
.card{background:var(--white);border-radius:var(--radius);box-shadow:var(--shadow-sm);transition:all .3s ease;border:1px solid rgba(200,190,175,.25);}
.card:hover{box-shadow:var(--shadow-md);}
input,select,textarea{font-family:'DM Sans',sans-serif;border:1.5px solid var(--sand);border-radius:var(--radius-xs);padding:10px 14px;font-size:14px;background:var(--cream);color:var(--dark);transition:border-color .2s,box-shadow .2s;outline:none;width:100%;}
input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(184,146,106,.15);}
::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:var(--sand);border-radius:3px;}
@media(max-width:768px){.desktop-only{display:none!important;}}
@media(min-width:769px){.mobile-only{display:none!important;}}
`;

// ─── FORMATTERS ───
const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "-";
const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// ─── MINI BAR CHART ───
const MiniBarChart = ({ data, height = 160 }) => {
  const max = Math.max(...data.flatMap(d => [d.in, d.out]), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:12, height, padding:"10px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, animation:`slideUp 0.5s ${i*0.1}s both` }}>
          <div style={{ display:"flex", gap:3, alignItems:"flex-end", width:"100%", justifyContent:"center", height:height-30 }}>
            <div style={{ width:"40%", background:"linear-gradient(to top, var(--success), #9DBDA7)", borderRadius:"6px 6px 2px 2px", height:`${(d.in/max)*100}%`, transition:"height .6s ease", minHeight:4 }} />
            <div style={{ width:"40%", background:"linear-gradient(to top, var(--danger), #D49A96)", borderRadius:"6px 6px 2px 2px", height:`${(d.out/max)*100}%`, transition:"height .6s ease", minHeight:4 }} />
          </div>
          <span style={{ fontSize:11, color:"var(--taupe)", fontWeight:500 }}>{d.m}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MODAL ───
const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(61,50,41,.35)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div onClick={e => e.stopPropagation()} className="card anim-expand" style={{ width:"100%", maxWidth:width, maxHeight:"90vh", overflow:"auto", padding:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid var(--beige)", position:"sticky", top:0, background:"white", zIndex:1 }}>
          <h3 style={{ fontSize:18, fontWeight:600 }}>{title}</h3>
          <div onClick={onClose} className="btn-press" style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--beige)" }}><Icon name="x" size={16} /></div>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
};

// ─── BUTTON ───
const Btn = ({ children, variant="primary", onClick, icon, style:s, full, disabled }) => {
  const styles = {
    primary:{ background:"var(--accent)", color:"var(--white)" },
    secondary:{ background:"var(--beige)", color:"var(--dark)" },
    danger:{ background:"var(--danger)", color:"var(--white)" },
    ghost:{ background:"transparent", color:"var(--taupe)", border:"1.5px solid var(--sand)" },
    success:{ background:"var(--success)", color:"var(--white)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} className="btn-press" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:8, border:"none", fontSize:14, fontWeight:500, fontFamily:"inherit", cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.6:1, width:full?"100%":"auto", justifyContent:full?"center":"flex-start", ...styles[variant], ...s }}>
      {icon && <Icon name={icon} size={16} />}{children}
    </button>
  );
};

// ─── STAT CARD ───
const StatCard = ({ label, value, icon, trend, delay=0 }) => (
  <div className="card anim-expand" style={{ padding:22, animationDelay:`${delay}s`, display:"flex", flexDirection:"column", gap:12 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:13, color:"var(--taupe)", fontWeight:500, letterSpacing:0.3 }}>{label}</span>
      <div style={{ width:38, height:38, borderRadius:10, background:"var(--beige)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--accent)" }}><Icon name={icon} size={18} /></div>
    </div>
    <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Playfair Display', serif", letterSpacing:-0.5 }}>{value}</div>
    {trend !== undefined && <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, fontWeight:500, color:trend>=0?"var(--success)":"var(--danger)" }}>
      <Icon name={trend>=0?"arrow_up":"arrow_down"} size={14} />{Math.abs(trend)}% vs mês anterior
    </div>}
  </div>
);

// ─── BADGE ───
const Badge = ({ status }) => {
  const map = {
    pago:{ bg:"#E8F5E9", color:"#2E7D32", label:"Pago" },
    recebido:{ bg:"#E8F5E9", color:"#2E7D32", label:"Recebido" },
    pendente:{ bg:"#FFF8E1", color:"#F57F17", label:"Pendente" },
    entregue:{ bg:"#E8F5E9", color:"#2E7D32", label:"Entregue" },
    em_transito:{ bg:"#E3F2FD", color:"#1565C0", label:"Em Trânsito" },
    ativo:{ bg:"#F3E5F5", color:"#7B1FA2", label:"Ativo" },
    atrasado:{ bg:"#FFEBEE", color:"#C62828", label:"Atrasado" },
    cancelado:{ bg:"#FFEBEE", color:"#C62828", label:"Cancelado" },
  };
  const s = map[status] || map.pendente;
  return <span style={{ padding:"4px 12px", borderRadius:20, background:s.bg, color:s.color, fontSize:12, fontWeight:600 }}>{s.label}</span>;
};

// ─── AVATAR ───
const Avatar = ({ user, size=36 }) => {
  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt="" style={{ width:size, height:size, borderRadius:size/3, objectFit:"cover" }} />;
  }
  const letter = (user?.name || user?.email || "?")[0].toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:size/3, background:"linear-gradient(135deg, var(--accent), var(--accent-light))", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:size*0.38, fontWeight:700, flexShrink:0 }}>
      {letter}
    </div>
  );
};

// ════════════════════════════════════════
// ═══ MAIN APP ═══
// ════════════════════════════════════════
export default function InfinityApp() {
  // ─── AUTH STATE ───
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ name:"", email:"", password:"", company:"" });
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // ─── APP STATE ───
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ─── UI STATE ───
  const [modalOpen, setModalOpen] = useState(null);
  const [monthFilter, setMonthFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newTx, setNewTx] = useState({ description:"", category:"", type:"saida", value:"", date:new Date().toISOString().slice(0,10), status:"pendente" });
  const [newPurchase, setNewPurchase] = useState({ item:"", supplier:"", qty:1, unit_price:"", date:new Date().toISOString().slice(0,10), status:"em_transito" });
  const [newMember, setNewMember] = useState({ email:"", name:"", role:"viewer" });
  const [profileForm, setProfileForm] = useState({ name:"", email:"", password:"" });
  const [saveMsg, setSaveMsg] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const avatarInputRef = useRef(null);

  // ─── SUPABASE AUTH ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (!session) { setCurrentUser(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load profile when session changes
  useEffect(() => {
    if (session) loadProfile();
    else { setTransactions([]); setPurchases([]); setProfiles([]); }
  }, [session]);

  // Load data when company is known
  useEffect(() => {
    if (currentUser?.company_id) {
      loadTransactions();
      loadPurchases();
      loadProfiles();
    }
  }, [currentUser?.company_id]);

  // ─── DATA LOADERS ───
  const loadProfile = async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (data) {
      setCurrentUser(data);
      setProfileForm({ name: data.name, email: data.email, password: "" });
      setAuthLoading(false);
    } else if (error?.code === "PGRST116") {
      // Profile not found — user signed up but profile not created yet
      setAuthLoading(false);
    }
  };

  const loadTransactions = async () => {
    setDataLoading(true);
    const { data } = await supabase.from("transactions").select("*").eq("company_id", currentUser.company_id).order("date", { ascending: false });
    if (data) setTransactions(data);
    setDataLoading(false);
  };

  const loadPurchases = async () => {
    const { data } = await supabase.from("purchases").select("*").eq("company_id", currentUser.company_id).order("date", { ascending: false });
    if (data) setPurchases(data);
  };

  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("company_id", currentUser.company_id);
    if (data) setProfiles(data);
  };

  // ─── AUTH HANDLERS ───
  const handleAuth = async () => {
    setAuthError("");
    if (!loginForm.email || !loginForm.password) { setAuthError("Preencha email e senha."); return; }
    if (authMode === "register" && !loginForm.company) { setAuthError("Informe o nome da empresa."); return; }
    setAuthSubmitting(true);
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: loginForm.email, password: loginForm.password });
        if (error) setAuthError(error.message === "Invalid login credentials" ? "Email ou senha incorretos." : error.message);
      } else {
        // 1. Create company
        const { data: company, error: companyErr } = await supabase.from("companies").insert({ name: loginForm.company }).select().single();
        if (companyErr) { setAuthError("Erro ao criar empresa: " + companyErr.message); return; }
        // 2. Sign up user
        const { data: authData, error: signUpErr } = await supabase.auth.signUp({ email: loginForm.email, password: loginForm.password });
        if (signUpErr) { setAuthError(signUpErr.message); return; }
        // 3. Create profile
        await supabase.from("profiles").insert({
          id: authData.user.id,
          company_id: company.id,
          name: loginForm.name || loginForm.email.split("@")[0],
          email: loginForm.email,
          role: "admin",
        });
        setAuthError("✓ Conta criada! Verifique seu email para confirmar e depois faça login.");
        setAuthMode("login");
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPage("dashboard");
  };

  // ─── TRANSACTION HANDLERS ───
  const addTransaction = async () => {
    if (!newTx.description || !newTx.value || !newTx.date) return;
    const { data, error } = await supabase.from("transactions").insert({
      company_id: currentUser.company_id,
      created_by: session.user.id,
      ...newTx,
      value: parseFloat(newTx.value),
    }).select().single();
    if (data) {
      setTransactions(prev => [data, ...prev]);
      setNewTx({ description:"", category:"", type:"saida", value:"", date:new Date().toISOString().slice(0,10), status:"pendente" });
      setModalOpen(null);
    }
    if (error) alert("Erro: " + error.message);
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) setTransactions(prev => prev.filter(t => t.id !== id));
    else alert("Sem permissão para excluir.");
  };

  // ─── PURCHASE HANDLERS ───
  const addPurchase = async () => {
    if (!newPurchase.item || !newPurchase.unit_price || !newPurchase.date) return;
    const total = newPurchase.qty * parseFloat(newPurchase.unit_price);
    const { data, error } = await supabase.from("purchases").insert({
      company_id: currentUser.company_id,
      created_by: session.user.id,
      ...newPurchase,
      unit_price: parseFloat(newPurchase.unit_price),
      total,
    }).select().single();
    if (data) {
      setPurchases(prev => [data, ...prev]);
      setNewPurchase({ item:"", supplier:"", qty:1, unit_price:"", date:new Date().toISOString().slice(0,10), status:"em_transito" });
      setModalOpen(null);
    }
    if (error) alert("Erro: " + error.message);
  };

  const deletePurchase = async (id) => {
    const { error } = await supabase.from("purchases").delete().eq("id", id);
    if (!error) setPurchases(prev => prev.filter(p => p.id !== id));
    else alert("Sem permissão para excluir.");
  };

  // ─── PROFILE HANDLERS ───
  const saveProfile = async () => {
    setSaveMsg("");
    const updates = { name: profileForm.name, email: profileForm.email };
    const { error } = await supabase.from("profiles").update(updates).eq("id", session.user.id);
    if (profileForm.password) {
      await supabase.auth.updateUser({ password: profileForm.password });
    }
    if (!error) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
      setSaveMsg("✓ Perfil salvo com sucesso!");
    } else {
      setSaveMsg("Erro ao salvar: " + error.message);
    }
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `${session.user.id}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadErr) { alert("Erro ao fazer upload: " + uploadErr.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", session.user.id);
    if (!error) setCurrentUser(prev => ({ ...prev, avatar_url: publicUrl }));
  };

  const updateMemberRole = async (profileId, role) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);
    if (!error) setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role } : p));
    else alert("Sem permissão para alterar funções.");
  };

  const removeMember = async (profileId) => {
    if (!confirm("Remover este usuário da empresa?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", profileId);
    if (!error) setProfiles(prev => prev.filter(p => p.id !== profileId));
    else alert("Sem permissão para remover.");
  };

  const inviteMember = async () => {
    setInviteMsg("");
    if (!newMember.email || !newMember.name) { setInviteMsg("Preencha nome e email."); return; }
    // Sign up the new user (they'll get an email to set password)
    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
    const { data: authData, error: signUpErr } = await supabase.auth.signUp({
      email: newMember.email,
      password: tempPassword,
      options: { data: { name: newMember.name } },
    });
    if (signUpErr) { setInviteMsg("Erro: " + signUpErr.message); return; }
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: authData.user.id,
      company_id: currentUser.company_id,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
    });
    if (profileErr) { setInviteMsg("Erro ao criar perfil: " + profileErr.message); return; }
    setProfiles(prev => [...prev, { id: authData.user.id, ...newMember, company_id: currentUser.company_id }]);
    setInviteMsg("✓ Usuário convidado! Um email foi enviado para " + newMember.email);
    setNewMember({ email:"", name:"", role:"viewer" });
  };

  // ─── PDF GENERATION ───
  const generatePDF = (type) => {
    const doc = new jsPDF();
    const companyName = profiles.find(p => p.id === session.user.id)?.name || "Empresa";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Infinity — Relatório Financeiro", 20, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 20, 30);

    if (type === "transactions" || type === "fluxo") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Transações", 20, 45);
      const totalIn = filteredTx.filter(t => t.type === "entrada").reduce((a, t) => a + Number(t.value), 0);
      const totalOut = filteredTx.filter(t => t.type === "saida").reduce((a, t) => a + Number(t.value), 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Total Entradas: ${fmt(totalIn)}`, 20, 55);
      doc.text(`Total Saídas:   ${fmt(totalOut)}`, 20, 63);
      doc.text(`Saldo:          ${fmt(totalIn - totalOut)}`, 20, 71);
      let y = 85;
      doc.setFont("helvetica", "bold");
      doc.text("Data", 20, y); doc.text("Descrição", 50, y); doc.text("Valor", 140, y); doc.text("Status", 170, y);
      doc.line(20, y+2, 195, y+2);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      filteredTx.slice(0, 30).forEach(t => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(fmtDate(t.date), 20, y);
        doc.text((t.description || "").slice(0, 35), 50, y);
        doc.text(fmt(t.value), 140, y);
        doc.text(t.status, 170, y);
        y += 7;
      });
    } else if (type === "purchases") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Compras & Fornecedores", 20, 45);
      let y = 60;
      doc.setFontSize(10);
      doc.text("Item", 20, y); doc.text("Fornecedor", 70, y); doc.text("Qtd", 120, y); doc.text("Total", 145, y); doc.text("Status", 170, y);
      doc.line(20, y+2, 195, y+2);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      purchases.slice(0, 30).forEach(p => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text((p.item || "").slice(0, 25), 20, y);
        doc.text((p.supplier || "").slice(0, 20), 70, y);
        doc.text(String(p.qty), 120, y);
        doc.text(fmt(p.total), 145, y);
        doc.text(p.status, 170, y);
        y += 7;
      });
    }
    doc.save(`infinity-${type}-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // ─── PERMISSIONS ───
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "editor";
  const isAdmin = currentUser?.role === "admin";

  // ─── COMPUTED ───
  const filteredTx = transactions.filter(t => {
    const matchMonth = monthFilter === "all" || new Date(t.date + "T12:00:00").getMonth() === parseInt(monthFilter);
    const matchSearch = !searchTerm || (t.description || "").toLowerCase().includes(searchTerm.toLowerCase()) || (t.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchMonth && matchSearch;
  });
  const totalIn = filteredTx.filter(t => t.type === "entrada").reduce((a, t) => a + Number(t.value), 0);
  const totalOut = filteredTx.filter(t => t.type === "saida").reduce((a, t) => a + Number(t.value), 0);
  const balance = totalIn - totalOut;
  const pendingCount = transactions.filter(t => t.status === "pendente").length;

  const expenseCategories = {};
  filteredTx.filter(t => t.type === "saida").forEach(t => { expenseCategories[t.category || "Outros"] = (expenseCategories[t.category || "Outros"] || 0) + Number(t.value); });
  const catColors = ["#B8926A","#7BA387","#C4716C","#D4A843","#9C8E7C","#6B5B4E"];

  // Cash flow by month (last 4 months with data)
  const cashFlowData = months.map((m, i) => ({
    m, i,
    in: transactions.filter(t => t.type === "entrada" && new Date(t.date + "T12:00:00").getMonth() === i).reduce((a, t) => a + Number(t.value), 0),
    out: transactions.filter(t => t.type === "saida" && new Date(t.date + "T12:00:00").getMonth() === i).reduce((a, t) => a + Number(t.value), 0),
  })).filter(d => d.in > 0 || d.out > 0).slice(-4);

  const navItems = [
    { id:"dashboard", icon:"dashboard", label:"Dashboard" },
    { id:"contas", icon:"wallet", label:"Contas" },
    { id:"compras", icon:"cart", label:"Compras" },
    { id:"relatorios", icon:"chart", label:"Relatórios" },
    { id:"perfis", icon:"users", label:"Equipe" },
    { id:"perfil", icon:"user", label:"Meu Perfil" },
    { id:"whatsapp", icon:"whatsapp", label:"WhatsApp" },
    { id:"config", icon:"settings", label:"Configurações" },
  ];

  // ─── AUTH SCREEN ───
  if (authLoading) return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:"var(--accent)", marginBottom:12 }}><Icon name="infinity" size={40} /></div>
          <p style={{ color:"var(--taupe)", fontSize:14 }}>Carregando...</p>
        </div>
      </div>
    </>
  );

  if (!session || !currentUser) return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg, var(--cream) 0%, var(--beige) 50%, var(--sand) 100%)", padding:20 }}>
        <div className="card anim-expand" style={{ width:"100%", maxWidth:440, padding:0, overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg, var(--dark) 0%, var(--brown) 100%)", padding:"40px 32px 32px", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ color:"var(--accent-light)" }}><Icon name="infinity" size={36} /></div>
              <span style={{ fontSize:28, fontWeight:700, color:"white", fontFamily:"'Playfair Display', serif", letterSpacing:1 }}>Infinity</span>
            </div>
            <p style={{ color:"var(--warm-gray)", fontSize:13, marginTop:4 }}>Gestão financeira inteligente</p>
          </div>
          <div style={{ padding:"32px 32px 28px" }}>
            <div style={{ display:"flex", marginBottom:24, borderRadius:8, overflow:"hidden", border:"1.5px solid var(--sand)" }}>
              {["login","register"].map(m => (
                <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }} className="btn-press" style={{ flex:1, padding:"10px 0", border:"none", background:authMode===m?"var(--accent)":"transparent", color:authMode===m?"white":"var(--taupe)", fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .2s" }}>
                  {m === "login" ? "Entrar" : "Cadastrar"}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {authMode === "register" && (
                <div className="anim-slide">
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Seu Nome</label>
                  <input placeholder="João Silva" value={loginForm.name} onChange={e => setLoginForm({ ...loginForm, name:e.target.value })} />
                </div>
              )}
              {authMode === "register" && (
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Nome da Empresa</label>
                  <input placeholder="Minha Empresa Ltda" value={loginForm.company} onChange={e => setLoginForm({ ...loginForm, company:e.target.value })} />
                </div>
              )}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Email</label>
                <input type="email" placeholder="seu@email.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email:e.target.value })} onKeyDown={e => e.key==="Enter" && handleAuth()} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Senha</label>
                <input type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password:e.target.value })} onKeyDown={e => e.key==="Enter" && handleAuth()} />
              </div>
              <button onClick={handleAuth} disabled={authSubmitting} className="btn-press" style={{ width:"100%", padding:"12px", borderRadius:8, border:"none", background:authSubmitting?"var(--warm-gray)":"var(--accent)", color:"white", fontSize:15, fontWeight:600, fontFamily:"inherit", cursor:authSubmitting?"not-allowed":"pointer", marginTop:6 }}>
                {authSubmitting ? "Aguarde..." : authMode === "login" ? "Entrar" : "Criar Conta"}
              </button>
            </div>
            {authError && (
              <div style={{ marginTop:14, padding:"10px 14px", borderRadius:8, background:authError.startsWith("✓")?"#E8F5E9":"#FFEBEE", color:authError.startsWith("✓")?"#2E7D32":"var(--danger)", fontSize:13 }}>
                {authError}
              </div>
            )}
            <p style={{ textAlign:"center", fontSize:12, color:"var(--warm-gray)", marginTop:16 }}>Protegido com criptografia de ponta a ponta</p>
          </div>
        </div>
      </div>
    </>
  );

  // ─── PAGE RENDERERS ───
  const renderDashboard = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16 }}>
        <StatCard label="RECEITAS" value={fmt(totalIn)} icon="arrow_up" trend={12} delay={0} />
        <StatCard label="DESPESAS" value={fmt(totalOut)} icon="arrow_down" trend={-5} delay={0.08} />
        <StatCard label="SALDO" value={fmt(balance)} icon="wallet" delay={0.16} />
        <StatCard label="PENDENTES" value={pendingCount} icon="bell" delay={0.24} />
      </div>
      {cashFlowData.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:16 }}>
          <div className="card anim-expand" style={{ padding:24, animationDelay:"0.3s" }}>
            <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Fluxo de Caixa</h3>
            <MiniBarChart data={cashFlowData} height={170} />
            <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--taupe)" }}><div style={{ width:10, height:10, borderRadius:3, background:"var(--success)" }} />Entradas</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--taupe)" }}><div style={{ width:10, height:10, borderRadius:3, background:"var(--danger)" }} />Saídas</div>
            </div>
          </div>
          <div className="card anim-expand" style={{ padding:24, animationDelay:"0.38s" }}>
            <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Despesas por Categoria</h3>
            {Object.entries(expenseCategories).length > 0 ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {Object.entries(expenseCategories).map(([cat, val], i) => {
                  const pct = Math.round((val / totalOut) * 100);
                  return (
                    <div key={i}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                        <span style={{ color:"var(--taupe)" }}>{cat}</span>
                        <span style={{ fontWeight:600 }}>{fmt(val)} <span style={{ color:"var(--warm-gray)", fontWeight:400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height:6, background:"var(--beige)", borderRadius:3 }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:catColors[i % catColors.length], borderRadius:3, transition:"width .6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p style={{ color:"var(--warm-gray)", fontSize:13 }}>Sem despesas no período</p>}
          </div>
        </div>
      )}
      <div className="card anim-expand" style={{ padding:24, animationDelay:"0.45s" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:12 }}>
          <h3 style={{ fontSize:15, fontWeight:600 }}>Últimas Movimentações</h3>
          {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addTx")}>Nova</Btn>}
        </div>
        {dataLoading ? <p style={{ color:"var(--warm-gray)", fontSize:13, padding:20 }}>Carregando...</p> : transactions.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:"var(--warm-gray)" }}>
            <p style={{ marginBottom:12 }}>Nenhuma transação ainda.</p>
            {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addTx")}>Adicionar primeira transação</Btn>}
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 6px" }}>
              <thead><tr style={{ fontSize:12, color:"var(--taupe)", textAlign:"left" }}>
                <th style={{ padding:"8px 12px", fontWeight:600 }}>Descrição</th>
                <th style={{ padding:"8px 12px", fontWeight:600 }} className="desktop-only">Categoria</th>
                <th style={{ padding:"8px 12px", fontWeight:600 }}>Valor</th>
                <th style={{ padding:"8px 12px", fontWeight:600 }} className="desktop-only">Data</th>
                <th style={{ padding:"8px 12px", fontWeight:600 }}>Status</th>
              </tr></thead>
              <tbody>{filteredTx.slice(0,5).map((t, i) => (
                <tr key={t.id} style={{ background:i%2===0?"var(--cream)":"transparent", animation:`slideUp 0.3s ${i*0.06}s both` }}>
                  <td style={{ padding:"12px", borderRadius:"8px 0 0 8px", fontSize:14 }}>{t.description}</td>
                  <td style={{ padding:"12px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{t.category}</td>
                  <td style={{ padding:"12px", fontWeight:600, color:t.type==="entrada"?"var(--success)":"var(--danger)" }}>{t.type==="entrada"?"+":"-"}{fmt(t.value)}</td>
                  <td style={{ padding:"12px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{fmtDate(t.date)}</td>
                  <td style={{ padding:"12px", borderRadius:"0 8px 8px 0" }}><Badge status={t.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderContas = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Gestão de Contas</h2>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addTx")}>Nova Conta</Btn>}
          <Btn icon="download" variant="ghost" onClick={() => generatePDF("transactions")}>PDF</Btn>
        </div>
      </div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--warm-gray)" }}><Icon name="search" size={16} /></div>
          <input placeholder="Buscar por descrição ou categoria..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft:38 }} />
        </div>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ width:"auto", minWidth:140 }}>
          <option value="all">Todos os meses</option>
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:12 }}>
        <div className="card anim-fade" style={{ padding:18, borderLeft:"4px solid var(--success)" }}>
          <span style={{ fontSize:12, color:"var(--taupe)" }}>Total Entradas</span>
          <p style={{ fontSize:22, fontWeight:700, color:"var(--success)", marginTop:4 }}>{fmt(totalIn)}</p>
        </div>
        <div className="card anim-fade" style={{ padding:18, borderLeft:"4px solid var(--danger)", animationDelay:"0.08s" }}>
          <span style={{ fontSize:12, color:"var(--taupe)" }}>Total Saídas</span>
          <p style={{ fontSize:22, fontWeight:700, color:"var(--danger)", marginTop:4 }}>{fmt(totalOut)}</p>
        </div>
        <div className="card anim-fade" style={{ padding:18, borderLeft:"4px solid var(--accent)", animationDelay:"0.16s" }}>
          <span style={{ fontSize:12, color:"var(--taupe)" }}>Saldo Período</span>
          <p style={{ fontSize:22, fontWeight:700, color:balance>=0?"var(--success)":"var(--danger)", marginTop:4 }}>{fmt(balance)}</p>
        </div>
      </div>
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"var(--beige)", fontSize:12, color:"var(--taupe)", textAlign:"left" }}>
              <th style={{ padding:"12px 16px", fontWeight:600 }}>Descrição</th>
              <th style={{ padding:"12px 16px", fontWeight:600 }} className="desktop-only">Categoria</th>
              <th style={{ padding:"12px 16px", fontWeight:600 }}>Tipo</th>
              <th style={{ padding:"12px 16px", fontWeight:600 }}>Valor</th>
              <th style={{ padding:"12px 16px", fontWeight:600 }} className="desktop-only">Data</th>
              <th style={{ padding:"12px 16px", fontWeight:600 }}>Status</th>
              {canEdit && <th style={{ padding:"12px 16px", fontWeight:600 }}>Ações</th>}
            </tr></thead>
            <tbody>{filteredTx.map((t, i) => (
              <tr key={t.id} style={{ borderBottom:"1px solid var(--beige)", animation:`slideUp 0.3s ${i*0.04}s both` }}>
                <td style={{ padding:"14px 16px", fontSize:14 }}>{t.description}</td>
                <td style={{ padding:"14px 16px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{t.category}</td>
                <td style={{ padding:"14px 16px" }}><span style={{ padding:"3px 10px", borderRadius:12, fontSize:11, fontWeight:600, background:t.type==="entrada"?"#E8F5E9":"#FFEBEE", color:t.type==="entrada"?"#2E7D32":"#C62828" }}>{t.type==="entrada"?"Entrada":"Saída"}</span></td>
                <td style={{ padding:"14px 16px", fontWeight:600, color:t.type==="entrada"?"var(--success)":"var(--danger)" }}>{fmt(t.value)}</td>
                <td style={{ padding:"14px 16px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{fmtDate(t.date)}</td>
                <td style={{ padding:"14px 16px" }}><Badge status={t.status} /></td>
                {canEdit && <td style={{ padding:"14px 16px" }}>
                  <div className="btn-press" onClick={() => deleteTransaction(t.id)} style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)", color:"var(--danger)", cursor:"pointer" }}><Icon name="trash" size={14} /></div>
                </td>}
              </tr>
            ))}</tbody>
          </table>
        </div>
        {filteredTx.length === 0 && !dataLoading && <div style={{ padding:40, textAlign:"center", color:"var(--warm-gray)" }}>Nenhuma transação encontrada</div>}
      </div>
    </div>
  );

  const renderCompras = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Compras & Fornecedores</h2>
        <div style={{ display:"flex", gap:10 }}>
          {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addPurchase")}>Nova Compra</Btn>}
          <Btn icon="download" variant="ghost" onClick={() => generatePDF("purchases")}>PDF</Btn>
        </div>
      </div>
      {purchases.length === 0 ? (
        <div className="card" style={{ padding:40, textAlign:"center", color:"var(--warm-gray)" }}>
          <p style={{ marginBottom:12 }}>Nenhuma compra registrada.</p>
          {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addPurchase")}>Registrar compra</Btn>}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
          {purchases.map((p, i) => (
            <div key={p.id} className="card anim-expand" style={{ padding:20, animationDelay:`${i*0.08}s`, display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <h4 style={{ fontSize:15, fontWeight:600 }}>{p.item}</h4>
                  <p style={{ fontSize:13, color:"var(--taupe)", marginTop:2 }}>{p.supplier}</p>
                </div>
                <Badge status={p.status} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, background:"var(--cream)", borderRadius:10, padding:12 }}>
                <div><span style={{ fontSize:11, color:"var(--warm-gray)" }}>Qtd</span><p style={{ fontWeight:600 }}>{p.qty}</p></div>
                <div><span style={{ fontSize:11, color:"var(--warm-gray)" }}>Unit.</span><p style={{ fontWeight:600 }}>{fmt(p.unit_price)}</p></div>
                <div><span style={{ fontSize:11, color:"var(--warm-gray)" }}>Total</span><p style={{ fontWeight:700, color:"var(--accent)" }}>{fmt(p.total)}</p></div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:"var(--warm-gray)" }}>{fmtDate(p.date)}</span>
                {canEdit && <div className="btn-press" onClick={() => deletePurchase(p.id)} style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)", color:"var(--danger)", cursor:"pointer" }}><Icon name="trash" size={14} /></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRelatorios = () => {
    const reportTypes = [
      { title:"Fluxo de Caixa", desc:"Movimentações de entrada e saída por período", icon:"chart", type:"fluxo" },
      { title:"Transações Completas", desc:"Todas as transações do período filtrado", icon:"wallet", type:"transactions" },
      { title:"Compras & Fornecedores", desc:"Consolidado de todas as compras", icon:"cart", type:"purchases" },
    ];
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Relatórios</h2>
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ width:"auto", minWidth:160 }}>
            <option value="all">Todos os meses</option>
            {months.map((m, i) => <option key={i} value={i}>{m} 2026</option>)}
          </select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
          {reportTypes.map((r, i) => (
            <div key={i} className="card anim-expand btn-press" style={{ padding:24, animationDelay:`${i*0.07}s`, cursor:"pointer", display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"var(--beige)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--accent)" }}><Icon name={r.icon} size={22} /></div>
              <div>
                <h4 style={{ fontSize:15, fontWeight:600 }}>{r.title}</h4>
                <p style={{ fontSize:13, color:"var(--taupe)", marginTop:4, lineHeight:1.5 }}>{r.desc}</p>
              </div>
              <Btn variant="primary" icon="download" onClick={() => generatePDF(r.type)} style={{ fontSize:12, padding:"8px 14px" }}>Baixar PDF</Btn>
            </div>
          ))}
        </div>
        <div className="card anim-slide" style={{ padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Resumo — Fluxo de Caixa</h3>
          {cashFlowData.length > 0 ? <MiniBarChart data={cashFlowData} height={200} /> : <p style={{ color:"var(--warm-gray)", fontSize:13 }}>Adicione transações para ver o gráfico.</p>}
          <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <div style={{ background:"var(--cream)", borderRadius:10, padding:14, textAlign:"center" }}>
              <span style={{ fontSize:12, color:"var(--taupe)" }}>Total Entradas</span>
              <p style={{ fontSize:18, fontWeight:700, color:"var(--success)", marginTop:4 }}>{fmt(totalIn)}</p>
            </div>
            <div style={{ background:"var(--cream)", borderRadius:10, padding:14, textAlign:"center" }}>
              <span style={{ fontSize:12, color:"var(--taupe)" }}>Total Saídas</span>
              <p style={{ fontSize:18, fontWeight:700, color:"var(--danger)", marginTop:4 }}>{fmt(totalOut)}</p>
            </div>
            <div style={{ background:"var(--cream)", borderRadius:10, padding:14, textAlign:"center" }}>
              <span style={{ fontSize:12, color:"var(--taupe)" }}>Resultado</span>
              <p style={{ fontSize:18, fontWeight:700, color:"var(--accent)", marginTop:4 }}>{fmt(balance)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerfis = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Equipe</h2>
        {isAdmin && <Btn icon="plus" onClick={() => setModalOpen("inviteMember")}>Convidar Membro</Btn>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
        {profiles.map((p, i) => (
          <div key={p.id} className="card anim-expand" style={{ padding:24, animationDelay:`${i*0.08}s` }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <Avatar user={p} size={52} />
              <div>
                <h4 style={{ fontSize:15, fontWeight:600 }}>{p.name} {p.id === session.user.id && <span style={{ fontSize:11, color:"var(--taupe)", fontWeight:400 }}>(você)</span>}</h4>
                <p style={{ fontSize:13, color:"var(--taupe)" }}>{p.email}</p>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
              {isAdmin && p.id !== session.user.id ? (
                <select value={p.role} onChange={e => updateMemberRole(p.id, e.target.value)} style={{ width:"auto", minWidth:130, padding:"8px 12px", fontSize:13 }}>
                  <option value="admin">Admin (tudo)</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                </select>
              ) : (
                <span style={{ padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, background:"var(--beige)", color:"var(--taupe)" }}>
                  {p.role === "admin" ? "Administrador" : p.role === "editor" ? "Editor" : "Visualizador"}
                </span>
              )}
              {isAdmin && p.id !== session.user.id && (
                <div className="btn-press" onClick={() => removeMember(p.id)} style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)", color:"var(--danger)", cursor:"pointer" }}><Icon name="trash" size={14} /></div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="card anim-slide" style={{ padding:24 }}>
        <h3 style={{ fontSize:16, fontWeight:600, marginBottom:12 }}>Permissões</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:12 }}>
          {[
            { role:"Admin", perms:"Criar, editar, excluir, relatórios, gerenciar equipe", color:"#1565C0" },
            { role:"Editor", perms:"Criar e editar transações e compras", color:"#F57F17" },
            { role:"Visualizador", perms:"Apenas visualizar dados e relatórios", color:"#7B1FA2" },
          ].map((r, i) => (
            <div key={i} style={{ background:"var(--cream)", borderRadius:10, padding:14, borderLeft:`3px solid ${r.color}` }}>
              <strong style={{ fontSize:13 }}>{r.role}</strong>
              <p style={{ fontSize:12, color:"var(--taupe)", marginTop:4, lineHeight:1.5 }}>{r.perms}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:600 }}>
      <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Meu Perfil</h2>
      <div className="card anim-expand" style={{ padding:32 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28 }}>
          <div style={{ position:"relative" }}>
            <Avatar user={currentUser} size={80} />
            <div className="btn-press" onClick={() => avatarInputRef.current?.click()} style={{ position:"absolute", bottom:-4, right:-4, width:28, height:28, borderRadius:8, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", cursor:"pointer" }}>
              <Icon name="upload" size={14} />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => uploadAvatar(e.target.files[0])} />
          </div>
          <div>
            <h3 style={{ fontSize:20, fontWeight:700 }}>{currentUser.name}</h3>
            <p style={{ fontSize:14, color:"var(--taupe)" }}>{currentUser.email}</p>
            <span style={{ padding:"3px 10px", borderRadius:12, fontSize:11, fontWeight:600, background:"#E3F2FD", color:"#1565C0", marginTop:4, display:"inline-block" }}>
              {currentUser.role === "admin" ? "Administrador" : currentUser.role === "editor" ? "Editor" : "Visualizador"}
            </span>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Nome Completo</label>
            <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name:e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Email</label>
            <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email:e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Nova Senha <span style={{ color:"var(--warm-gray)", fontWeight:400 }}>(deixe em branco para manter)</span></label>
            <input type="password" placeholder="••••••••" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password:e.target.value })} />
          </div>
          <Btn icon="check" onClick={saveProfile}>Salvar Alterações</Btn>
          {saveMsg && <p style={{ fontSize:13, color:saveMsg.startsWith("✓")?"#2E7D32":"var(--danger)" }}>{saveMsg}</p>}
        </div>
      </div>
    </div>
  );

  const renderWhatsApp = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:700 }}>
      <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Integração WhatsApp</h2>
      <div className="card anim-expand" style={{ padding:32, textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:20, background:"#25D366", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:"white" }}><Icon name="whatsapp" size={36} /></div>
        <h3 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>Conecte seu WhatsApp</h3>
        <p style={{ color:"var(--taupe)", fontSize:14, lineHeight:1.6, maxWidth:480, margin:"0 auto 24px" }}>
          Envie mensagens como "Paguei R$ 450 de internet" e o sistema registra automaticamente via Edge Function.
        </p>
        <div style={{ background:"var(--cream)", borderRadius:14, padding:20, marginBottom:24, textAlign:"left" }}>
          <h4 style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>Webhook URL:</h4>
          <input value={`${SUPABASE_URL}/functions/v1/whatsapp-webhook`} readOnly style={{ fontFamily:"monospace", fontSize:12 }} />
        </div>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:600 }}>
      <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Configurações</h2>
      <div className="card anim-expand" style={{ padding:24 }}>
        <h3 style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Conexão Supabase</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Project URL</label>
            <input value={SUPABASE_URL} readOnly style={{ fontFamily:"monospace", fontSize:12 }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--success)" }} />
            <span style={{ fontSize:13, color:"var(--taupe)" }}>Conectado ao Supabase</span>
          </div>
        </div>
      </div>
      <Btn variant="danger" icon="logout" onClick={handleLogout} full>Sair da Conta</Btn>
    </div>
  );

  const pages = { dashboard:renderDashboard, contas:renderContas, compras:renderCompras, relatorios:renderRelatorios, perfis:renderPerfis, perfil:renderPerfil, whatsapp:renderWhatsApp, config:renderConfig };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ display:"flex", minHeight:"100vh", background:"var(--cream)" }}>
        {/* SIDEBAR DESKTOP */}
        <aside className="desktop-only" style={{ width:240, background:"var(--white)", borderRight:"1px solid var(--beige)", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, bottom:0, zIndex:100 }}>
          <div style={{ padding:"24px 20px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid var(--beige)" }}>
            <div style={{ color:"var(--accent)" }}><Icon name="infinity" size={28} /></div>
            <span style={{ fontSize:20, fontWeight:700, fontFamily:"'Playfair Display', serif", letterSpacing:0.5 }}>Infinity</span>
          </div>
          <nav style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:2 }}>
            {navItems.map(n => (
              <div key={n.id} onClick={() => setPage(n.id)} className="btn-press" style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10, cursor:"pointer", background:page===n.id?"var(--beige)":"transparent", color:page===n.id?"var(--dark)":"var(--taupe)", fontWeight:page===n.id?600:400, fontSize:14, transition:"all .2s" }}>
                <Icon name={n.icon} size={18} />{n.label}
              </div>
            ))}
          </nav>
          <div style={{ padding:"16px 14px", borderTop:"1px solid var(--beige)", display:"flex", alignItems:"center", gap:10 }}>
            <Avatar user={currentUser} size={36} />
            <div>
              <p style={{ fontSize:13, fontWeight:600 }}>{currentUser.name?.split(" ")[0]}</p>
              <p style={{ fontSize:11, color:"var(--taupe)" }}>{currentUser.role === "admin" ? "Administrador" : currentUser.role === "editor" ? "Editor" : "Visualizador"}</p>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR */}
        {sideOpen && (
          <div className="mobile-only" onClick={() => setSideOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(61,50,41,.4)", zIndex:200 }}>
            <aside onClick={e => e.stopPropagation()} className="anim-fade" style={{ width:260, background:"var(--white)", height:"100%", padding:"20px 10px", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"4px 10px 20px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid var(--beige)", marginBottom:12 }}>
                <div style={{ color:"var(--accent)" }}><Icon name="infinity" size={24} /></div>
                <span style={{ fontSize:18, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Infinity</span>
              </div>
              {navItems.map(n => (
                <div key={n.id} onClick={() => { setPage(n.id); setSideOpen(false); }} className="btn-press" style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10, cursor:"pointer", background:page===n.id?"var(--beige)":"transparent", color:page===n.id?"var(--dark)":"var(--taupe)", fontWeight:page===n.id?600:400, fontSize:14 }}>
                  <Icon name={n.icon} size={18} />{n.label}
                </div>
              ))}
            </aside>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main style={{ flex:1, marginLeft:window.innerWidth > 768 ? 240 : 0, minHeight:"100vh" }}>
          <header style={{ position:"sticky", top:0, background:"rgba(250,247,242,.85)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--beige)", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:50 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div className="mobile-only btn-press" onClick={() => setSideOpen(true)} style={{ cursor:"pointer" }}><Icon name="menu" size={22} /></div>
              <h1 style={{ fontSize:18, fontWeight:600, fontFamily:"'Playfair Display', serif" }}>
                {navItems.find(n => n.id === page)?.label || "Dashboard"}
              </h1>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div className="btn-press" style={{ width:36, height:36, borderRadius:10, background:"var(--white)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"1px solid var(--beige)", position:"relative" }}>
                <Icon name="bell" size={17} />
                {pendingCount > 0 && <div style={{ position:"absolute", top:-3, right:-3, width:16, height:16, borderRadius:"50%", background:"var(--danger)", color:"white", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{pendingCount}</div>}
              </div>
              <div className="btn-press desktop-only" onClick={() => setPage("perfil")} style={{ cursor:"pointer" }}>
                <Avatar user={currentUser} size={36} />
              </div>
            </div>
          </header>
          <div key={page} className="anim-fade" style={{ padding:24, maxWidth:1200 }}>
            {pages[page]?.()}
          </div>
        </main>
      </div>

      {/* MODAL: Nova Transação */}
      <Modal open={modalOpen === "addTx"} onClose={() => setModalOpen(null)} title="Nova Transação">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Descrição *</label><input placeholder="Ex: Pagamento fornecedor" value={newTx.description} onChange={e => setNewTx({ ...newTx, description:e.target.value })} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Categoria</label><input placeholder="Fornecedores, Fixas..." value={newTx.category} onChange={e => setNewTx({ ...newTx, category:e.target.value })} /></div>
            <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Tipo</label>
              <select value={newTx.type} onChange={e => setNewTx({ ...newTx, type:e.target.value })}><option value="saida">Saída</option><option value="entrada">Entrada</option></select>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Valor (R$) *</label><input type="number" placeholder="0,00" value={newTx.value} onChange={e => setNewTx({ ...newTx, value:e.target.value })} /></div>
            <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Data *</label><input type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date:e.target.value })} /></div>
          </div>
          <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Status</label>
            <select value={newTx.status} onChange={e => setNewTx({ ...newTx, status:e.target.value })}><option value="pendente">Pendente</option><option value="pago">Pago</option><option value="recebido">Recebido</option><option value="atrasado">Atrasado</option></select>
          </div>
          <Btn onClick={addTransaction} icon="check" full>Salvar Transação</Btn>
        </div>
      </Modal>

      {/* MODAL: Nova Compra */}
      <Modal open={modalOpen === "addPurchase"} onClose={() => setModalOpen(null)} title="Nova Compra">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Item *</label><input placeholder="Nome do produto" value={newPurchase.item} onChange={e => setNewPurchase({ ...newPurchase, item:e.target.value })} /></div>
          <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Fornecedor</label><input placeholder="Nome do fornecedor" value={newPurchase.supplier} onChange={e => setNewPurchase({ ...newPurchase, supplier:e.target.value })} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Qtd</label><input type="number" value={newPurchase.qty} onChange={e => setNewPurchase({ ...newPurchase, qty:parseInt(e.target.value)||1 })} /></div>
            <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Preço Unit. *</label><input type="number" placeholder="0,00" value={newPurchase.unit_price} onChange={e => setNewPurchase({ ...newPurchase, unit_price:e.target.value })} /></div>
            <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Data *</label><input type="date" value={newPurchase.date} onChange={e => setNewPurchase({ ...newPurchase, date:e.target.value })} /></div>
          </div>
          <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Status</label>
            <select value={newPurchase.status} onChange={e => setNewPurchase({ ...newPurchase, status:e.target.value })}><option value="em_transito">Em Trânsito</option><option value="entregue">Entregue</option><option value="ativo">Ativo</option><option value="cancelado">Cancelado</option></select>
          </div>
          <Btn onClick={addPurchase} icon="check" full>Salvar Compra</Btn>
        </div>
      </Modal>

      {/* MODAL: Convidar Membro */}
      <Modal open={modalOpen === "inviteMember"} onClose={() => { setModalOpen(null); setInviteMsg(""); }} title="Convidar Membro">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Nome *</label><input placeholder="Nome do colaborador" value={newMember.name} onChange={e => setNewMember({ ...newMember, name:e.target.value })} /></div>
          <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Email *</label><input type="email" placeholder="email@empresa.com" value={newMember.email} onChange={e => setNewMember({ ...newMember, email:e.target.value })} /></div>
          <div><label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Permissão</label>
            <select value={newMember.role} onChange={e => setNewMember({ ...newMember, role:e.target.value })}>
              <option value="viewer">Visualizador — só ver</option>
              <option value="editor">Editor — ver e editar</option>
              <option value="admin">Admin — acesso total</option>
            </select>
          </div>
          <Btn onClick={inviteMember} icon="mail" full>Enviar Convite</Btn>
          {inviteMsg && <p style={{ fontSize:13, color:inviteMsg.startsWith("✓")?"#2E7D32":"var(--danger)", padding:"8px 12px", borderRadius:8, background:inviteMsg.startsWith("✓")?"#E8F5E9":"#FFEBEE" }}>{inviteMsg}</p>}
          <p style={{ fontSize:12, color:"var(--warm-gray)" }}>O usuário receberá um email para definir sua senha e terá acesso à empresa automaticamente.</p>
        </div>
      </Modal>
    </>
  );
}
