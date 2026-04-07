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
    group: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
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
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
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

// ─── PREDEFINED CATEGORIES & DESCRIPTIONS ───
const CATEGORIES = {
  saida: [
    { cat: "Aluguel", descs: ["Aluguel do escritório", "Aluguel do galpão", "Aluguel de equipamentos"] },
    { cat: "Salários", descs: ["Folha de pagamento", "Pró-labore", "13º salário", "Férias", "FGTS"] },
    { cat: "Fornecedores", descs: ["Pagamento fornecedor", "Matéria-prima", "Insumos"] },
    { cat: "Impostos", descs: ["IRPJ", "ICMS", "ISS", "PIS/COFINS", "Simples Nacional", "INSS", "IPTU"] },
    { cat: "Utilidades", descs: ["Energia elétrica", "Água e esgoto", "Internet", "Telefone", "Gás"] },
    { cat: "Marketing", descs: ["Google Ads", "Meta Ads", "Material gráfico", "Eventos", "Branding"] },
    { cat: "Transporte", descs: ["Combustível", "Frete", "Manutenção veículos", "Pedágio", "Estacionamento"] },
    { cat: "Escritório", descs: ["Material de escritório", "Limpeza", "Manutenção predial", "Segurança"] },
    { cat: "Tecnologia", descs: ["Software/SaaS", "Hospedagem", "Domínio", "Equipamentos TI"] },
    { cat: "Financeiro", descs: ["Juros bancários", "Tarifas bancárias", "IOF", "Multas"] },
    { cat: "Outros", descs: [] },
  ],
  entrada: [
    { cat: "Vendas", descs: ["Venda de produto", "Venda de serviço", "Comissão recebida"] },
    { cat: "Serviços", descs: ["Consultoria", "Projeto", "Manutenção", "Suporte técnico"] },
    { cat: "Recebimentos", descs: ["Recebimento de cliente", "Cobrança recebida", "Parcela recebida"] },
    { cat: "Investimentos", descs: ["Rendimento aplicação", "Dividendos", "Juros recebidos"] },
    { cat: "Outros", descs: [] },
  ],
};

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
const StatCard = ({ label, value, icon, trend, delay=0, color }) => (
  <div className="card anim-expand" style={{ padding:22, animationDelay:`${delay}s`, display:"flex", flexDirection:"column", gap:12 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:12, color:"var(--taupe)", fontWeight:600, letterSpacing:0.5, textTransform:"uppercase" }}>{label}</span>
      <div style={{ width:38, height:38, borderRadius:10, background:"var(--beige)", display:"flex", alignItems:"center", justifyContent:"center", color: color || "var(--accent)" }}><Icon name={icon} size={18} /></div>
    </div>
    <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Playfair Display', serif", letterSpacing:-0.5, color: color || "var(--dark)" }}>{value}</div>
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
  return <span style={{ padding:"4px 12px", borderRadius:20, background:s.bg, color:s.color, fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>{s.label}</span>;
};

// ─── AVATAR ───
const Avatar = ({ user, size=36 }) => {
  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt="" style={{ width:size, height:size, borderRadius:size/3, objectFit:"cover", flexShrink:0 }} />;
  }
  const letter = (user?.name || user?.email || "?")[0].toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:size/3, background:"linear-gradient(135deg, var(--accent), var(--accent-light))", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:size*0.38, fontWeight:700, flexShrink:0 }}>
      {letter}
    </div>
  );
};

// ─── PDF GENERATOR ───
const buildPDF = ({ type, company, user, transactions, purchases, filteredTx, monthLabel }) => {
  const doc = new jsPDF({ unit:"mm", format:"a4" });
  const W = 210, ML = 15, MR = 195, CW = MR - ML;
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });

  // ── PALETTE ──
  const C = {
    dark: [61, 50, 41],
    brown: [107, 91, 78],
    accent: [184, 146, 106],
    accentLight: [212, 184, 150],
    success: [123, 163, 135],
    danger: [196, 113, 108],
    warning: [212, 168, 67],
    cream: [250, 247, 242],
    beige: [240, 235, 227],
    sand: [232, 224, 213],
    white: [255, 255, 255],
    gray: [156, 142, 124],
    lightGray: [196, 186, 168],
  };

  const setFill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c) => doc.setDrawColor(c[0], c[1], c[2]);
  const setTxt = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const rect = (x, y, w, h, style="F") => doc.rect(x, y, w, h, style);

  const addPageFooter = (pageNum, totalPages) => {
    // Footer band
    setFill(C.beige);
    rect(0, 283, W, 14);
    // Accent top line
    setFill(C.accent);
    rect(0, 283, W, 0.8);
    // Mini logo mark
    drawLogoMark(ML, 284.5, 9);
    setTxt(C.gray);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Infinity · ${company}`, ML + 12, 292);
    doc.text(`Página ${pageNum} de ${totalPages}`, MR, 292, { align:"right" });
    setTxt(C.lightGray);
    doc.text(`Gerado em ${dateStr} às ${timeStr}`, W/2, 292, { align:"center" });
  };

  // Draw the logo mark (rounded square + ∞ symbol) at position (x,y) with given size
  const drawLogoMark = (x, y, size) => {
    const r = size * 0.22; // corner radius
    // Dark background
    setFill(C.dark);
    doc.roundedRect(x, y, size, size, r, r, "F");
    // Inner border
    setDraw([90, 73, 60]);
    doc.setLineWidth(0.4);
    doc.roundedRect(x + 1, y + 1, size - 2, size - 2, r - 0.5, r - 0.5, "S");
    // Accent bottom strip inside box
    setFill(C.accent);
    doc.rect(x + size*0.15, y + size*0.85, size*0.7, size*0.06, "F");
    // Draw ∞ symbol using two curved loops via jsPDF lines
    // We approximate with an ellipse for each lobe
    const cx = x + size * 0.5;
    const cy = y + size * 0.44;
    const lw = size * 0.22; // lobe half-width
    const lh = size * 0.14; // lobe half-height
    setDraw(C.accentLight);
    doc.setLineWidth(size * 0.07);
    // Right lobe
    doc.ellipse(cx + lw * 0.72, cy, lw * 0.72, lh, "S");
    // Left lobe
    doc.ellipse(cx - lw * 0.72, cy, lw * 0.72, lh, "S");
    // Cover overlap with dark fill to create the crossing
    setFill(C.dark);
    doc.rect(cx - size*0.04, cy - lh - 0.5, size*0.08, lh*2 + 1, "F");
    // Redraw crossing lines in accent to restore the infinity crossing look
    setDraw(C.accentLight);
    doc.setLineWidth(size * 0.065);
    // Left side of crossing (bottom-left to top-right diagonal)
    doc.line(cx - size*0.03, cy + lh*0.5, cx + size*0.03, cy - lh*0.5);
    // Right side of crossing
    doc.line(cx + size*0.03, cy + lh*0.5, cx - size*0.03, cy - lh*0.5);
  };

  const addPageHeader = (title, subtitle) => {
    // Dark header band (taller for logo)
    setFill(C.dark);
    rect(0, 0, W, 44);
    // Gold accent strip at bottom of header
    setFill(C.accent);
    rect(0, 42, W, 2.5);
    // Subtle gradient-like lighter strip
    setFill([55, 44, 36]);
    rect(0, 0, W, 6);

    // Logo mark
    const logoSize = 26;
    const logoY = (44 - logoSize) / 2;
    drawLogoMark(ML, logoY, logoSize);

    // Brand name next to logo
    setTxt(C.white);
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text("INFINITY", ML + logoSize + 5, 19);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setTxt(C.accentLight);
    doc.text("Gestão Financeira Inteligente", ML + logoSize + 5, 26);

    // Vertical separator line
    setDraw([80, 65, 52]);
    doc.setLineWidth(0.5);
    doc.line(W/2, 8, W/2, 36);

    // Report title (right side)
    setTxt(C.white);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, MR, 18, { align:"right" });
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    setTxt(C.accentLight);
    doc.text(subtitle, MR, 26, { align:"right" });

    // Date/time bottom right
    setTxt([120, 105, 90]);
    doc.setFontSize(7.5);
    doc.text(dateStr + "  " + timeStr, MR, 33, { align:"right" });
  };

  const drawInfoRow = (y, items) => {
    setFill(C.cream);
    rect(ML, y, CW, 10);
    setDraw(C.sand);
    doc.setLineWidth(0.3);
    rect(ML, y, CW, 10, "S");
    setTxt(C.gray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const colW = CW / items.length;
    items.forEach(({ label, value }, i) => {
      const x = ML + i * colW + 4;
      doc.text(label, x, y + 4);
      setTxt(C.dark);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(value, x, y + 8.5);
      setTxt(C.gray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    });
  };

  const drawSummaryBoxes = (y, boxes) => {
    const bw = CW / boxes.length;
    boxes.forEach(({ label, value, color }, i) => {
      const x = ML + i * bw;
      setFill(color === "success" ? [236, 247, 239] : color === "danger" ? [253, 236, 235] : C.cream);
      rect(x + (i > 0 ? 2 : 0), y, bw - (i > 0 ? 2 : 0) - (i < boxes.length-1 ? 2 : 0), 20);
      setDraw(color === "success" ? C.success : color === "danger" ? C.danger : C.sand);
      doc.setLineWidth(0.4);
      rect(x + (i > 0 ? 2 : 0), y, bw - (i > 0 ? 2 : 0) - (i < boxes.length-1 ? 2 : 0), 20, "S");
      setTxt(C.gray);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(label.toUpperCase(), x + (i > 0 ? 2 : 0) + 4, y + 6);
      setTxt(color === "success" ? C.success : color === "danger" ? C.danger : C.dark);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(value, x + (i > 0 ? 2 : 0) + 4, y + 15);
    });
    return y + 22;
  };

  const drawTableHeader = (y, cols) => {
    setFill(C.brown);
    rect(ML, y, CW, 8);
    setTxt(C.white);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    cols.forEach(({ label, x, align }) => {
      doc.text(label, x, y + 5.5, { align: align || "left" });
    });
    return y + 8;
  };

  const drawTableRow = (y, cols, isEven) => {
    if (isEven) {
      setFill(C.cream);
      rect(ML, y, CW, 7, "F");
    }
    setDraw(C.sand);
    doc.setLineWidth(0.2);
    doc.line(ML, y + 7, MR, y + 7);
    setTxt(C.dark);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    cols.forEach(({ text, x, align, color }) => {
      if (color) setTxt(color);
      else setTxt(C.dark);
      doc.text(String(text || ""), x, y + 5, { align: align || "left" });
    });
    return y + 7;
  };

  const checkPageBreak = (y, needed, pageNum, totalPagesRef) => {
    if (y + needed > 282) {
      addPageFooter(pageNum, "..."); // placeholder
      doc.addPage();
      pageNum++;
      totalPagesRef.count++;
      addPageHeader("(continuação)", "");
      return { y: 50, pageNum };
    }
    return { y, pageNum };
  };

  // ══════════════════════════════════════════
  // TRANSACTIONS REPORT
  // ══════════════════════════════════════════
  if (type === "transactions" || type === "fluxo") {
    const txList = filteredTx;
    const totalIn = txList.filter(t => t.type === "entrada").reduce((a,t) => a + Number(t.value), 0);
    const totalOut = txList.filter(t => t.type === "saida").reduce((a,t) => a + Number(t.value), 0);
    const balance = totalIn - totalOut;
    const pending = txList.filter(t => t.status === "pendente" || t.status === "atrasado").length;

    // Categories
    const cats = {};
    txList.filter(t => t.type === "saida").forEach(t => { cats[t.category || "Outros"] = (cats[t.category || "Outros"] || 0) + Number(t.value); });
    const catEntries = Object.entries(cats).sort((a,b) => b[1]-a[1]);

    addPageHeader("RELATÓRIO DE TRANSAÇÕES", `${monthLabel} · Empresa: ${company}`);

    let y = 50;
    // Info row
    drawInfoRow(y, [
      { label: "Empresa", value: company.slice(0, 28) },
      { label: "Responsável", value: user.slice(0, 20) },
      { label: "Período", value: monthLabel },
      { label: "Total de registros", value: String(txList.length) },
    ]);
    y += 16;

    // Summary boxes
    y = drawSummaryBoxes(y, [
      { label: "Total Entradas", value: fmt(totalIn), color: "success" },
      { label: "Total Saídas", value: fmt(totalOut), color: "danger" },
      { label: "Saldo do Período", value: fmt(balance), color: balance >= 0 ? "success" : "danger" },
      { label: "Pendentes", value: String(pending) + " lançamento(s)", color: "neutral" },
    ]);

    y += 6;

    // Table
    setTxt(C.dark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Lançamentos", ML, y);
    y += 6;

    const cols = [
      { label: "DATA", x: ML + 2 },
      { label: "DESCRIÇÃO", x: ML + 23 },
      { label: "CATEGORIA", x: ML + 100 },
      { label: "TIPO", x: ML + 140 },
      { label: "VALOR", x: MR - 2, align: "right" },
      { label: "STATUS", x: ML + 158 },
    ];
    y = drawTableHeader(y, cols);

    let pageNum = 1;
    const totalPagesRef = { count: 1 };
    txList.forEach((t, i) => {
      const res = checkPageBreak(y, 7, pageNum, totalPagesRef);
      y = res.y; pageNum = res.pageNum;
      const valColor = t.type === "entrada" ? C.success : C.danger;
      y = drawTableRow(y, [
        { text: fmtDate(t.date), x: ML + 2 },
        { text: (t.description || "").slice(0, 38), x: ML + 23 },
        { text: (t.category || "—").slice(0, 18), x: ML + 100 },
        { text: t.type === "entrada" ? "Entrada" : "Saída", x: ML + 140 },
        { text: fmt(t.value), x: MR - 2, align: "right", color: valColor },
        { text: t.status, x: ML + 158 },
      ], i % 2 === 0);
    });

    if (txList.length === 0) {
      setTxt(C.gray);
      doc.setFontSize(9);
      doc.text("Nenhuma transação no período selecionado.", ML + 4, y + 6);
      y += 14;
    }

    // Total line
    y += 2;
    setFill(C.dark);
    rect(ML, y, CW, 8);
    setTxt(C.accentLight);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("RESULTADO DO PERÍODO", ML + 4, y + 5.5);
    setTxt(balance >= 0 ? [150, 220, 160] : [240, 160, 155]);
    doc.text(fmt(balance), MR - 2, y + 5.5, { align: "right" });
    y += 12;

    // Categories breakdown (if space)
    if (catEntries.length > 0 && y < 230) {
      y += 4;
      setTxt(C.dark);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Despesas por Categoria", ML, y);
      y += 6;
      y = drawTableHeader(y, [
        { label: "CATEGORIA", x: ML + 4 },
        { label: "VALOR", x: ML + 100 },
        { label: "% DO TOTAL", x: MR - 2, align: "right" },
      ]);
      catEntries.forEach(([ cat, val ], i) => {
        const pct = totalOut > 0 ? ((val/totalOut)*100).toFixed(1) : "0.0";
        y = drawTableRow(y, [
          { text: cat.slice(0, 40), x: ML + 4 },
          { text: fmt(val), x: ML + 100, color: C.danger },
          { text: pct + "%", x: MR - 2, align: "right" },
        ], i % 2 === 0);
      });
    }

    addPageFooter(1, 1);
    doc.save(`infinity-transacoes-${new Date().toISOString().slice(0,10)}.pdf`);
  }

  // ══════════════════════════════════════════
  // PURCHASES REPORT
  // ══════════════════════════════════════════
  else if (type === "purchases") {
    const totalPurchases = purchases.reduce((a,p) => a + Number(p.total), 0);
    const delivered = purchases.filter(p => p.status === "entregue" || p.status === "ativo").length;
    const inTransit = purchases.filter(p => p.status === "em_transito").length;
    const cancelled = purchases.filter(p => p.status === "cancelado").length;

    // Suppliers
    const suppliers = {};
    purchases.forEach(p => { suppliers[p.supplier || "Sem fornecedor"] = (suppliers[p.supplier || "Sem fornecedor"] || 0) + Number(p.total); });
    const supEntries = Object.entries(suppliers).sort((a,b) => b[1]-a[1]);

    addPageHeader("RELATÓRIO DE COMPRAS", `Empresa: ${company} · ${dateStr}`);

    let y = 50;
    drawInfoRow(y, [
      { label: "Empresa", value: company.slice(0, 28) },
      { label: "Responsável", value: user.slice(0, 20) },
      { label: "Total de compras", value: String(purchases.length) },
      { label: "Data do relatório", value: dateStr },
    ]);
    y += 16;

    y = drawSummaryBoxes(y, [
      { label: "Total Gasto", value: fmt(totalPurchases), color: "danger" },
      { label: "Entregues / Ativos", value: String(delivered), color: "success" },
      { label: "Em Trânsito", value: String(inTransit), color: "neutral" },
      { label: "Cancelados", value: String(cancelled), color: "danger" },
    ]);

    y += 6;
    setTxt(C.dark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Lista de Compras", ML, y);
    y += 6;

    const cols = [
      { label: "DATA", x: ML + 2 },
      { label: "ITEM", x: ML + 22 },
      { label: "FORNECEDOR", x: ML + 80 },
      { label: "QTD", x: ML + 130 },
      { label: "UNIT.", x: ML + 145 },
      { label: "TOTAL", x: MR - 2, align: "right" },
      { label: "STATUS", x: ML + 158 },
    ];
    y = drawTableHeader(y, cols);

    let pageNum = 1;
    const totalPagesRef = { count: 1 };
    purchases.forEach((p, i) => {
      const res = checkPageBreak(y, 7, pageNum, totalPagesRef);
      y = res.y; pageNum = res.pageNum;
      y = drawTableRow(y, [
        { text: fmtDate(p.date), x: ML + 2 },
        { text: (p.item || "").slice(0, 25), x: ML + 22 },
        { text: (p.supplier || "—").slice(0, 18), x: ML + 80 },
        { text: String(p.qty), x: ML + 130 },
        { text: fmt(p.unit_price), x: ML + 145 },
        { text: fmt(p.total), x: MR - 2, align: "right", color: C.danger },
        { text: p.status, x: ML + 158 },
      ], i % 2 === 0);
    });

    if (purchases.length === 0) {
      setTxt(C.gray);
      doc.setFontSize(9);
      doc.text("Nenhuma compra registrada.", ML + 4, y + 6);
      y += 14;
    }

    // Total
    y += 2;
    setFill(C.dark);
    rect(ML, y, CW, 8);
    setTxt(C.accentLight);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL GASTO EM COMPRAS", ML + 4, y + 5.5);
    setTxt([240, 160, 155]);
    doc.text(fmt(totalPurchases), MR - 2, y + 5.5, { align: "right" });
    y += 12;

    // Suppliers breakdown
    if (supEntries.length > 0 && y < 230) {
      y += 4;
      setTxt(C.dark);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Gastos por Fornecedor", ML, y);
      y += 6;
      y = drawTableHeader(y, [
        { label: "FORNECEDOR", x: ML + 4 },
        { label: "TOTAL", x: ML + 100 },
        { label: "% DO TOTAL", x: MR - 2, align: "right" },
      ]);
      supEntries.forEach(([ sup, val ], i) => {
        const pct = totalPurchases > 0 ? ((val/totalPurchases)*100).toFixed(1) : "0.0";
        y = drawTableRow(y, [
          { text: sup.slice(0, 45), x: ML + 4 },
          { text: fmt(val), x: ML + 100, color: C.danger },
          { text: pct + "%", x: MR - 2, align: "right" },
        ], i % 2 === 0);
      });
    }

    addPageFooter(1, 1);
    doc.save(`infinity-compras-${new Date().toISOString().slice(0,10)}.pdf`);
  }

  // ══════════════════════════════════════════
  // FULL REPORT
  // ══════════════════════════════════════════
  else if (type === "completo") {
    const txIn = transactions.filter(t => t.type === "entrada").reduce((a,t) => a + Number(t.value), 0);
    const txOut = transactions.filter(t => t.type === "saida").reduce((a,t) => a + Number(t.value), 0);
    const totalPurchases = purchases.reduce((a,p) => a + Number(p.total), 0);
    const balance = txIn - txOut;

    addPageHeader("RELATÓRIO GERENCIAL COMPLETO", `Empresa: ${company} · ${dateStr}`);

    let y = 50;
    drawInfoRow(y, [
      { label: "Empresa", value: company.slice(0, 28) },
      { label: "Responsável", value: user.slice(0, 20) },
      { label: "Transações", value: String(transactions.length) },
      { label: "Compras", value: String(purchases.length) },
    ]);
    y += 16;

    y = drawSummaryBoxes(y, [
      { label: "Receitas totais", value: fmt(txIn), color: "success" },
      { label: "Despesas totais", value: fmt(txOut), color: "danger" },
      { label: "Saldo líquido", value: fmt(balance), color: balance >= 0 ? "success" : "danger" },
      { label: "Total em compras", value: fmt(totalPurchases), color: "danger" },
    ]);

    y += 6;

    // Monthly breakdown
    setTxt(C.dark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Fluxo Mensal", ML, y);
    y += 6;

    const monthlyData = months.map((m, i) => ({
      m,
      in: transactions.filter(t => t.type==="entrada" && new Date(t.date+"T12:00:00").getMonth()===i).reduce((a,t)=>a+Number(t.value),0),
      out: transactions.filter(t => t.type==="saida" && new Date(t.date+"T12:00:00").getMonth()===i).reduce((a,t)=>a+Number(t.value),0),
    })).filter(d => d.in > 0 || d.out > 0);

    y = drawTableHeader(y, [
      { label: "MÊS", x: ML + 4 },
      { label: "ENTRADAS", x: ML + 50 },
      { label: "SAÍDAS", x: ML + 100 },
      { label: "SALDO", x: MR - 2, align: "right" },
    ]);

    monthlyData.forEach((d, i) => {
      const saldo = d.in - d.out;
      y = drawTableRow(y, [
        { text: d.m + " 2026", x: ML + 4 },
        { text: fmt(d.in), x: ML + 50, color: C.success },
        { text: fmt(d.out), x: ML + 100, color: C.danger },
        { text: fmt(saldo), x: MR - 2, align: "right", color: saldo >= 0 ? C.success : C.danger },
      ], i % 2 === 0);
    });

    if (monthlyData.length === 0) {
      setTxt(C.gray);
      doc.setFontSize(9);
      doc.text("Nenhum dado mensal disponível.", ML + 4, y + 6);
      y += 14;
    }

    addPageFooter(1, 1);
    doc.save(`infinity-relatorio-completo-${new Date().toISOString().slice(0,10)}.pdf`);
  }
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
  const [companyData, setCompanyData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ─── UI STATE ───
  const [modalOpen, setModalOpen] = useState(null);
  const [monthFilter, setMonthFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");

  const emptyTx = { description:"", category:"", type:"saida", value:"", date:new Date().toISOString().slice(0,10), status:"pendente", recurring:false, recurMonths:2 };
  const emptyPurchase = { item:"", supplier:"", qty:1, unit_price:"", date:new Date().toISOString().slice(0,10), status:"em_transito" };

  const [newTx, setNewTx] = useState(emptyTx);
  const [editingTx, setEditingTx] = useState(null);
  const [newPurchase, setNewPurchase] = useState(emptyPurchase);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [newMember, setNewMember] = useState({ email:"", name:"", role:"viewer" });
  const [profileForm, setProfileForm] = useState({ name:"", email:"", password:"" });
  const [saveMsg, setSaveMsg] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [setupCompany, setSetupCompany] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");
  const avatarInputRef = useRef(null);

  // ─── SUPABASE AUTH ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (!session) { setCurrentUser(null); setCompanyData(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadProfile();
    else { setTransactions([]); setPurchases([]); setProfiles([]); }
  }, [session]);

  useEffect(() => {
    if (currentUser?.company_id) {
      loadTransactions();
      loadPurchases();
      loadProfiles();
      loadCompany();
    }
  }, [currentUser?.company_id]);

  // ─── DATA LOADERS ───
  const loadProfile = async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (data) {
      setCurrentUser(data);
      setProfileForm({ name: data.name, email: data.email, password: "" });
    } else if (error?.code === "PGRST116") {
      // Profile not found yet (trigger may be delayed) — retry once after 1s
      setTimeout(async () => {
        const { data: d2 } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (d2) { setCurrentUser(d2); setProfileForm({ name: d2.name, email: d2.email, password: "" }); }
      }, 1200);
    }
    setAuthLoading(false);
  };

  const loadCompany = async () => {
    if (!currentUser?.company_id) return;
    const { data } = await supabase.from("companies").select("*").eq("id", currentUser.company_id).single();
    if (data) setCompanyData(data);
  };

  // Called from "complete setup" screen when admin has no company yet
  const completeSetup = async () => {
    if (!setupCompany.trim()) { setSetupError("Informe o nome da empresa."); return; }
    setSetupLoading(true);
    setSetupError("");
    const { data: company, error: cErr } = await supabase.rpc("create_company_for_owner", {
      company_name: setupCompany.trim(),
      owner_name: currentUser.name || currentUser.email.split("@")[0],
      owner_email: currentUser.email,
    });
    if (cErr) { setSetupError("Erro ao criar empresa: " + cErr.message); setSetupLoading(false); return; }
    setCurrentUser(prev => ({ ...prev, company_id: company.id, role: "admin" }));
    setCompanyData(company);
    setSetupLoading(false);
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
    if (authMode === "register" && loginForm.password.length < 6) { setAuthError("Senha deve ter pelo menos 6 caracteres."); return; }
    setAuthSubmitting(true);
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: loginForm.email, password: loginForm.password });
        if (error) setAuthError(error.message === "Invalid login credentials" ? "Email ou senha incorretos." : error.message);
      } else {
        const { data: authData, error: signUpErr } = await supabase.auth.signUp({
          email: loginForm.email,
          password: loginForm.password,
          options: { data: { name: loginForm.name || loginForm.email.split("@")[0], role: "admin" } },
        });
        if (signUpErr) { setAuthError(signUpErr.message); return; }
        if (!authData.user) { setAuthError("Erro ao criar conta. Tente novamente."); return; }

        // Create company via SECURITY DEFINER function — bypasses RLS safely
        const ownerName = loginForm.name || loginForm.email.split("@")[0];
        const { error: companyErr } = await supabase.rpc("create_company_for_owner", {
          company_name: loginForm.company,
          owner_name: ownerName,
          owner_email: loginForm.email,
        });
        if (companyErr) { setAuthError("Erro ao criar empresa: " + companyErr.message); return; }
        // onAuthStateChange triggers profile reload automatically
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
    const val = parseFloat(newTx.value);
    const base = {
      company_id: currentUser.company_id,
      created_by: session.user.id,
      description: newTx.description,
      category: newTx.category,
      type: newTx.type,
      value: val,
      status: newTx.status,
    };

    if (newTx.recurring && newTx.recurMonths > 1) {
      // Recurring: create N transactions with incrementing months
      const groupId = crypto.randomUUID();
      const rows = [];
      for (let i = 0; i < newTx.recurMonths; i++) {
        const d = new Date(newTx.date + "T12:00:00");
        d.setMonth(d.getMonth() + i);
        rows.push({
          ...base,
          date: d.toISOString().slice(0, 10),
          recurrence_group: groupId,
        });
      }
      const { data, error } = await supabase.from("transactions").insert(rows).select();
      if (data) {
        setTransactions(prev => [...data.reverse(), ...prev]);
        setNewTx(emptyTx);
        setModalOpen(null);
      }
      if (error) alert("Erro ao salvar: " + error.message);
    } else {
      // Single transaction
      const { data, error } = await supabase.from("transactions").insert({
        ...base,
        date: newTx.date,
      }).select().single();
      if (data) {
        setTransactions(prev => [data, ...prev]);
        setNewTx(emptyTx);
        setModalOpen(null);
      }
      if (error) alert("Erro ao salvar: " + error.message);
    }
  };

  const saveEditTx = async () => {
    if (!editingTx.description || !editingTx.value || !editingTx.date) return;
    const { data, error } = await supabase.from("transactions").update({
      description: editingTx.description,
      category: editingTx.category,
      type: editingTx.type,
      value: parseFloat(editingTx.value),
      date: editingTx.date,
      status: editingTx.status,
    }).eq("id", editingTx.id).select().single();
    if (data) {
      setTransactions(prev => prev.map(t => t.id === data.id ? data : t));
      setEditingTx(null);
      setModalOpen(null);
    }
    if (error) alert("Erro ao atualizar: " + error.message);
  };

  // Settlement: mark a transaction as paid with actual value
  const [settlingTx, setSettlingTx] = useState(null);

  const settleTx = async () => {
    if (!settlingTx) return;
    const actualVal = parseFloat(settlingTx.actual_value_input);
    if (isNaN(actualVal) || actualVal < 0) return;
    const newStatus = settlingTx.type === "entrada" ? "recebido" : "pago";
    const { data, error } = await supabase.from("transactions").update({
      actual_value: actualVal,
      settled_at: new Date().toISOString().slice(0, 10),
      status: newStatus,
    }).eq("id", settlingTx.id).select().single();
    if (data) {
      setTransactions(prev => prev.map(t => t.id === data.id ? data : t));
      setSettlingTx(null);
      setModalOpen(null);
    }
    if (error) alert("Erro ao quitar: " + error.message);
  };

  const deleteTransaction = async (id) => {
    if (!confirm("Excluir esta transação?")) return;
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
      setNewPurchase(emptyPurchase);
      setModalOpen(null);
    }
    if (error) alert("Erro ao salvar: " + error.message);
  };

  const saveEditPurchase = async () => {
    if (!editingPurchase.item || !editingPurchase.unit_price) return;
    const total = editingPurchase.qty * parseFloat(editingPurchase.unit_price);
    const { data, error } = await supabase.from("purchases").update({
      item: editingPurchase.item,
      supplier: editingPurchase.supplier,
      qty: editingPurchase.qty,
      unit_price: parseFloat(editingPurchase.unit_price),
      total,
      date: editingPurchase.date,
      status: editingPurchase.status,
    }).eq("id", editingPurchase.id).select().single();
    if (data) {
      setPurchases(prev => prev.map(p => p.id === data.id ? data : p));
      setEditingPurchase(null);
      setModalOpen(null);
    }
    if (error) alert("Erro ao atualizar: " + error.message);
  };

  const deletePurchase = async (id) => {
    if (!confirm("Excluir esta compra?")) return;
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
      const { error: pwErr } = await supabase.auth.updateUser({ password: profileForm.password });
      if (pwErr) { setSaveMsg("Erro ao atualizar senha: " + pwErr.message); return; }
    }
    if (!error) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
      setSaveMsg("✓ Perfil salvo com sucesso!");
    } else {
      setSaveMsg("Erro ao salvar: " + error.message);
    }
    setTimeout(() => setSaveMsg(""), 3500);
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const allowed = ["jpg","jpeg","png","webp","gif"];
    if (!allowed.includes(ext)) { alert("Formato não suportado. Use JPG, PNG ou WebP."); return; }
    const path = `${session.user.id}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadErr) {
      // Bucket may not exist — create it first
      if (uploadErr.message.includes("Bucket not found") || uploadErr.message.includes("bucket")) {
        await supabase.storage.createBucket("avatars", { public: true });
        const { error: retryErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
        if (retryErr) { alert("Erro ao enviar foto: " + retryErr.message); return; }
      } else {
        alert("Erro ao enviar foto: " + uploadErr.message);
        return;
      }
    }
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
    if (!confirm("Remover este membro da empresa?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", profileId);
    if (!error) setProfiles(prev => prev.filter(p => p.id !== profileId));
    else alert("Sem permissão para remover.");
  };

  const inviteMember = async () => {
    setInviteMsg("");
    if (!newMember.email || !newMember.name) { setInviteMsg("Preencha nome e email."); return; }
    setInviteLoading(true);
    // Save admin session tokens before creating user
    const { data: { session: adminSession } } = await supabase.auth.getSession();
    const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
    const { data: authData, error: signUpErr } = await supabase.auth.signUp({
      email: newMember.email,
      password: tempPassword,
      options: { data: { name: newMember.name, role: newMember.role } },
    });
    // If admin was auto-signed out by the signUp, restore admin session
    const { data: { session: afterSession } } = await supabase.auth.getSession();
    if (afterSession?.user?.id !== adminSession?.user?.id) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }
    setInviteLoading(false);
    if (signUpErr) { setInviteMsg("Erro ao criar conta: " + signUpErr.message); return; }
    if (!authData?.user?.id) { setInviteMsg("Erro: não foi possível criar o usuário."); return; }
    // Link to company
    const { error: profileErr } = await supabase.from("profiles")
      .update({ company_id: currentUser.company_id, name: newMember.name, email: newMember.email, role: newMember.role })
      .eq("id", authData.user.id);
    if (profileErr) { setInviteMsg("Usuário criado, mas erro ao vincular à empresa: " + profileErr.message); return; }
    await loadProfiles();
    setInviteMsg(`✓ ${newMember.name} adicionado à equipe! Senha temporária: ${tempPassword}`);
    setNewMember({ email:"", name:"", role:"viewer" });
  };

  // ─── PERMISSIONS ───
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "editor";
  const isAdmin = currentUser?.role === "admin";

  // ─── COMPUTED ───
  const filteredTx = transactions.filter(t => {
    const matchMonth = monthFilter === "all" || new Date(t.date + "T12:00:00").getMonth() === parseInt(monthFilter);
    const matchSearch = !searchTerm || (t.description || "").toLowerCase().includes(searchTerm.toLowerCase()) || (t.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = txTypeFilter === "all" || t.type === txTypeFilter;
    return matchMonth && matchSearch && matchType;
  });
  const totalIn = filteredTx.filter(t => t.type === "entrada").reduce((a, t) => a + Number(t.value), 0);
  const totalOut = filteredTx.filter(t => t.type === "saida").reduce((a, t) => a + Number(t.value), 0);
  const balance = totalIn - totalOut;
  const pendingCount = transactions.filter(t => t.status === "pendente" || t.status === "atrasado").length;
  const totalPurchasesVal = purchases.reduce((a,p) => a + Number(p.total), 0);
  // Previsto x Realizado
  const totalPrevisto = filteredTx.reduce((a, t) => a + Number(t.value), 0);
  const totalRealizado = filteredTx.filter(t => t.actual_value != null).reduce((a, t) => a + Number(t.actual_value), 0);
  const settledCount = filteredTx.filter(t => t.actual_value != null).length;

  const expenseCategories = {};
  filteredTx.filter(t => t.type === "saida").forEach(t => { expenseCategories[t.category || "Outros"] = (expenseCategories[t.category || "Outros"] || 0) + Number(t.value); });
  const catColors = ["#B8926A","#7BA387","#C4716C","#D4A843","#9C8E7C","#6B5B4E","#5A8FA5"];

  const cashFlowData = months.map((m, i) => ({
    m, i,
    in: transactions.filter(t => t.type === "entrada" && new Date(t.date + "T12:00:00").getMonth() === i).reduce((a, t) => a + Number(t.value), 0),
    out: transactions.filter(t => t.type === "saida" && new Date(t.date + "T12:00:00").getMonth() === i).reduce((a, t) => a + Number(t.value), 0),
  })).filter(d => d.in > 0 || d.out > 0).slice(-6);

  const monthLabel = monthFilter === "all" ? "Todos os meses" : months[parseInt(monthFilter)] + " 2026";
  const companyName = companyData?.name || currentUser?.email?.split("@")[0] || "Empresa";

  const navItems = [
    { id:"dashboard", icon:"dashboard", label:"Dashboard" },
    { id:"contas", icon:"wallet", label:"Contas" },
    { id:"compras", icon:"cart", label:"Compras" },
    { id:"relatorios", icon:"chart", label:"Relatórios" },
    { id:"perfis", icon:"users", label:"Equipe" },
    { id:"perfil", icon:"user", label:"Meu Perfil" },
    { id:"config", icon:"settings", label:"Configurações" },
  ];

  // ─── LOADING SCREEN ───
  if (authLoading) return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)" }}>
        <div style={{ textAlign:"center" }}>
          <img src="/infinity_app/logo.svg" alt="Infinity" style={{ width:56, height:56, marginBottom:4 }} />
          <p style={{ color:"var(--taupe)", fontSize:14 }}>Carregando...</p>
        </div>
      </div>
    </>
  );

  // ─── NO COMPANY SCREEN ───
  if (session && currentUser && !currentUser.company_id) {
    // Admin without company = incomplete signup → let them finish setup
    const isAdminSetup = currentUser.role === "admin";
    return (
      <>
        <style>{globalCSS}</style>
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg, var(--cream) 0%, var(--beige) 50%, var(--sand) 100%)", padding:20 }}>
          <div className="card anim-expand" style={{ width:"100%", maxWidth:440, padding:0, overflow:"hidden" }}>
            <div style={{ background:"linear-gradient(135deg, var(--dark) 0%, var(--brown) 100%)", padding:"22px 32px", display:"flex", alignItems:"center", gap:12 }}>
              <img src="/infinity_app/logo.svg" alt="Infinity" style={{ width:38, height:38 }} />
              <span style={{ fontSize:22, fontWeight:700, color:"white", fontFamily:"'Playfair Display', serif" }}>Infinity</span>
            </div>
            <div style={{ padding:"32px 32px 28px" }}>
              {isAdminSetup ? (
                <>
                  <h2 style={{ color:"var(--dark)", fontFamily:"'Playfair Display', serif", marginBottom:8 }}>Concluir Cadastro</h2>
                  <p style={{ color:"var(--taupe)", fontSize:13, lineHeight:1.6, marginBottom:24 }}>
                    Conta criada! Agora informe o nome da sua empresa para começar a usar o sistema.
                  </p>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Nome da Empresa *</label>
                      <input
                        placeholder="Ex: Minha Empresa Ltda"
                        value={setupCompany}
                        onChange={e => setSetupCompany(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && completeSetup()}
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={completeSetup}
                      disabled={setupLoading}
                      className="btn-press"
                      style={{ width:"100%", padding:"12px", borderRadius:8, border:"none", background:setupLoading?"var(--warm-gray)":"var(--accent)", color:"white", fontSize:15, fontWeight:600, fontFamily:"inherit", cursor:setupLoading?"not-allowed":"pointer" }}
                    >
                      {setupLoading ? "Criando..." : "Criar Empresa e Entrar"}
                    </button>
                    {setupError && (
                      <div style={{ padding:"10px 14px", borderRadius:8, background:"#FFEBEE", color:"var(--danger)", fontSize:13 }}>
                        {setupError}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ color:"var(--accent)", marginBottom:16, textAlign:"center" }}><Icon name="group" size={48} /></div>
                  <h2 style={{ color:"var(--dark)", fontFamily:"'Playfair Display', serif", marginBottom:12, textAlign:"center" }}>Aguardando vinculação</h2>
                  <p style={{ color:"var(--taupe)", fontSize:14, lineHeight:1.6, marginBottom:20, textAlign:"center" }}>
                    Sua conta foi criada, mas ainda não está vinculada a uma empresa.<br/>
                    Peça ao administrador para te adicionar à equipe.
                  </p>
                  <p style={{ color:"var(--warm-gray)", fontSize:12, marginBottom:20, textAlign:"center" }}>Logado como: <strong>{currentUser.email}</strong></p>
                </>
              )}
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:isAdminSetup ? 4 : 0 }}>
                <button onClick={loadProfile} className="btn-press" style={{ padding:"9px 18px", borderRadius:8, border:"1.5px solid var(--sand)", background:"transparent", color:"var(--taupe)", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <Icon name="refresh" size={14} /> Atualizar
                </button>
                <button onClick={() => supabase.auth.signOut()} className="btn-press" style={{ padding:"9px 18px", borderRadius:8, border:"none", background:"var(--beige)", color:"var(--dark)", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer" }}>
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── AUTH SCREEN ───
  if (!session || !currentUser) return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg, var(--cream) 0%, var(--beige) 50%, var(--sand) 100%)", padding:20 }}>
        <div className="card anim-expand" style={{ width:"100%", maxWidth:440, padding:0, overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg, var(--dark) 0%, var(--brown) 100%)", padding:"40px 32px 32px", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:12, marginBottom:8 }}>
              <img src="/infinity_app/logo.svg" alt="Infinity" style={{ width:48, height:48 }} />
              <span style={{ fontSize:28, fontWeight:700, color:"white", fontFamily:"'Playfair Display', serif", letterSpacing:1 }}>Infinity</span>
            </div>
            <p style={{ color:"var(--warm-gray)", fontSize:13, marginTop:4 }}>Gestão financeira inteligente</p>
          </div>
          <div style={{ padding:"32px 32px 28px" }}>
            <div style={{ display:"flex", marginBottom:24, borderRadius:8, overflow:"hidden", border:"1.5px solid var(--sand)" }}>
              {["login","register"].map(m => (
                <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }} className="btn-press" style={{ flex:1, padding:"10px 0", border:"none", background:authMode===m?"var(--accent)":"transparent", color:authMode===m?"white":"var(--taupe)", fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .2s" }}>
                  {m === "login" ? "Entrar" : "Criar Conta"}
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
      {/* Welcome */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>
            Olá, {currentUser.name?.split(" ")[0]} 👋
          </h2>
          <p style={{ color:"var(--taupe)", fontSize:14, marginTop:2 }}>{companyName} · {new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" })}</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addTx")}>Nova Conta</Btn>}
          {canEdit && <Btn icon="cart" variant="secondary" onClick={() => setModalOpen("addPurchase")}>Nova Compra</Btn>}
        </div>
      </div>
      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16 }}>
        <StatCard label="Receitas" value={fmt(totalIn)} icon="arrow_up" color="var(--success)" delay={0} />
        <StatCard label="Despesas" value={fmt(totalOut)} icon="arrow_down" color="var(--danger)" delay={0.08} />
        <StatCard label="Saldo" value={fmt(balance)} icon="wallet" color={balance>=0?"var(--success)":"var(--danger)"} delay={0.16} />
        <StatCard label="Pendentes" value={pendingCount} icon="bell" color="var(--warning)" delay={0.24} />
      </div>
      {/* Charts */}
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
                {Object.entries(expenseCategories).sort((a,b)=>b[1]-a[1]).map(([cat, val], i) => {
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
      {/* Recent transactions */}
      <div className="card anim-expand" style={{ padding:24, animationDelay:"0.45s" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:12 }}>
          <h3 style={{ fontSize:15, fontWeight:600 }}>Últimas Movimentações</h3>
          <Btn variant="ghost" style={{ fontSize:12, padding:"6px 14px" }} onClick={() => setPage("contas")}>Ver todas</Btn>
        </div>
        {dataLoading ? <p style={{ color:"var(--warm-gray)", fontSize:13, padding:20 }}>Carregando...</p> : transactions.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:"var(--warm-gray)" }}>
            <p style={{ marginBottom:12 }}>Nenhuma transação ainda.</p>
            {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addTx")}>Adicionar primeira transação</Btn>}
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 4px" }}>
              <thead><tr style={{ fontSize:11, color:"var(--taupe)", textAlign:"left" }}>
                <th style={{ padding:"6px 10px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Descrição</th>
                <th style={{ padding:"6px 10px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }} className="desktop-only">Categoria</th>
                <th style={{ padding:"6px 10px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Valor</th>
                <th style={{ padding:"6px 10px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }} className="desktop-only">Data</th>
                <th style={{ padding:"6px 10px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Status</th>
              </tr></thead>
              <tbody>{transactions.slice(0,7).map((t, i) => (
                <tr key={t.id} style={{ background:i%2===0?"var(--cream)":"transparent", animation:`slideUp 0.3s ${i*0.05}s both` }}>
                  <td style={{ padding:"11px 10px", borderRadius:"8px 0 0 8px", fontSize:14 }}>{t.description}</td>
                  <td style={{ padding:"11px 10px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{t.category || "—"}</td>
                  <td style={{ padding:"11px 10px", fontWeight:700, color:t.type==="entrada"?"var(--success)":"var(--danger)", whiteSpace:"nowrap" }}>{t.type==="entrada"?"+ ":"- "}{fmt(t.value)}</td>
                  <td style={{ padding:"11px 10px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{fmtDate(t.date)}</td>
                  <td style={{ padding:"11px 10px", borderRadius:"0 8px 8px 0" }}><Badge status={t.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
      {/* Purchases summary */}
      {purchases.length > 0 && (
        <div className="card anim-expand" style={{ padding:24, animationDelay:"0.5s" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ fontSize:15, fontWeight:600 }}>Últimas Compras</h3>
            <Btn variant="ghost" style={{ fontSize:12, padding:"6px 14px" }} onClick={() => setPage("compras")}>Ver todas</Btn>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12 }}>
            {purchases.slice(0,4).map((p, i) => (
              <div key={p.id} style={{ background:"var(--cream)", borderRadius:12, padding:14, display:"flex", flexDirection:"column", gap:8, animation:`slideUp 0.3s ${i*0.07}s both` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ fontSize:14, fontWeight:600 }}>{p.item}</span>
                  <Badge status={p.status} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                  <span style={{ color:"var(--taupe)" }}>{p.supplier || "—"}</span>
                  <span style={{ fontWeight:700, color:"var(--accent)" }}>{fmt(p.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContas = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Gestão de Contas</h2>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addTx")}>Nova Conta</Btn>}
          <Btn icon="download" variant="ghost" onClick={() => buildPDF({ type:"transactions", company:companyName, user:currentUser.name, transactions, purchases, filteredTx, monthLabel })}>PDF</Btn>
        </div>
      </div>
      {/* Filters */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--warm-gray)" }}><Icon name="search" size={16} /></div>
          <input placeholder="Buscar descrição ou categoria..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft:38 }} />
        </div>
        <select value={txTypeFilter} onChange={e => setTxTypeFilter(e.target.value)} style={{ width:"auto", minWidth:130 }}>
          <option value="all">Todos os tipos</option>
          <option value="entrada">Entradas</option>
          <option value="saida">Saídas</option>
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ width:"auto", minWidth:140 }}>
          <option value="all">Todos os meses</option>
          {months.map((m, i) => <option key={i} value={i}>{m} 2026</option>)}
        </select>
      </div>
      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(155px, 1fr))", gap:12 }}>
        <div className="card anim-fade" style={{ padding:16, borderLeft:"4px solid var(--success)" }}>
          <span style={{ fontSize:10, color:"var(--taupe)", fontWeight:600, textTransform:"uppercase", letterSpacing:.3 }}>Entradas</span>
          <p style={{ fontSize:20, fontWeight:700, color:"var(--success)", marginTop:4 }}>{fmt(totalIn)}</p>
        </div>
        <div className="card anim-fade" style={{ padding:16, borderLeft:"4px solid var(--danger)", animationDelay:"0.05s" }}>
          <span style={{ fontSize:10, color:"var(--taupe)", fontWeight:600, textTransform:"uppercase", letterSpacing:.3 }}>Saídas</span>
          <p style={{ fontSize:20, fontWeight:700, color:"var(--danger)", marginTop:4 }}>{fmt(totalOut)}</p>
        </div>
        <div className="card anim-fade" style={{ padding:16, borderLeft:"4px solid var(--accent)", animationDelay:"0.1s" }}>
          <span style={{ fontSize:10, color:"var(--taupe)", fontWeight:600, textTransform:"uppercase", letterSpacing:.3 }}>Saldo</span>
          <p style={{ fontSize:20, fontWeight:700, color:balance>=0?"var(--success)":"var(--danger)", marginTop:4 }}>{fmt(balance)}</p>
        </div>
        <div className="card anim-fade" style={{ padding:16, borderLeft:"4px solid var(--warning)", animationDelay:"0.15s" }}>
          <span style={{ fontSize:10, color:"var(--taupe)", fontWeight:600, textTransform:"uppercase", letterSpacing:.3 }}>Pendentes</span>
          <p style={{ fontSize:20, fontWeight:700, color:"var(--warning)", marginTop:4 }}>{filteredTx.filter(t=>t.status==="pendente"||t.status==="atrasado").length}</p>
        </div>
        <div className="card anim-fade" style={{ padding:16, borderLeft:"4px solid #1565C0", animationDelay:"0.2s" }}>
          <span style={{ fontSize:10, color:"var(--taupe)", fontWeight:600, textTransform:"uppercase", letterSpacing:.3 }}>Previsto</span>
          <p style={{ fontSize:20, fontWeight:700, color:"#1565C0", marginTop:4 }}>{fmt(totalPrevisto)}</p>
        </div>
        <div className="card anim-fade" style={{ padding:16, borderLeft:"4px solid #7B1FA2", animationDelay:"0.25s" }}>
          <span style={{ fontSize:10, color:"var(--taupe)", fontWeight:600, textTransform:"uppercase", letterSpacing:.3 }}>Realizado ({settledCount})</span>
          <p style={{ fontSize:20, fontWeight:700, color:"#7B1FA2", marginTop:4 }}>{fmt(totalRealizado)}</p>
        </div>
      </div>
      {/* Table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"var(--beige)", fontSize:11, color:"var(--taupe)", textAlign:"left" }}>
              <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Descrição</th>
              <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }} className="desktop-only">Categoria</th>
              <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Previsto</th>
              <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }} className="desktop-only">Realizado</th>
              <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }} className="desktop-only">Data</th>
              <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Status</th>
              {canEdit && <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Ações</th>}
            </tr></thead>
            <tbody>{filteredTx.map((t, i) => {
              const isSettled = t.actual_value != null;
              const diff = isSettled ? Number(t.actual_value) - Number(t.value) : null;
              return (
              <tr key={t.id} style={{ borderBottom:"1px solid var(--beige)", animation:`slideUp 0.3s ${Math.min(i,8)*0.04}s both` }}>
                <td style={{ padding:"13px 14px", fontSize:14 }}>
                  {t.description}
                  {t.recurrence_group && <span style={{ fontSize:10, color:"var(--taupe)", marginLeft:6 }} title="Recorrente">🔁</span>}
                </td>
                <td style={{ padding:"13px 14px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{t.category || "—"}</td>
                <td style={{ padding:"13px 14px", fontWeight:600, color:t.type==="entrada"?"var(--success)":"var(--danger)", whiteSpace:"nowrap" }}>{t.type==="entrada"?"+ ":"- "}{fmt(t.value)}</td>
                <td style={{ padding:"13px 14px" }} className="desktop-only">
                  {isSettled ? (
                    <span style={{ fontWeight:700, color:"#7B1FA2" }}>
                      {fmt(t.actual_value)}
                      {diff !== 0 && <span style={{ fontSize:11, marginLeft:4, color:diff>0?"var(--danger)":"var(--success)" }}>({diff>0?"+":""}{fmt(diff)})</span>}
                    </span>
                  ) : <span style={{ color:"var(--warm-gray)", fontSize:12 }}>—</span>}
                </td>
                <td style={{ padding:"13px 14px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{fmtDate(t.date)}</td>
                <td style={{ padding:"13px 14px" }}><Badge status={t.status} /></td>
                {canEdit && <td style={{ padding:"13px 14px" }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {!isSettled && (t.status === "pendente" || t.status === "atrasado") && (
                      <div className="btn-press" onClick={() => { setSettlingTx({ ...t, actual_value_input: String(t.value) }); setModalOpen("settleTx"); }} title="Quitar" style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"#E8F5E9", color:"#2E7D32", cursor:"pointer", fontWeight:700, fontSize:13 }}>✓</div>
                    )}
                    <div className="btn-press" onClick={() => { setEditingTx({...t}); setModalOpen("editTx"); }} style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)", color:"var(--accent)", cursor:"pointer" }}><Icon name="edit" size={14} /></div>
                    <div className="btn-press" onClick={() => deleteTransaction(t.id)} style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)", color:"var(--danger)", cursor:"pointer" }}><Icon name="trash" size={14} /></div>
                  </div>
                </td>}
              </tr>
              );
            })}</tbody>
          </table>
        </div>
        {filteredTx.length === 0 && !dataLoading && (
          <div style={{ padding:40, textAlign:"center", color:"var(--warm-gray)" }}>
            {transactions.length === 0 ? "Nenhuma transação ainda." : "Nenhuma transação encontrada com esses filtros."}
          </div>
        )}
        {dataLoading && <div style={{ padding:30, textAlign:"center", color:"var(--warm-gray)" }}>Carregando...</div>}
      </div>
    </div>
  );

  const renderCompras = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Compras & Fornecedores</h2>
        <div style={{ display:"flex", gap:10 }}>
          {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addPurchase")}>Nova Compra</Btn>}
          <Btn icon="download" variant="ghost" onClick={() => buildPDF({ type:"purchases", company:companyName, user:currentUser.name, transactions, purchases, filteredTx, monthLabel })}>PDF</Btn>
        </div>
      </div>
      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))", gap:12 }}>
        {[
          { label:"Total Gasto", value:fmt(totalPurchasesVal), color:"var(--danger)" },
          { label:"Em Trânsito", value:purchases.filter(p=>p.status==="em_transito").length, color:"#1565C0" },
          { label:"Entregues", value:purchases.filter(p=>p.status==="entregue"||p.status==="ativo").length, color:"var(--success)" },
          { label:"Cancelados", value:purchases.filter(p=>p.status==="cancelado").length, color:"var(--warm-gray)" },
        ].map((s, i) => (
          <div key={i} className="card anim-fade" style={{ padding:16, animationDelay:`${i*0.06}s` }}>
            <span style={{ fontSize:11, color:"var(--taupe)", fontWeight:600, textTransform:"uppercase" }}>{s.label}</span>
            <p style={{ fontSize:20, fontWeight:700, color:s.color, marginTop:4 }}>{s.value}</p>
          </div>
        ))}
      </div>
      {purchases.length === 0 ? (
        <div className="card" style={{ padding:50, textAlign:"center", color:"var(--warm-gray)" }}>
          <p style={{ marginBottom:14, fontSize:15 }}>Nenhuma compra registrada ainda.</p>
          {canEdit && <Btn icon="plus" onClick={() => setModalOpen("addPurchase")}>Registrar primeira compra</Btn>}
        </div>
      ) : (
        <div className="card" style={{ overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr style={{ background:"var(--beige)", fontSize:11, color:"var(--taupe)", textAlign:"left" }}>
                <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Item</th>
                <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }} className="desktop-only">Fornecedor</th>
                <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }} className="desktop-only">Qtd</th>
                <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Total</th>
                <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }} className="desktop-only">Data</th>
                <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Status</th>
                {canEdit && <th style={{ padding:"12px 14px", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>Ações</th>}
              </tr></thead>
              <tbody>{purchases.map((p, i) => (
                <tr key={p.id} style={{ borderBottom:"1px solid var(--beige)", animation:`slideUp 0.3s ${Math.min(i,8)*0.04}s both` }}>
                  <td style={{ padding:"13px 14px", fontSize:14, fontWeight:500 }}>{p.item}</td>
                  <td style={{ padding:"13px 14px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{p.supplier || "—"}</td>
                  <td style={{ padding:"13px 14px", fontSize:13 }} className="desktop-only">{p.qty}x <span style={{ color:"var(--taupe)", fontSize:12 }}>({fmt(p.unit_price)} un.)</span></td>
                  <td style={{ padding:"13px 14px", fontWeight:700, color:"var(--accent)" }}>{fmt(p.total)}</td>
                  <td style={{ padding:"13px 14px", fontSize:13, color:"var(--taupe)" }} className="desktop-only">{fmtDate(p.date)}</td>
                  <td style={{ padding:"13px 14px" }}><Badge status={p.status} /></td>
                  {canEdit && <td style={{ padding:"13px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <div className="btn-press" onClick={() => { setEditingPurchase({...p}); setModalOpen("editPurchase"); }} style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)", color:"var(--accent)", cursor:"pointer" }}><Icon name="edit" size={14} /></div>
                      <div className="btn-press" onClick={() => deletePurchase(p.id)} style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)", color:"var(--danger)", cursor:"pointer" }}><Icon name="trash" size={14} /></div>
                    </div>
                  </td>}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderRelatorios = () => {
    const reportTypes = [
      { title:"Fluxo de Caixa / Transações", desc:"Todas as entradas e saídas do período, com categorias e resumo.", icon:"wallet", type:"transactions" },
      { title:"Compras & Fornecedores", desc:"Consolidado de compras com total por fornecedor.", icon:"cart", type:"purchases" },
      { title:"Relatório Gerencial Completo", desc:"Visão completa: fluxo mensal, transações e compras.", icon:"chart", type:"completo" },
    ];
    const monthlyData = months.map((m, i) => ({
      m, i,
      in: transactions.filter(t => t.type==="entrada" && new Date(t.date+"T12:00:00").getMonth()===i).reduce((a,t)=>a+Number(t.value),0),
      out: transactions.filter(t => t.type==="saida" && new Date(t.date+"T12:00:00").getMonth()===i).reduce((a,t)=>a+Number(t.value),0),
    })).filter(d => d.in > 0 || d.out > 0);

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Relatórios</h2>
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ width:"auto", minWidth:160 }}>
            <option value="all">Todos os meses</option>
            {months.map((m, i) => <option key={i} value={i}>{m} 2026</option>)}
          </select>
        </div>
        {/* Report cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
          {reportTypes.map((r, i) => (
            <div key={i} className="card anim-expand" style={{ padding:24, animationDelay:`${i*0.07}s`, display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg, var(--beige), var(--cream))", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--accent)", border:"1.5px solid var(--sand)" }}><Icon name={r.icon} size={22} /></div>
              <div>
                <h4 style={{ fontSize:15, fontWeight:600 }}>{r.title}</h4>
                <p style={{ fontSize:13, color:"var(--taupe)", marginTop:4, lineHeight:1.55 }}>{r.desc}</p>
              </div>
              <Btn variant="primary" icon="download" onClick={() => buildPDF({ type:r.type, company:companyName, user:currentUser.name, transactions, purchases, filteredTx, monthLabel })} style={{ fontSize:13, padding:"9px 16px" }}>
                Gerar PDF
              </Btn>
            </div>
          ))}
        </div>
        {/* Summary visuals */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:12 }}>
          {[
            { label:"Total Entradas", value:fmt(totalIn), color:"var(--success)", border:"var(--success)" },
            { label:"Total Saídas", value:fmt(totalOut), color:"var(--danger)", border:"var(--danger)" },
            { label:"Saldo do Período", value:fmt(balance), color:balance>=0?"var(--success)":"var(--danger)", border:"var(--accent)" },
            { label:"Total em Compras", value:fmt(totalPurchasesVal), color:"var(--accent)", border:"var(--accent)" },
          ].map((s,i) => (
            <div key={i} className="card anim-fade" style={{ padding:18, borderLeft:`4px solid ${s.border}`, animationDelay:`${i*0.07}s` }}>
              <span style={{ fontSize:11, color:"var(--taupe)", fontWeight:600, textTransform:"uppercase", letterSpacing:.4 }}>{s.label}</span>
              <p style={{ fontSize:22, fontWeight:700, color:s.color, marginTop:6 }}>{s.value}</p>
            </div>
          ))}
        </div>
        {/* Cash flow chart */}
        {cashFlowData.length > 0 && (
          <div className="card anim-slide" style={{ padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Fluxo de Caixa — Histórico</h3>
            <MiniBarChart data={cashFlowData} height={200} />
            <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--taupe)" }}><div style={{ width:10, height:10, borderRadius:3, background:"var(--success)" }} />Entradas</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--taupe)" }}><div style={{ width:10, height:10, borderRadius:3, background:"var(--danger)" }} />Saídas</div>
            </div>
          </div>
        )}
        {/* Monthly table */}
        {monthlyData.length > 0 && (
          <div className="card" style={{ overflow:"hidden" }}>
            <div style={{ padding:"20px 24px 12px" }}>
              <h3 style={{ fontSize:15, fontWeight:600 }}>Resultado Mensal</h3>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:"var(--beige)", fontSize:11, color:"var(--taupe)", textAlign:"left" }}>
                  <th style={{ padding:"10px 14px", fontWeight:600, textTransform:"uppercase" }}>Mês</th>
                  <th style={{ padding:"10px 14px", fontWeight:600, textTransform:"uppercase" }}>Entradas</th>
                  <th style={{ padding:"10px 14px", fontWeight:600, textTransform:"uppercase" }}>Saídas</th>
                  <th style={{ padding:"10px 14px", fontWeight:600, textTransform:"uppercase" }}>Saldo</th>
                </tr></thead>
                <tbody>{monthlyData.map((d, i) => {
                  const saldo = d.in - d.out;
                  return (
                    <tr key={i} style={{ borderBottom:"1px solid var(--beige)" }}>
                      <td style={{ padding:"12px 14px", fontWeight:500 }}>{d.m} 2026</td>
                      <td style={{ padding:"12px 14px", color:"var(--success)", fontWeight:600 }}>{fmt(d.in)}</td>
                      <td style={{ padding:"12px 14px", color:"var(--danger)", fontWeight:600 }}>{fmt(d.out)}</td>
                      <td style={{ padding:"12px 14px", fontWeight:700, color:saldo>=0?"var(--success)":"var(--danger)" }}>{fmt(saldo)}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        )}
        {/* Categories breakdown */}
        {Object.entries(expenseCategories).length > 0 && (
          <div className="card anim-slide" style={{ padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Despesas por Categoria</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {Object.entries(expenseCategories).sort((a,b)=>b[1]-a[1]).map(([cat, val], i) => {
                const pct = Math.round((val / totalOut) * 100);
                return (
                  <div key={i}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                      <span style={{ color:"var(--taupe)", fontWeight:500 }}>{cat}</span>
                      <span style={{ fontWeight:700 }}>{fmt(val)} <span style={{ color:"var(--warm-gray)", fontWeight:400, fontSize:12 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height:8, background:"var(--beige)", borderRadius:4 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:catColors[i % catColors.length], borderRadius:4, transition:"width .8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPerfis = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Equipe</h2>
          <p style={{ color:"var(--taupe)", fontSize:13, marginTop:2 }}>{profiles.length} membro(s) · {companyName}</p>
        </div>
        {isAdmin && <Btn icon="mail" onClick={() => setModalOpen("inviteMember")}>Convidar Membro</Btn>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
        {profiles.map((p, i) => (
          <div key={p.id} className="card anim-expand" style={{ padding:24, animationDelay:`${i*0.08}s` }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <Avatar user={p} size={54} />
              <div style={{ flex:1, minWidth:0 }}>
                <h4 style={{ fontSize:15, fontWeight:600 }}>{p.name} {p.id === session.user.id && <span style={{ fontSize:11, color:"var(--taupe)", fontWeight:400 }}>(você)</span>}</h4>
                <p style={{ fontSize:12, color:"var(--taupe)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.email}</p>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
              {isAdmin && p.id !== session.user.id ? (
                <select value={p.role} onChange={e => updateMemberRole(p.id, e.target.value)} style={{ width:"auto", minWidth:140, padding:"7px 12px", fontSize:13 }}>
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                </select>
              ) : (
                <span style={{ padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, background: p.role==="admin"?"#E3F2FD":p.role==="editor"?"#FFF8E1":"var(--beige)", color:p.role==="admin"?"#1565C0":p.role==="editor"?"#F57F17":"var(--taupe)" }}>
                  {p.role === "admin" ? "Administrador" : p.role === "editor" ? "Editor" : "Visualizador"}
                </span>
              )}
              {isAdmin && p.id !== session.user.id && (
                <div className="btn-press" onClick={() => removeMember(p.id)} style={{ width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)", color:"var(--danger)", cursor:"pointer" }}>
                  <Icon name="trash" size={14} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Permissions reference */}
      <div className="card anim-slide" style={{ padding:24 }}>
        <h3 style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Referência de Permissões</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:12 }}>
          {[
            { role:"Administrador", perms:["Ver tudo", "Criar e editar", "Excluir registros", "Gerenciar equipe", "Exportar PDFs"], color:"#1565C0", bg:"#E3F2FD" },
            { role:"Editor", perms:["Ver tudo", "Criar e editar transações", "Criar e editar compras", "Exportar PDFs"], color:"#F57F17", bg:"#FFF8E1" },
            { role:"Visualizador", perms:["Ver transações", "Ver compras", "Ver relatórios", "Exportar PDFs"], color:"#7B1FA2", bg:"#F3E5F5" },
          ].map((r, i) => (
            <div key={i} style={{ background:r.bg, borderRadius:12, padding:16, border:`1.5px solid ${r.color}20` }}>
              <span style={{ fontSize:13, fontWeight:700, color:r.color }}>{r.role}</span>
              <ul style={{ marginTop:8, paddingLeft:0, listStyle:"none", display:"flex", flexDirection:"column", gap:5 }}>
                {r.perms.map((p, j) => (
                  <li key={j} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--dark)" }}>
                    <span style={{ color:r.color, fontSize:14 }}>✓</span> {p}
                  </li>
                ))}
              </ul>
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
        {/* Avatar section */}
        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28, paddingBottom:24, borderBottom:"1px solid var(--beige)" }}>
          <div style={{ position:"relative" }}>
            <Avatar user={currentUser} size={80} />
            <div className="btn-press" onClick={() => avatarInputRef.current?.click()} style={{ position:"absolute", bottom:-4, right:-4, width:28, height:28, borderRadius:8, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", cursor:"pointer", boxShadow:"0 2px 8px rgba(184,146,106,.4)" }}>
              <Icon name="upload" size={14} />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => uploadAvatar(e.target.files[0])} />
          </div>
          <div>
            <h3 style={{ fontSize:20, fontWeight:700 }}>{currentUser.name}</h3>
            <p style={{ fontSize:13, color:"var(--taupe)", marginTop:2 }}>{currentUser.email}</p>
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              <span style={{ padding:"3px 12px", borderRadius:12, fontSize:11, fontWeight:600, background:"#E3F2FD", color:"#1565C0" }}>
                {currentUser.role === "admin" ? "Administrador" : currentUser.role === "editor" ? "Editor" : "Visualizador"}
              </span>
              <span style={{ padding:"3px 12px", borderRadius:12, fontSize:11, fontWeight:600, background:"var(--beige)", color:"var(--taupe)" }}>
                {companyName}
              </span>
            </div>
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
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>
              Nova Senha <span style={{ color:"var(--warm-gray)", fontWeight:400 }}>(deixe em branco para manter)</span>
            </label>
            <input type="password" placeholder="••••••••" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password:e.target.value })} />
          </div>
          <Btn icon="check" onClick={saveProfile} full>Salvar Alterações</Btn>
          {saveMsg && (
            <div style={{ padding:"10px 14px", borderRadius:8, background:saveMsg.startsWith("✓")?"#E8F5E9":"#FFEBEE", color:saveMsg.startsWith("✓")?"#2E7D32":"var(--danger)", fontSize:13 }}>
              {saveMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:600 }}>
      <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Configurações</h2>
      <div className="card anim-expand" style={{ padding:24 }}>
        <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Informações da Conta</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid var(--beige)", fontSize:14 }}>
            <span style={{ color:"var(--taupe)" }}>Empresa</span>
            <strong>{companyName}</strong>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid var(--beige)", fontSize:14 }}>
            <span style={{ color:"var(--taupe)" }}>Usuário</span>
            <strong>{currentUser.name}</strong>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid var(--beige)", fontSize:14 }}>
            <span style={{ color:"var(--taupe)" }}>Email</span>
            <strong>{currentUser.email}</strong>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid var(--beige)", fontSize:14 }}>
            <span style={{ color:"var(--taupe)" }}>Função</span>
            <strong>{currentUser.role === "admin" ? "Administrador" : currentUser.role === "editor" ? "Editor" : "Visualizador"}</strong>
          </div>
        </div>
      </div>
      <div className="card anim-expand" style={{ padding:24, animationDelay:"0.1s" }}>
        <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Banco de Dados</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>URL do Projeto</label>
            <input value={SUPABASE_URL} readOnly style={{ fontFamily:"monospace", fontSize:11, color:"var(--taupe)" }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--success)", animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:13, color:"var(--success)", fontWeight:500 }}>Conectado ao Supabase</span>
          </div>
        </div>
      </div>
      <div className="card anim-expand" style={{ padding:24, animationDelay:"0.2s" }}>
        <h3 style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Dados do Sistema</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { label:"Transações", value:transactions.length },
            { label:"Compras", value:purchases.length },
            { label:"Membros", value:profiles.length },
            { label:"Pendentes", value:pendingCount },
          ].map((d, i) => (
            <div key={i} style={{ background:"var(--cream)", borderRadius:10, padding:14, textAlign:"center" }}>
              <p style={{ fontSize:24, fontWeight:700, color:"var(--accent)" }}>{d.value}</p>
              <span style={{ fontSize:12, color:"var(--taupe)" }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
      <Btn variant="danger" icon="logout" onClick={handleLogout} full>Sair da Conta</Btn>
    </div>
  );

  const pages = { dashboard:renderDashboard, contas:renderContas, compras:renderCompras, relatorios:renderRelatorios, perfis:renderPerfis, perfil:renderPerfil, config:renderConfig };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ display:"flex", minHeight:"100vh", background:"var(--cream)" }}>
        {/* SIDEBAR DESKTOP */}
        <aside className="desktop-only" style={{ width:240, background:"var(--white)", borderRight:"1px solid var(--beige)", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, bottom:0, zIndex:100 }}>
          <div style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid var(--beige)" }}>
            <img src="/infinity_app/logo.svg" alt="Infinity" style={{ width:36, height:36 }} />
            <span style={{ fontSize:20, fontWeight:700, fontFamily:"'Playfair Display', serif", letterSpacing:0.5 }}>Infinity</span>
          </div>
          <nav style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
            {navItems.map(n => (
              <div key={n.id} onClick={() => setPage(n.id)} className="btn-press" style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10, cursor:"pointer", background:page===n.id?"var(--beige)":"transparent", color:page===n.id?"var(--dark)":"var(--taupe)", fontWeight:page===n.id?600:400, fontSize:14, transition:"all .2s" }}>
                <Icon name={n.icon} size={18} />{n.label}
              </div>
            ))}
          </nav>
          <div style={{ padding:"16px 14px", borderTop:"1px solid var(--beige)", display:"flex", alignItems:"center", gap:10 }}>
            <Avatar user={currentUser} size={36} />
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentUser.name?.split(" ")[0]}</p>
              <p style={{ fontSize:11, color:"var(--taupe)" }}>{currentUser.role === "admin" ? "Admin" : currentUser.role === "editor" ? "Editor" : "Visualizador"}</p>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR */}
        {sideOpen && (
          <div className="mobile-only" onClick={() => setSideOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(61,50,41,.4)", zIndex:200 }}>
            <aside onClick={e => e.stopPropagation()} className="anim-fade" style={{ width:260, background:"var(--white)", height:"100%", padding:"20px 10px", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"4px 10px 20px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid var(--beige)", marginBottom:12 }}>
                <img src="/infinity_app/logo.svg" alt="Infinity" style={{ width:30, height:30 }} />
                <span style={{ fontSize:18, fontWeight:700, fontFamily:"'Playfair Display', serif" }}>Infinity</span>
              </div>
              <div style={{ flex:1, overflowY:"auto" }}>
                {navItems.map(n => (
                  <div key={n.id} onClick={() => { setPage(n.id); setSideOpen(false); }} className="btn-press" style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10, cursor:"pointer", background:page===n.id?"var(--beige)":"transparent", color:page===n.id?"var(--dark)":"var(--taupe)", fontWeight:page===n.id?600:400, fontSize:14 }}>
                    <Icon name={n.icon} size={18} />{n.label}
                  </div>
                ))}
              </div>
              <div style={{ padding:"16px 14px", borderTop:"1px solid var(--beige)", display:"flex", alignItems:"center", gap:10 }}>
                <Avatar user={currentUser} size={36} />
                <div>
                  <p style={{ fontSize:13, fontWeight:600 }}>{currentUser.name?.split(" ")[0]}</p>
                  <p style={{ fontSize:11, color:"var(--taupe)" }}>{companyName}</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main style={{ flex:1, marginLeft:typeof window !== "undefined" && window.innerWidth > 768 ? 240 : 0, minHeight:"100vh" }}>
          <header style={{ position:"sticky", top:0, background:"rgba(250,247,242,.9)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--beige)", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:50 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div className="mobile-only btn-press" onClick={() => setSideOpen(true)} style={{ cursor:"pointer" }}><Icon name="menu" size={22} /></div>
              <h1 style={{ fontSize:18, fontWeight:600, fontFamily:"'Playfair Display', serif" }}>
                {navItems.find(n => n.id === page)?.label || "Dashboard"}
              </h1>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div className="btn-press" style={{ position:"relative", width:36, height:36, borderRadius:10, background:"var(--white)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"1px solid var(--beige)" }} onClick={() => setPage("contas")}>
                <Icon name="bell" size={17} />
                {pendingCount > 0 && <div style={{ position:"absolute", top:-3, right:-3, width:17, height:17, borderRadius:"50%", background:"var(--danger)", color:"white", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{pendingCount}</div>}
              </div>
              <div className="btn-press desktop-only" onClick={() => setPage("perfil")} style={{ cursor:"pointer" }}>
                <Avatar user={currentUser} size={36} />
              </div>
            </div>
          </header>
          <div key={page} className="anim-fade" style={{ padding:24, maxWidth:1280 }}>
            {pages[page]?.()}
          </div>
        </main>
      </div>

      {/* ══ MODAL: Nova Transação ══ */}
      <Modal open={modalOpen === "addTx"} onClose={() => setModalOpen(null)} title="Nova Transação" width={560}>
        {(() => {
          const cats = CATEGORIES[newTx.type] || CATEGORIES.saida;
          const selCat = cats.find(c => c.cat === newTx.category);
          return (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Tipo</label>
              <select value={newTx.type} onChange={e => setNewTx({ ...newTx, type:e.target.value, category:"", description:"" })}>
                <option value="saida">Saída (despesa)</option>
                <option value="entrada">Entrada (receita)</option>
              </select>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Categoria *</label>
                <select value={newTx.category} onChange={e => setNewTx({ ...newTx, category:e.target.value, description:"" })}>
                  <option value="">Selecione...</option>
                  {cats.map(c => <option key={c.cat} value={c.cat}>{c.cat}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Descrição *</label>
                {selCat && selCat.descs.length > 0 ? (
                  <>
                    <select value={selCat.descs.includes(newTx.description) ? newTx.description : "__custom"} onChange={e => { if (e.target.value !== "__custom") setNewTx({ ...newTx, description:e.target.value }); else setNewTx({ ...newTx, description:"" }); }}>
                      <option value="">Selecione...</option>
                      {selCat.descs.map(d => <option key={d} value={d}>{d}</option>)}
                      <option value="__custom">✏️ Digitar outro...</option>
                    </select>
                    {(!selCat.descs.includes(newTx.description) && newTx.description !== "") && (
                      <input style={{ marginTop:8 }} placeholder="Descrição personalizada" value={newTx.description} onChange={e => setNewTx({ ...newTx, description:e.target.value })} />
                    )}
                    {newTx.description === "" && !selCat.descs.includes(newTx.description) && (
                      <input style={{ marginTop:8 }} placeholder="Descrição personalizada" value={newTx.description} onChange={e => setNewTx({ ...newTx, description:e.target.value })} />
                    )}
                  </>
                ) : (
                  <input placeholder="Descreva a transação" value={newTx.description} onChange={e => setNewTx({ ...newTx, description:e.target.value })} />
                )}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Valor Previsto (R$) *</label>
                <input type="number" placeholder="0,00" min="0" step="0.01" value={newTx.value} onChange={e => setNewTx({ ...newTx, value:e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Data *</label>
                <input type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date:e.target.value })} />
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Status</label>
              <select value={newTx.status} onChange={e => setNewTx({ ...newTx, status:e.target.value })}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="recebido">Recebido</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
            {/* Recurrence */}
            <div style={{ background:"var(--cream)", borderRadius:10, padding:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => setNewTx({ ...newTx, recurring:!newTx.recurring })}>
                <div style={{ width:20, height:20, borderRadius:6, border:"2px solid var(--accent)", background:newTx.recurring?"var(--accent)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, transition:"all .15s" }}>{newTx.recurring ? "✓" : ""}</div>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--dark)" }}>Conta recorrente</span>
              </div>
              {newTx.recurring && (
                <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:10 }}>
                  <label style={{ fontSize:12, color:"var(--taupe)", whiteSpace:"nowrap" }}>Repetir por</label>
                  <input type="number" min="2" max="60" value={newTx.recurMonths} onChange={e => setNewTx({ ...newTx, recurMonths:Math.max(2, parseInt(e.target.value)||2) })} style={{ width:70 }} />
                  <span style={{ fontSize:12, color:"var(--taupe)" }}>meses</span>
                  <span style={{ fontSize:11, color:"var(--warm-gray)", marginLeft:4 }}>(cria {newTx.recurMonths} lançamentos)</span>
                </div>
              )}
            </div>
            <Btn onClick={addTransaction} icon="check" full>
              {newTx.recurring ? `Criar ${newTx.recurMonths} Lançamentos` : "Salvar Transação"}
            </Btn>
          </div>
          );
        })()}
      </Modal>

      {/* ══ MODAL: Editar Transação ══ */}
      <Modal open={modalOpen === "editTx"} onClose={() => { setModalOpen(null); setEditingTx(null); }} title="Editar Transação">
        {editingTx && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Descrição *</label>
              <input value={editingTx.description} onChange={e => setEditingTx({ ...editingTx, description:e.target.value })} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Categoria</label>
                <input value={editingTx.category || ""} onChange={e => setEditingTx({ ...editingTx, category:e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Tipo</label>
                <select value={editingTx.type} onChange={e => setEditingTx({ ...editingTx, type:e.target.value })}>
                  <option value="saida">Saída</option>
                  <option value="entrada">Entrada</option>
                </select>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Valor (R$) *</label>
                <input type="number" min="0" step="0.01" value={editingTx.value} onChange={e => setEditingTx({ ...editingTx, value:e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Data *</label>
                <input type="date" value={editingTx.date} onChange={e => setEditingTx({ ...editingTx, date:e.target.value })} />
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Status</label>
              <select value={editingTx.status} onChange={e => setEditingTx({ ...editingTx, status:e.target.value })}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="recebido">Recebido</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
            <Btn onClick={saveEditTx} icon="check" full>Salvar Alterações</Btn>
          </div>
        )}
      </Modal>

      {/* ══ MODAL: Quitar Transação ══ */}
      <Modal open={modalOpen === "settleTx"} onClose={() => { setModalOpen(null); setSettlingTx(null); }} title="Quitar Conta" width={440}>
        {settlingTx && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"var(--cream)", borderRadius:12, padding:18 }}>
              <p style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>{settlingTx.description}</p>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"var(--taupe)" }}>
                <span>{settlingTx.category || "—"}</span>
                <span>{fmtDate(settlingTx.date)}</span>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div style={{ background:"#E3F2FD", borderRadius:10, padding:14, textAlign:"center" }}>
                <span style={{ fontSize:11, color:"#1565C0", fontWeight:600, textTransform:"uppercase" }}>Previsto</span>
                <p style={{ fontSize:20, fontWeight:700, color:"#1565C0", marginTop:4 }}>{fmt(settlingTx.value)}</p>
              </div>
              <div style={{ background:"#F3E5F5", borderRadius:10, padding:14, textAlign:"center" }}>
                <span style={{ fontSize:11, color:"#7B1FA2", fontWeight:600, textTransform:"uppercase" }}>Realizado</span>
                <input type="number" min="0" step="0.01" value={settlingTx.actual_value_input} onChange={e => setSettlingTx({ ...settlingTx, actual_value_input:e.target.value })} style={{ textAlign:"center", fontSize:18, fontWeight:700, color:"#7B1FA2", background:"transparent", border:"none", borderBottom:"2px solid #CE93D8", borderRadius:0, padding:"6px 0", marginTop:4 }} />
              </div>
            </div>
            {(() => {
              const prev = Number(settlingTx.value);
              const real = parseFloat(settlingTx.actual_value_input) || 0;
              const diff = real - prev;
              if (diff === 0) return <p style={{ textAlign:"center", fontSize:13, color:"var(--taupe)" }}>Valores iguais — sem diferença</p>;
              return <p style={{ textAlign:"center", fontSize:13, fontWeight:600, color:diff>0?"var(--danger)":"var(--success)" }}>
                {diff > 0 ? `Pagou ${fmt(diff)} a mais que o previsto` : `Economizou ${fmt(Math.abs(diff))} em relação ao previsto`}
              </p>;
            })()}
            <Btn onClick={settleTx} icon="check" variant="success" full>
              Confirmar Quitação
            </Btn>
          </div>
        )}
      </Modal>

      {/* ══ MODAL: Nova Compra ══ */}
      <Modal open={modalOpen === "addPurchase"} onClose={() => setModalOpen(null)} title="Nova Compra">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Item *</label>
            <input placeholder="Nome do produto ou serviço" value={newPurchase.item} onChange={e => setNewPurchase({ ...newPurchase, item:e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Fornecedor</label>
            <input placeholder="Nome da empresa fornecedora" value={newPurchase.supplier} onChange={e => setNewPurchase({ ...newPurchase, supplier:e.target.value })} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Quantidade</label>
              <input type="number" min="1" value={newPurchase.qty} onChange={e => setNewPurchase({ ...newPurchase, qty:parseInt(e.target.value)||1 })} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Preço Unitário (R$) *</label>
              <input type="number" placeholder="0,00" min="0" step="0.01" value={newPurchase.unit_price} onChange={e => setNewPurchase({ ...newPurchase, unit_price:e.target.value })} />
            </div>
          </div>
          {newPurchase.qty && newPurchase.unit_price && (
            <div style={{ padding:"10px 14px", borderRadius:8, background:"var(--beige)", fontSize:13 }}>
              <strong>Total: {fmt(newPurchase.qty * parseFloat(newPurchase.unit_price || 0))}</strong>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Data *</label>
              <input type="date" value={newPurchase.date} onChange={e => setNewPurchase({ ...newPurchase, date:e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Status</label>
              <select value={newPurchase.status} onChange={e => setNewPurchase({ ...newPurchase, status:e.target.value })}>
                <option value="em_transito">Em Trânsito</option>
                <option value="entregue">Entregue</option>
                <option value="ativo">Ativo</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <Btn onClick={addPurchase} icon="check" full>Salvar Compra</Btn>
        </div>
      </Modal>

      {/* ══ MODAL: Editar Compra ══ */}
      <Modal open={modalOpen === "editPurchase"} onClose={() => { setModalOpen(null); setEditingPurchase(null); }} title="Editar Compra">
        {editingPurchase && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Item *</label>
              <input value={editingPurchase.item} onChange={e => setEditingPurchase({ ...editingPurchase, item:e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Fornecedor</label>
              <input value={editingPurchase.supplier || ""} onChange={e => setEditingPurchase({ ...editingPurchase, supplier:e.target.value })} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Quantidade</label>
                <input type="number" min="1" value={editingPurchase.qty} onChange={e => setEditingPurchase({ ...editingPurchase, qty:parseInt(e.target.value)||1 })} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Preço Unitário (R$) *</label>
                <input type="number" min="0" step="0.01" value={editingPurchase.unit_price} onChange={e => setEditingPurchase({ ...editingPurchase, unit_price:e.target.value })} />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Data *</label>
                <input type="date" value={editingPurchase.date} onChange={e => setEditingPurchase({ ...editingPurchase, date:e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Status</label>
                <select value={editingPurchase.status} onChange={e => setEditingPurchase({ ...editingPurchase, status:e.target.value })}>
                  <option value="em_transito">Em Trânsito</option>
                  <option value="entregue">Entregue</option>
                  <option value="ativo">Ativo</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            <Btn onClick={saveEditPurchase} icon="check" full>Salvar Alterações</Btn>
          </div>
        )}
      </Modal>

      {/* ══ MODAL: Convidar Membro ══ */}
      <Modal open={modalOpen === "inviteMember"} onClose={() => { setModalOpen(null); setInviteMsg(""); }} title="Convidar Membro">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Nome Completo *</label>
            <input placeholder="Nome do colaborador" value={newMember.name} onChange={e => setNewMember({ ...newMember, name:e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Email *</label>
            <input type="email" placeholder="colaborador@empresa.com" value={newMember.email} onChange={e => setNewMember({ ...newMember, email:e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--taupe)", marginBottom:6, display:"block" }}>Permissão</label>
            <select value={newMember.role} onChange={e => setNewMember({ ...newMember, role:e.target.value })}>
              <option value="viewer">Visualizador — apenas visualizar</option>
              <option value="editor">Editor — criar e editar</option>
              <option value="admin">Administrador — acesso total</option>
            </select>
          </div>
          <Btn onClick={inviteMember} icon="mail" full disabled={inviteLoading}>
            {inviteLoading ? "Criando conta..." : "Adicionar à Equipe"}
          </Btn>
          {inviteMsg && (
            <div style={{ padding:"10px 14px", borderRadius:8, background:inviteMsg.startsWith("✓")?"#E8F5E9":"#FFEBEE", color:inviteMsg.startsWith("✓")?"#2E7D32":"var(--danger)", fontSize:13, lineHeight:1.5 }}>
              {inviteMsg}
            </div>
          )}
          <p style={{ fontSize:12, color:"var(--warm-gray)", lineHeight:1.5 }}>
            Uma conta será criada para o membro. Compartilhe a senha temporária com ele para que possa fazer login e atualizar seus dados.
          </p>
        </div>
      </Modal>
    </>
  );
}
