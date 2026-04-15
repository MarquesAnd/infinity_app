// ─── ClinicaPage.jsx — Gestão Operacional da Clínica ───────────────────────
// v3: Modelo de pacotes + pagamento por sessão + simulador
// Dependência: xlsx (SheetJS) — npm install xlsx

import React, { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

const brl = (v) => { const n = Number(v || 0); if (!isFinite(n)) return "R$ 0,00"; return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
const pct = (v) => { const n = Number(v || 0); if (!isFinite(n)) return "0,0%"; return n.toLocaleString("pt-BR", { style: "percent", minimumFractionDigits: 1 }); };
const num = (v) => Math.round(Number(v || 0)).toLocaleString("pt-BR");

const C = {
  cream: "var(--cream)", beige: "var(--beige)", sand: "var(--sand)",
  taupe: "var(--taupe)", dark: "var(--dark)", accent: "var(--accent)",
  success: "var(--success)", danger: "var(--danger)", warning: "var(--warning)",
  white: "var(--white)",
};

const DEFAULT_CONVENIOS = [
  { id: 1, nome: "Ndi Minas",  sigla: "NDI",  tipoPrecif: "pacote", valorPacote: 1100, valorSessao: 0,   sessoesPacote: 6, ativo: true },
  { id: 2, nome: "Unimed",     sigla: "UNIM", tipoPrecif: "pacote", valorPacote: 930,  valorSessao: 0,   sessoesPacote: 6, ativo: true },
  { id: 3, nome: "Particular", sigla: "PART", tipoPrecif: "sessao", valorPacote: 0,    valorSessao: 350, sessoesPacote: 6, ativo: true },
  { id: 4, nome: "Geap",       sigla: "GEAP", tipoPrecif: "pacote", valorPacote: 1200, valorSessao: 0,   sessoesPacote: 6, ativo: true },
  { id: 5, nome: "Hapvida",    sigla: "HAPV", tipoPrecif: "pacote", valorPacote: 650,  valorSessao: 0,   sessoesPacote: 6, ativo: true },
  { id: 6, nome: "Usisaude",   sigla: "USIS", tipoPrecif: "pacote", valorPacote: 1100, valorSessao: 0,   sessoesPacote: 6, ativo: true },
];

const DEFAULT_PROFISSIONAIS = [
  { id: 1, nome: "Wessilon Marques",   cargo: "Neuropsicólogo",    contrato: "Sócio",  tipo: "prolabore", salarioBase: 0,    valorSessao: 0,  meta: 4, real: 3, tags: ["WESSILON"] },
  { id: 2, nome: "Emily Ferreira",     cargo: "Aplicadora Neuro",  contrato: "PJ",     tipo: "sessao",    salarioBase: 0,    valorSessao: 25, meta: 4, real: 3, tags: ["EMILY"] },
  { id: 3, nome: "Karolina Oliveira",  cargo: "Aplicadora Neuro",  contrato: "PJ",     tipo: "sessao",    salarioBase: 0,    valorSessao: 25, meta: 4, real: 2, tags: ["KAROLINA"] },
  { id: 4, nome: "Mariana Pereira",    cargo: "Aplicadora Neuro",  contrato: "PJ",     tipo: "sessao",    salarioBase: 1200, valorSessao: 0,  meta: 4, real: 2, tags: ["MARIANA"] },
  { id: 5, nome: "Pâmela Dutra",       cargo: "Aplicadora Neuro",  contrato: "PJ",     tipo: "sessao",    salarioBase: 0,    valorSessao: 25, meta: 4, real: 3, tags: ["PAMELA","PÂMELA"] },
  { id: 6, nome: "Taís Souza",         cargo: "Aplicadora Neuro",  contrato: "PJ",     tipo: "sessao",    salarioBase: 0,    valorSessao: 25, meta: 4, real: 2, tags: ["TAIS","TAÍS"] },
];

const DEFAULT_PARAMS = { diasUteis: 22, custoFixo: 8000, imposto: 0.06, glosa: 0.05, prolabore: 5000 };

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding: "10px 18px", border: "none", borderBottom: `3px solid ${active ? C.accent : "transparent"}`, background: "transparent", color: active ? C.dark : C.taupe, fontFamily: "inherit", fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>{label}</button>
);
const Card = ({ children, style: s }) => (<div className="card anim-expand" style={{ padding: 20, ...s }}>{children}</div>);
const HBar = ({ value, max, color = C.accent }) => (<div style={{ flex: 1, height: 8, borderRadius: 4, background: C.beige, overflow: "hidden" }}><div style={{ width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%`, height: "100%", borderRadius: 4, background: color, transition: "width .6s ease" }} /></div>);

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTH_MAP = { jan:1,fev:2,feb:2,mar:3,abr:4,apr:4,mai:5,may:5,jun:6,jul:7,ago:8,aug:8,set:9,sep:9,out:10,oct:10,nov:11,dez:12,dec:12 };

function getConvValorAplicacao(conv) {
  if (conv.tipoPrecif === "sessao") return conv.valorSessao || 0;
  const sp = conv.sessoesPacote || 6;
  return sp > 0 ? (conv.valorPacote || 0) / sp : 0;
}

function previewWorkbook(wb, conveniosConfig, profissionaisConfig) {
  return wb.SheetNames.map(name => {
    const data = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "" });
    let convNames = [], profNames = [], monthCols = [];
    for (const row of data.slice(0, 5)) { for (const cell of row) { const s = String(cell || "").trim(); if (!s) continue; const sl = s.toLowerCase(); if (conveniosConfig.some(c => c.nome.toLowerCase().includes(sl) || sl.includes(c.nome.toLowerCase())) && !convNames.includes(s)) convNames.push(s); const mk = sl.slice(0,3); if (MONTH_MAP[mk] && !monthCols.includes(mk)) monthCols.push(mk); } }
    for (const row of data.slice(2)) { const n = String(row[0] || "").trim(); if (n && profissionaisConfig.some(p => (p.tags || []).some(t => n.toUpperCase().includes(t.toUpperCase())) || p.nome.toUpperCase().split(" ").some(part => part.length > 3 && n.toUpperCase().includes(part))) && !profNames.includes(n)) profNames.push(n); }
    return { name, rows: data.length, convNames, profNames, monthCols, data, importable: convNames.length > 0 && profNames.length > 0 };
  });
}

function parseSheetToGrid(sheetData, conveniosConfig, profissionaisConfig) {
  const result = {};
  if (!sheetData || sheetData.length < 3) return result;
  let hdrIdx = -1;
  for (let r = 0; r < Math.min(5, sheetData.length); r++) { if (sheetData[r].some(cell => { const s = String(cell||"").trim().toLowerCase(); return conveniosConfig.some(c => c.nome.toLowerCase().includes(s) || s.includes(c.nome.toLowerCase())); })) { hdrIdx = r; break; } }
  if (hdrIdx < 0) return result;
  const hdr = sheetData[hdrIdx], subHdr = sheetData[hdrIdx + 1] || [];
  const colMap = []; let curConv = -1;
  for (let c = 0; c < hdr.length; c++) { const h = String(hdr[c] || "").trim(); if (h) { const mi = conveniosConfig.findIndex(cv => cv.nome.toLowerCase().includes(h.toLowerCase()) || h.toLowerCase().includes(cv.nome.toLowerCase())); if (mi >= 0) curConv = mi; } if (curConv < 0) continue; const sub = String(subHdr[c] || "").trim().toLowerCase().slice(0, 3); const month = MONTH_MAP[sub]; if (month) colMap.push({ col: c, convIdx: curConv, month }); }
  if (colMap.length === 0) return result;
  for (let r = hdrIdx + 2; r < sheetData.length; r++) { const row = sheetData[r]; const name = String(row[0] || "").trim(); if (!name || name.toUpperCase().startsWith("TOTAL")) continue; const pi = profissionaisConfig.findIndex(p => (p.tags || []).some(t => name.toUpperCase().includes(t.toUpperCase())) || p.nome.toUpperCase().split(" ").some(part => part.length > 3 && name.toUpperCase().includes(part))); if (pi < 0) continue; if (!result[pi]) result[pi] = {}; for (const { col, convIdx, month } of colMap) { const v = parseInt(row[col]) || 0; if (v > 0) { if (!result[pi][convIdx]) result[pi][convIdx] = {}; result[pi][convIdx][String(month)] = (result[pi][convIdx][String(month)] || 0) + v; } } }
  return result;
}

function calcStats(grid, conveniosConfig, profissionaisConfig, selectedMonths) {
  const byConv = {}, byProf = {};
  let totalSessoes = 0, totalReceita = 0, totalCusto = 0;
  for (const [pi, convs] of Object.entries(grid)) {
    const prof = profissionaisConfig[parseInt(pi)]; if (!prof) continue;
    const pKey = prof.nome;
    if (!byProf[pKey]) byProf[pKey] = { nome: prof.nome, tipo: prof.tipo, salarioBase: prof.salarioBase || 0, valorSessao: prof.valorSessao || 0, byConv: {}, total: 0, receita: 0, custo: 0 };
    for (const [ci, months] of Object.entries(convs)) {
      const conv = conveniosConfig[parseInt(ci)]; if (!conv) continue;
      const cKey = conv.nome;
      if (!byConv[cKey]) byConv[cKey] = { nome: conv.nome, tipoPrecif: conv.tipoPrecif, valorPacote: conv.valorPacote, valorSessao: conv.valorSessao, sessoesPacote: conv.sessoesPacote, valorAplic: getConvValorAplicacao(conv), total: 0, receita: 0, custo: 0 };
      for (const m of selectedMonths) {
        const ap = months[m] || 0; if (ap === 0) continue;
        const sp = conv.sessoesPacote || 6;
        const pacs = conv.tipoPrecif === "pacote" ? ap / sp : 0;
        const receita = conv.tipoPrecif === "pacote" ? pacs * (conv.valorPacote || 0) : ap * (conv.valorSessao || 0);
        const custoProf = prof.tipo === "sessao" ? ap * (prof.valorSessao || 0) : 0;
        byConv[cKey].total += ap; byConv[cKey].receita += receita; byConv[cKey].custo += custoProf;
        if (!byProf[pKey].byConv[cKey]) byProf[pKey].byConv[cKey] = { aplic: 0, receita: 0 };
        byProf[pKey].byConv[cKey].aplic += ap; byProf[pKey].byConv[cKey].receita += receita;
        byProf[pKey].total += ap; byProf[pKey].receita += receita; byProf[pKey].custo += custoProf;
        totalSessoes += ap; totalReceita += receita; totalCusto += custoProf;
      }
    }
    if (byProf[pKey].total > 0 && prof.tipo === "sessao") { byProf[pKey].custo += prof.salarioBase || 0; totalCusto += prof.salarioBase || 0; }
  }
  return { byConv, byProf, totalSessoes, totalReceita, totalCusto };
}

export default function ClinicaPage({ companyId }) {
  const [tab, setTab] = useState("dashboard");
  const lsKey = `clinica_cfg_v3_${companyId || "default"}`;
  const loadCfg = () => { try { const r = localStorage.getItem(lsKey); if (r) return JSON.parse(r); } catch (_) {} return null; };

  const [convenios, setConvenios] = useState(() => loadCfg()?.convenios || DEFAULT_CONVENIOS);
  const [profissionais, setProfissionais] = useState(() => loadCfg()?.profissionais || DEFAULT_PROFISSIONAIS);
  const [params, setParams] = useState(() => loadCfg()?.params || DEFAULT_PARAMS);
  const [saved, setSaved] = useState(false);
  const [sessionsGrid, setSessionsGrid] = useState(() => loadCfg()?.sessionsGrid || {});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reportName, setReportName] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [excelPreview, setExcelPreview] = useState(null);
  const [simState, setSimState] = useState(() => profissionais.map(p => ({ fixo: p.salarioBase || 0, ps: p.valorSessao || 0 })));
  const fileRef = useRef();

  const saveCfg = useCallback(() => {
    localStorage.setItem(lsKey, JSON.stringify({ convenios, profissionais, params, sessionsGrid }));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }, [convenios, profissionais, params, sessionsGrid, lsKey]);

  const selMonths = [String(selectedMonth)];
  const stats = calcStats(sessionsGrid, convenios, profissionais, selMonths);
  const { byConv, byProf, totalSessoes, totalReceita, totalCusto } = stats;
  const totalLucro = totalReceita - totalCusto;
  const convList = Object.values(byConv).sort((a, b) => b.receita - a.receita);
  const profList = Object.values(byProf).sort((a, b) => b.receita - a.receita);
  const hasSessions = totalSessoes > 0;
  const mesLabel = MESES[selectedMonth - 1];

  const updateCell = (pi, ci, month, val) => { setSessionsGrid(prev => { const g = JSON.parse(JSON.stringify(prev)); if (!g[pi]) g[pi] = {}; if (!g[pi][ci]) g[pi][ci] = {}; g[pi][ci][String(month)] = Math.max(0, parseInt(val) || 0); return g; }); };
  const getCell = (pi, ci, month) => sessionsGrid[pi]?.[ci]?.[String(month)] || 0;

  const handleFile = async (file) => {
    if (!file) return; if (!file.name.match(/\.xlsx?$/i)) { setReportError("Envie .xlsx"); return; }
    setReportLoading(true); setReportError("");
    try { const buf = await file.arrayBuffer(); const wb = XLSX.read(buf, { type: "array", cellDates: true }); setExcelPreview(previewWorkbook(wb, convenios, profissionais)); setReportName(file.name); setTab("relatorio"); }
    catch (e) { setReportError("Erro: " + e.message); } finally { setReportLoading(false); }
  };
  const importSheet = (sp) => {
    const parsed = parseSheetToGrid(sp.data, convenios, profissionais);
    setSessionsGrid(prev => { const g = JSON.parse(JSON.stringify(prev)); for (const [pi, convs] of Object.entries(parsed)) { if (!g[pi]) g[pi] = {}; for (const [ci, months] of Object.entries(convs)) { if (!g[pi][ci]) g[pi][ci] = {}; for (const [m, v] of Object.entries(months)) g[pi][ci][m] = (g[pi][ci][m] || 0) + v; } } return g; });
    setExcelPreview(null); setTimeout(saveCfg, 100);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  const renderDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {!hasSessions && (<div onClick={() => setTab("relatorio")} style={{ padding: "14px 18px", borderRadius: 10, background: "#e3f2fd", border: "1px solid #90caf9", fontSize: 13, color: "#1565c0", cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}><span>📥</span><span><strong>Sem dados.</strong> Vá em Relatório para importar ou preencher aplicações.</span></div>)}
      {hasSessions && (<>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {[{ l: "Receita (pacotes)", v: brl(totalReceita), c: C.success },{ l: "Custo equipe", v: brl(totalCusto), c: C.danger },{ l: "Lucro", v: brl(totalLucro), c: totalLucro >= 0 ? C.success : C.danger },{ l: "Margem", v: pct(totalReceita > 0 ? totalLucro / totalReceita : 0), c: C.accent },{ l: "Aplicações", v: num(totalSessoes), c: C.dark },{ l: "ROI", v: totalCusto > 0 ? `${Math.round((totalReceita - totalCusto) / totalCusto * 100)}%` : "—", c: C.success }].map((k, i) => (
            <div key={i} className="card" style={{ padding: 16, animationDelay: `${i * 0.05}s` }}><div style={{ fontSize: 10, color: C.taupe, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{k.l}</div><div style={{ fontSize: 22, fontWeight: 700, color: k.c, marginTop: 6 }}>{k.v}</div></div>
          ))}
        </div>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>💰 Receita vs Custo — {mesLabel}</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: C.beige }}>
                {["Profissional","Aplic","Receita","Fixo","R$/Ap","Custo Var","Custo Total","Lucro","ROI","Margem/Ap"].map((h, i) => (<th key={i} style={{ padding: "8px 8px", textAlign: i === 0 ? "left" : "right", fontSize: 10, fontWeight: 700, color: C.taupe, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>))}
              </tr></thead>
              <tbody>
                {profList.filter(p => p.total > 0).map((p, i) => { const cVar = p.total * p.valorSessao; const cTot = p.custo; const luc = p.receita - cTot; const roi = cTot > 0 ? Math.round((p.receita - cTot) / cTot * 100) : 0; const mAp = p.total > 0 ? (p.receita - cTot) / p.total : 0; return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.beige}` }}>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{p.nome}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700 }}>{p.total}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", color: C.success, fontWeight: 700 }}>{brl(p.receita)}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontSize: 12 }}>{brl(p.salarioBase)}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontSize: 12 }}>{brl(p.valorSessao)}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontSize: 12 }}>{brl(cVar)}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", color: C.danger, fontWeight: 700 }}>{brl(cTot)}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: luc >= 0 ? C.success : C.danger }}>{brl(luc)}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right" }}><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: roi >= 500 ? "#e8f5e9" : "#fff8e1", color: roi >= 500 ? "#2e7d32" : "#f57f17" }}>{roi}%</span></td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{brl(mAp)}</td>
                  </tr>); })}
                <tr style={{ background: C.beige, fontWeight: 700 }}><td style={{ padding: "10px 8px" }}>TOTAL</td><td style={{ padding: "10px 8px", textAlign: "right" }}>{totalSessoes}</td><td style={{ padding: "10px 8px", textAlign: "right", color: C.success }}>{brl(totalReceita)}</td><td colSpan={3}></td><td style={{ padding: "10px 8px", textAlign: "right", color: C.danger }}>{brl(totalCusto)}</td><td style={{ padding: "10px 8px", textAlign: "right", color: C.success }}>{brl(totalLucro)}</td><td colSpan={2}></td></tr>
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🏥 Convênios — {mesLabel}</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: C.beige }}>{["Convênio","Tipo","Pacote","R$/Aplic (÷6)","Aplicações","Receita","% Total"].map((h, i) => (<th key={i} style={{ padding: "8px 10px", textAlign: i === 0 ? "left" : "right", fontSize: 10, fontWeight: 700, color: C.taupe, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
              <tbody>{convList.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.beige}` }}>
                  <td style={{ padding: "10px 10px", fontWeight: 600 }}>{c.nome}</td>
                  <td style={{ padding: "10px 10px", textAlign: "right" }}><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: c.tipoPrecif === "pacote" ? "#e3f2fd" : "#fce4ec", color: c.tipoPrecif === "pacote" ? "#1565c0" : "#c62828" }}>{c.tipoPrecif === "pacote" ? "Pacote" : "Sessão"}</span></td>
                  <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600 }}>{c.tipoPrecif === "pacote" ? brl(c.valorPacote) : `${brl(c.valorSessao)}/s`}</td>
                  <td style={{ padding: "10px 10px", textAlign: "right" }}>{brl(c.valorAplic)}</td>
                  <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700 }}>{c.total}</td>
                  <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: C.success }}>{brl(c.receita)}</td>
                  <td style={{ padding: "10px 10px", textAlign: "right" }}>{pct(totalReceita > 0 ? c.receita / totalReceita : 0)}</td>
                </tr>))}</tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📊 R$/Aplicação Real — Prof × Convênio</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: C.beige }}><th style={{ padding: "8px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.taupe }}>PROF.</th>
                {convList.filter(c => c.total > 0).map(c => (<th key={c.nome} style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.taupe }}>{c.nome}<br/><span style={{ fontSize: 9, fontWeight: 400 }}>teór {brl(c.valorAplic)}</span></th>))}
              </tr></thead>
              <tbody>{profList.filter(p => p.total > 0).map((p, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.beige}` }}>
                  <td style={{ padding: "8px 8px", fontWeight: 600 }}>{p.nome}</td>
                  {convList.filter(c => c.total > 0).map(c => { const pc = p.byConv[c.nome]; if (!pc || pc.aplic === 0) return <td key={c.nome} style={{ padding: "6px", textAlign: "center", color: C.taupe, fontSize: 11 }}>—</td>; const rpa = pc.receita / pc.aplic; const diff = rpa - c.valorAplic; return (
                    <td key={c.nome} style={{ padding: "6px", textAlign: "center" }}><div style={{ fontWeight: 700, fontSize: 13 }}>{brl(rpa)}</div><div style={{ fontSize: 10, color: diff >= 0 ? "#2e7d32" : "#c62828" }}>{diff >= 0 ? "+" : ""}{brl(diff)}</div><div style={{ fontSize: 10, color: C.taupe }}>{pc.aplic} ap</div></td>); })}
                </tr>))}</tbody>
            </table>
          </div>
        </Card>
      </>)}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  RELATÓRIO (Grade + Import)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderRelatorio = () => {
    const activeConvs = convenios.filter(c => c.ativo);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1.5px solid ${C.sand}`, flexShrink: 0 }}>
            {MESES.map((m, i) => (<button key={i} onClick={() => setSelectedMonth(i + 1)} style={{ padding: "8px 10px", border: "none", fontSize: 11, fontWeight: selectedMonth === i + 1 ? 700 : 400, background: selectedMonth === i + 1 ? C.accent : "transparent", color: selectedMonth === i + 1 ? "white" : C.taupe, cursor: "pointer", fontFamily: "inherit" }}>{m}</button>))}
          </div>
          <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }} onClick={() => fileRef.current?.click()}
            style={{ flex: 1, minWidth: 150, border: `2px dashed ${dragOver ? C.accent : C.sand}`, borderRadius: 10, padding: "10px 16px", textAlign: "center", cursor: "pointer", background: dragOver ? "#fdf8f2" : C.cream, fontSize: 12 }}>
            {reportLoading ? "Processando..." : reportName ? `📄 ${reportName}` : "📥 Importar .xlsx"}
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>
        {excelPreview && (<Card>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><h3 style={{ fontSize: 14, fontWeight: 700 }}>📂 Abas encontradas</h3><button onClick={() => setExcelPreview(null)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.sand}`, background: "transparent", color: C.taupe, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Fechar</button></div>
          {excelPreview.map((sh, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, background: sh.importable ? C.cream : "#f5f5f5", border: `1px solid ${sh.importable ? C.sand : "#e0e0e0"}`, marginBottom: 8 }}><div><div style={{ fontSize: 13, fontWeight: 600 }}>{sh.name}</div><div style={{ fontSize: 11, color: C.taupe }}>{sh.rows} linhas · {sh.profNames.length} profs</div></div>{sh.importable ? <button onClick={() => importSheet(sh)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.accent, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Importar</button> : <span style={{ fontSize: 11, color: C.taupe }}>Sem dados</span>}</div>))}
        </Card>)}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📝 Aplicações — {mesLabel}</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: C.beige }}>
                <th style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.taupe, minWidth: 130 }}>PROFISSIONAL</th>
                {activeConvs.map(c => (<th key={c.id} style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.taupe, borderLeft: `1px solid ${C.sand}`, minWidth: 55 }}>{c.sigla}<br/><span style={{ fontWeight: 400, fontSize: 9 }}>{c.tipoPrecif === "pacote" ? `pk${brl(c.valorPacote)}` : `${brl(c.valorSessao)}/s`}</span></th>))}
                <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.accent, borderLeft: `2px solid ${C.sand}` }}>APLIC</th>
                <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.success }}>RECEITA</th>
                <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.danger }}>CUSTO</th>
                <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.accent }}>LUCRO</th>
              </tr></thead>
              <tbody>
                {profissionais.map((p, pi) => {
                  let rT = 0, rR = 0;
                  const cells = activeConvs.map(c => { const ci = convenios.indexOf(c); const val = getCell(pi, ci, selectedMonth); rT += val; const sp = c.sessoesPacote || 6; const pacs = c.tipoPrecif === "pacote" ? val / sp : 0; rR += c.tipoPrecif === "pacote" ? pacs * (c.valorPacote || 0) : val * (c.valorSessao || 0); return { ci, val, c }; });
                  const rC = (p.salarioBase || 0) + rT * (p.valorSessao || 0);
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.beige}` }}>
                      <td style={{ padding: "6px 10px" }}><div style={{ fontWeight: 600, fontSize: 12 }}>{p.nome}</div><div style={{ fontSize: 10, color: C.taupe }}>{p.tipo === "sessao" ? `${p.salarioBase ? brl(p.salarioBase)+"+" : ""}${brl(p.valorSessao)}/ap` : "Sócio"}</div></td>
                      {cells.map(({ ci, val, c }) => (<td key={c.id} style={{ padding: "4px 2px", textAlign: "center", borderLeft: `1px solid ${C.sand}` }}><input type="number" min="0" value={val || ""} placeholder="0" style={{ width: 42, border: "none", background: val > 0 ? "#e8f5e9" : "transparent", borderRadius: 4, textAlign: "center", fontSize: 13, fontWeight: 700, color: C.dark, outline: "none", padding: "4px 2px", fontFamily: "inherit" }} onChange={e => updateCell(pi, ci, selectedMonth, e.target.value)} onBlur={saveCfg} /></td>))}
                      <td style={{ padding: "6px 4px", textAlign: "center", fontWeight: 700, fontSize: 14, borderLeft: `2px solid ${C.sand}` }}>{rT}</td>
                      <td style={{ padding: "6px 4px", textAlign: "center", fontWeight: 700, color: C.success, fontSize: 11 }}>{brl(rR)}</td>
                      <td style={{ padding: "6px 4px", textAlign: "center", fontWeight: 700, color: C.danger, fontSize: 11 }}>{brl(rC)}</td>
                      <td style={{ padding: "6px 4px", textAlign: "center", fontWeight: 700, color: rR - rC >= 0 ? C.success : C.danger, fontSize: 11 }}>{brl(rR - rC)}</td>
                    </tr>);
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  SIMULADOR
  // ═══════════════════════════════════════════════════════════════════════════
  const renderSimulador = () => {
    const aplicadoras = profissionais.map((p, i) => {
      let tAp = 0, tRec = 0;
      convenios.forEach((c, ci) => { const ap = getCell(i, ci, selectedMonth); const sp = c.sessoesPacote || 6; const pacs = c.tipoPrecif === "pacote" ? ap / sp : 0; tRec += c.tipoPrecif === "pacote" ? pacs * (c.valorPacote || 0) : ap * (c.valorSessao || 0); tAp += ap; });
      return { ...p, idx: i, tAp, tRec };
    }).filter(a => a.tAp > 0 && a.tipo !== "prolabore");

    const simRes = aplicadoras.map(a => { const s = simState[a.idx] || { fixo: 0, ps: 25 }; const cN = s.fixo + a.tAp * s.ps; const cA = (a.salarioBase || 0) + a.tAp * (a.valorSessao || 0); return { ...a, fS: s.fixo, pS: s.ps, cN, cA, lN: a.tRec - cN, diff: cN - cA }; });
    const tRec = simRes.reduce((a, r) => a + r.tRec, 0); const tCN = simRes.reduce((a, r) => a + r.cN, 0); const tCA = simRes.reduce((a, r) => a + r.cA, 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ padding: "10px 14px", background: C.cream, borderRadius: 10, fontSize: 12, color: C.taupe, border: `1px solid ${C.sand}` }}>Ajuste fixo e R$/aplicação. Dados de <strong>{mesLabel}</strong>.</div>
        {!hasSessions && <div style={{ padding: 20, textAlign: "center", color: C.taupe }}>Preencha aplicações na aba Relatório primeiro.</div>}
        {aplicadoras.map(a => { const s = simState[a.idx] || { fixo: 0, ps: 25 }; return (
          <Card key={a.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div><span style={{ fontWeight: 700 }}>{a.nome}</span> <span style={{ fontSize: 12, color: C.taupe }}>{a.tAp} ap · {brl(a.tRec)}</span></div><span style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>Custo: {brl(s.fixo + a.tAp * s.ps)}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 12, color: C.taupe, minWidth: 80 }}>Fixo mensal</span><input type="range" min="0" max="4000" step="100" value={s.fixo} style={{ flex: 1 }} onChange={e => { const u = [...simState]; u[a.idx] = { ...u[a.idx], fixo: +e.target.value }; setSimState(u); }} /><span style={{ fontSize: 13, fontWeight: 700, minWidth: 70, textAlign: "right" }}>{brl(s.fixo)}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 12, color: C.taupe, minWidth: 80 }}>R$/aplicação</span><input type="range" min="0" max="60" step="1" value={s.ps} style={{ flex: 1 }} onChange={e => { const u = [...simState]; u[a.idx] = { ...u[a.idx], ps: +e.target.value }; setSimState(u); }} /><span style={{ fontSize: 13, fontWeight: 700, minWidth: 50, textAlign: "right" }}>R$ {s.ps}</span></div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {[{l:"R$20/ap",f:0,p:20},{l:"R$25/ap",f:0,p:25},{l:"R$30/ap",f:0,p:30},{l:"R$1.500+R$15",f:1500,p:15},{l:"Atual",f:a.salarioBase||0,p:a.valorSessao||0}].map((sc, j) => (<button key={j} onClick={() => { const u = [...simState]; u[a.idx] = { fixo: sc.f, ps: sc.p }; setSimState(u); }} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.sand}`, background: "transparent", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{sc.l}</button>))}
            </div>
          </Card>); })}
        {hasSessions && (<Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📊 Resultado</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
            {[{ l: "Custo novo", v: brl(tCN), c: C.danger },{ l: "Lucro novo", v: brl(tRec - tCN), c: tRec - tCN >= 0 ? C.success : C.danger },{ l: "Margem", v: pct(tRec > 0 ? (tRec - tCN) / tRec : 0), c: C.accent },{ l: "vs Atual", v: `${tCN - tCA > 0 ? "+" : ""}${brl(tCN - tCA)}`, c: tCN <= tCA ? C.success : C.danger }].map((k, i) => (
              <div key={i} className="card" style={{ padding: 14 }}><div style={{ fontSize: 10, color: C.taupe, fontWeight: 600, textTransform: "uppercase" }}>{k.l}</div><div style={{ fontSize: 20, fontWeight: 700, color: k.c, marginTop: 4 }}>{k.v}</div></div>))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: C.beige }}>{["Profissional","Aplic","Receita","Fixo","R$/Ap","Custo Novo","Lucro","vs Atual"].map((h, i) => (<th key={i} style={{ padding: "8px 8px", textAlign: i === 0 ? "left" : "right", fontSize: 10, fontWeight: 700, color: C.taupe, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
              <tbody>{simRes.map((r, i) => (<tr key={i} style={{ borderBottom: `1px solid ${C.beige}` }}><td style={{ padding: "10px 8px", fontWeight: 600 }}>{r.nome}</td><td style={{ padding: "10px 8px", textAlign: "right" }}>{r.tAp}</td><td style={{ padding: "10px 8px", textAlign: "right", color: C.success }}>{brl(r.tRec)}</td><td style={{ padding: "10px 8px", textAlign: "right" }}>{brl(r.fS)}</td><td style={{ padding: "10px 8px", textAlign: "right" }}>R$ {r.pS}</td><td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: C.danger }}>{brl(r.cN)}</td><td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: r.lN >= 0 ? C.success : C.danger }}>{brl(r.lN)}</td><td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: r.diff <= 0 ? C.success : C.danger }}>{r.diff > 0 ? "+" : ""}{brl(r.diff)}</td></tr>))}</tbody>
            </table>
          </div>
        </Card>)}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  CONVÊNIOS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderConvenios = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><Card>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Convênios — Modelo de Pacotes</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: C.beige }}>{["Convênio","Sigla","Tipo","Valor Pacote/Sessão","Aplicações/Pacote","R$/Aplicação","Ativo"].map((h, i) => (<th key={i} style={{ padding: "10px 10px", textAlign: i >= 3 ? "right" : "left", fontSize: 10, fontWeight: 700, color: C.taupe, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
          <tbody>{convenios.map((c, idx) => { const vapl = getConvValorAplicacao(c); return (
            <tr key={c.id} style={{ borderBottom: `1px solid ${C.beige}`, opacity: c.ativo ? 1 : 0.5 }}>
              <td style={{ padding: "10px" }}><input style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.dark, width: "100%", outline: "none" }} value={c.nome} onChange={e => { const u = [...convenios]; u[idx] = { ...u[idx], nome: e.target.value }; setConvenios(u); }} onBlur={saveCfg} /></td>
              <td style={{ padding: "10px" }}><input style={{ border: "none", background: "transparent", fontFamily: "monospace", fontSize: 11, color: C.taupe, width: 50, outline: "none" }} value={c.sigla} onChange={e => { const u = [...convenios]; u[idx] = { ...u[idx], sigla: e.target.value.toUpperCase().slice(0,6) }; setConvenios(u); }} onBlur={saveCfg} /></td>
              <td style={{ padding: "10px" }}><select value={c.tipoPrecif} style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }} onChange={e => { const u = [...convenios]; u[idx] = { ...u[idx], tipoPrecif: e.target.value }; setConvenios(u); saveCfg(); }}><option value="pacote">Pacote</option><option value="sessao">Por Sessão</option></select></td>
              <td style={{ padding: "10px", textAlign: "right" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}><span style={{ fontSize: 11, color: C.taupe }}>R$</span><input type="number" value={c.tipoPrecif === "pacote" ? c.valorPacote : c.valorSessao} style={{ width: 72, border: "none", background: C.cream, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.dark, textAlign: "right", borderRadius: 6, padding: "4px 6px", outline: "none" }} onChange={e => { const u = [...convenios]; const v = parseFloat(e.target.value)||0; u[idx] = c.tipoPrecif === "pacote" ? { ...u[idx], valorPacote: v } : { ...u[idx], valorSessao: v }; setConvenios(u); }} onBlur={saveCfg} /></div></td>
              <td style={{ padding: "10px", textAlign: "right" }}><input type="number" min={1} max={12} value={c.sessoesPacote} style={{ width: 40, border: "none", background: C.cream, fontFamily: "inherit", fontSize: 13, fontWeight: 600, textAlign: "center", borderRadius: 6, padding: "3px 4px", outline: "none" }} onChange={e => { const u = [...convenios]; u[idx] = { ...u[idx], sessoesPacote: parseInt(e.target.value)||6 }; setConvenios(u); }} onBlur={saveCfg} /></td>
              <td style={{ padding: "10px", textAlign: "right", fontWeight: 700, color: C.accent }}>{brl(vapl)}</td>
              <td style={{ padding: "10px", textAlign: "right" }}><div onClick={() => { const u = [...convenios]; u[idx] = { ...u[idx], ativo: !u[idx].ativo }; setConvenios(u); saveCfg(); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 20, borderRadius: 10, cursor: "pointer", background: c.ativo ? C.success : C.sand }}><div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", transform: `translateX(${c.ativo ? 8 : -8}px)`, transition: "transform .2s" }} /></div></td>
            </tr>); })}</tbody>
        </table>
      </div>
    </Card></div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  PROFISSIONAIS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderProfissionais = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><Card>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Remuneração — Fixo + Sessão</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: C.beige }}>{["Profissional","Cargo","Contrato","Tipo","Fixo Mensal","R$/Aplicação","Meta/Dia","Real/Dia","Custo Est."].map((h, i) => (<th key={i} style={{ padding: "10px 8px", textAlign: i >= 4 ? "right" : "left", fontSize: 10, fontWeight: 700, color: C.taupe, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>))}</tr></thead>
          <tbody>{profissionais.map((p, idx) => { const sM = (p.real || 0) * (params.diasUteis || 22); const cE = (p.salarioBase || 0) + sM * (p.valorSessao || 0); return (
            <tr key={p.id} style={{ borderBottom: `1px solid ${C.beige}` }}>
              <td style={{ padding: "10px 8px", fontWeight: 600, minWidth: 140 }}><input style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.dark, width: "100%", outline: "none" }} value={p.nome} onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], nome: e.target.value }; setProfissionais(u); }} onBlur={saveCfg} /></td>
              <td style={{ padding: "10px 8px", color: C.taupe }}><input style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: C.taupe, width: "100%", outline: "none" }} value={p.cargo} onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], cargo: e.target.value }; setProfissionais(u); }} onBlur={saveCfg} /></td>
              <td style={{ padding: "10px 8px" }}><select value={p.contrato} style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }} onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], contrato: e.target.value }; setProfissionais(u); saveCfg(); }}>{["Sócio","CLT","PJ","Estag."].map(o => <option key={o}>{o}</option>)}</select></td>
              <td style={{ padding: "10px 8px" }}><select value={p.tipo} style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }} onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], tipo: e.target.value }; setProfissionais(u); saveCfg(); }}><option value="sessao">Fixo+Sessão</option><option value="prolabore">Pró-labore</option></select></td>
              <td style={{ padding: "10px 8px", textAlign: "right" }}>{p.tipo === "sessao" ? <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}><span style={{ fontSize: 11, color: C.taupe }}>R$</span><input type="number" min={0} step={100} value={p.salarioBase || 0} style={{ width: 72, border: "none", background: C.cream, fontFamily: "inherit", fontSize: 13, fontWeight: 700, textAlign: "right", borderRadius: 6, padding: "3px 6px", outline: "none" }} onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], salarioBase: parseFloat(e.target.value)||0 }; setProfissionais(u); }} onBlur={saveCfg} /></div> : <span style={{ fontSize: 12, color: C.taupe }}>params.</span>}</td>
              <td style={{ padding: "10px 8px", textAlign: "right" }}>{p.tipo === "sessao" ? <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}><span style={{ fontSize: 11, color: C.taupe }}>R$</span><input type="number" min={0} step={1} value={p.valorSessao || 0} style={{ width: 52, border: "none", background: C.cream, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#c62828", textAlign: "right", borderRadius: 6, padding: "3px 6px", outline: "none" }} onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], valorSessao: parseFloat(e.target.value)||0 }; setProfissionais(u); }} onBlur={saveCfg} /><span style={{ fontSize: 11, color: C.taupe }}>/ap</span></div> : <span style={{ fontSize: 12, color: C.taupe }}>—</span>}</td>
              <td style={{ padding: "10px 8px", textAlign: "right" }}><input type="number" min={0} max={12} value={p.meta} style={{ width: 40, border: "none", background: C.cream, fontFamily: "inherit", fontSize: 13, fontWeight: 600, textAlign: "center", borderRadius: 6, padding: "3px 4px", outline: "none" }} onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], meta: parseInt(e.target.value)||0 }; setProfissionais(u); }} onBlur={saveCfg} /></td>
              <td style={{ padding: "10px 8px", textAlign: "right" }}><input type="number" min={0} max={12} value={p.real} style={{ width: 40, border: "none", background: C.cream, fontFamily: "inherit", fontSize: 13, fontWeight: 700, textAlign: "center", borderRadius: 6, padding: "3px 4px", outline: "none" }} onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], real: parseInt(e.target.value)||0 }; setProfissionais(u); }} onBlur={saveCfg} /></td>
              <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: C.danger }}>{brl(cE)}</td>
            </tr>); })}</tbody>
        </table>
      </div>
    </Card></div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  PARÂMETROS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderParametros = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 580 }}><Card>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Parâmetros Gerais</h3>
      {[{ key: "diasUteis", label: "Dias úteis/mês", tipo: "number", suffix: "dias" },{ key: "custoFixo", label: "Custo fixo mensal", tipo: "number", prefix: "R$" },{ key: "imposto", label: "Impostos", tipo: "pct" },{ key: "glosa", label: "Glosa", tipo: "pct" },{ key: "prolabore", label: "Pró-labore sócio", tipo: "number", prefix: "R$" }].map(({ key, label, tipo, prefix, suffix }) => (
        <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <label style={{ fontSize: 13, flex: 1 }}>{label}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{prefix && <span style={{ fontSize: 12, color: C.taupe }}>{prefix}</span>}<input type="number" style={{ width: 90, border: `1.5px solid ${C.sand}`, borderRadius: 8, padding: "8px 10px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.accent, textAlign: "right", background: C.cream, outline: "none" }} value={tipo === "pct" ? (params[key] * 100).toFixed(1) : params[key]} step={tipo === "pct" ? "0.1" : "1"} onChange={e => { const v = parseFloat(e.target.value)||0; setParams(p => ({ ...p, [key]: tipo === "pct" ? v/100 : v })); }} onBlur={saveCfg} />{suffix && <span style={{ fontSize: 12, color: C.taupe }}>{suffix}</span>}{tipo === "pct" && <span style={{ fontSize: 12, color: C.taupe }}>%</span>}</div>
        </div>))}
    </Card>
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={saveCfg} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", background: saved ? C.success : C.accent, color: "white", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{saved ? "✓ Salvo!" : "Salvar"}</button>
      <button onClick={() => { if (!confirm("Restaurar padrões?")) return; setConvenios(DEFAULT_CONVENIOS); setProfissionais(DEFAULT_PROFISSIONAIS); setParams(DEFAULT_PARAMS); setSessionsGrid({}); localStorage.removeItem(lsKey); }} style={{ padding: "12px 20px", borderRadius: 8, border: `1.5px solid ${C.sand}`, background: "transparent", color: C.taupe, fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>Resetar</button>
    </div></div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "relatorio", label: `📥 Relatório${hasSessions ? ` (${totalSessoes})` : ""}` },
    { id: "simulador", label: "🧮 Simulador" },
    { id: "convenios", label: "🏥 Convênios" },
    { id: "profissionais", label: "👥 Profissionais" },
    { id: "parametros", label: "⚙ Parâmetros" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Gestão Operacional da Clínica</h2><p style={{ color: C.taupe, fontSize: 13, marginTop: 2 }}>Pacotes · Convênios · Aplicações · ROI · Simulador</p></div>
        {saved && <div style={{ padding: "6px 14px", borderRadius: 20, background: "#e8f5e9", color: "#2e7d32", fontSize: 12, fontWeight: 600 }}>✓ Salvo</div>}
      </div>
      <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${C.beige}`, marginBottom: 20, scrollbarWidth: "none" }}>
        {TABS.map(t => <Tab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />)}
      </div>
      <div key={tab} className="anim-fade">
        {tab === "dashboard" && renderDashboard()}
        {tab === "relatorio" && renderRelatorio()}
        {tab === "simulador" && renderSimulador()}
        {tab === "convenios" && renderConvenios()}
        {tab === "profissionais" && renderProfissionais()}
        {tab === "parametros" && renderParametros()}
      </div>
    </div>
  );
}
