// ─── ClinicaPage.jsx — Gestão Operacional da Clínica ───────────────────────
// v2: Adiciona aba de upload do Relatório de Frequência (.xlsx)
// Dependência extra: xlsx (SheetJS) — npm install xlsx

import React, { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

// ── helpers ───────────────────────────────────────────────────────────────────
const brl = (v) => {
  const n = Number(v || 0);
  if (!isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
const pct = (v) => {
  const n = Number(v || 0);
  if (!isFinite(n)) return "0,0%";
  return n.toLocaleString("pt-BR", { style: "percent", minimumFractionDigits: 1 });
};

const C = {
  cream: "var(--cream)", beige: "var(--beige)", sand: "var(--sand)",
  taupe: "var(--taupe)", dark: "var(--dark)", accent: "var(--accent)",
  success: "var(--success)", danger: "var(--danger)", warning: "var(--warning)",
  white: "var(--white)",
};

// ── defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_CONVENIOS = [
  { id: 1, nome: "Ndi Minas",  sigla: "NDI",  valor: 160, ativo: true },
  { id: 2, nome: "Unimed",     sigla: "UNIM", valor: 180, ativo: true },
  { id: 3, nome: "Particular", sigla: "PART", valor: 350, ativo: true },
  { id: 4, nome: "Geap",       sigla: "GEAP", valor: 160, ativo: true },
  { id: 5, nome: "Hapvida",    sigla: "HAPV", valor: 140, ativo: true },
  { id: 6, nome: "Usisaude",   sigla: "USIS", valor: 140, ativo: true },
  { id: 7, nome: "NotreDame",  sigla: "NDME", valor: 155, ativo: false },
  { id: 8, nome: "SulAmérica", sigla: "SULA", valor: 165, ativo: false },
];

const DEFAULT_PROFISSIONAIS = [
  { id: 1, nome: "Wessilon Marques",   cargo: "Neuropsicólogo",    contrato: "Sócio",  tipo: "prolabore", valor: 0,    meta: 4, real: 3, tags: ["WESSILON"] },
  { id: 2, nome: "Emily Ferreira",     cargo: "Neuropsicólogo(a)", contrato: "PJ",     tipo: "pct",       valor: 0.40, meta: 4, real: 3, tags: ["EMILY"] },
  { id: 3, nome: "Karolina Oliveira",  cargo: "Psicólogo(a)",      contrato: "PJ",     tipo: "pct",       valor: 0.40, meta: 4, real: 2, tags: ["KAROLINA"] },
  { id: 4, nome: "Mariana Pereira",    cargo: "Neuropsicólogo(a)", contrato: "PJ",     tipo: "pct",       valor: 0.40, meta: 4, real: 2, tags: ["MARIANA"] },
  { id: 5, nome: "Pâmela Dutra",       cargo: "Neuropsicólogo(a)", contrato: "PJ",     tipo: "pct",       valor: 0.40, meta: 4, real: 3, tags: ["PAMELA","PÂMELA"] },
  { id: 6, nome: "Taís Souza",         cargo: "Neuropsicólogo(a)", contrato: "PJ",     tipo: "pct",       valor: 0.40, meta: 4, real: 2, tags: ["TAIS","TAÍS"] },
];

const DEFAULT_PARAMS = {
  diasUteis: 22, ticketMedio: 180, custoFixo: 8000,
  custoVariavel: 25, imposto: 0.06, glosa: 0.05, prolabore: 5000,
};

// ── mini componentes ──────────────────────────────────────────────────────────
const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "10px 18px", border: "none",
    borderBottom: `3px solid ${active ? C.accent : "transparent"}`,
    background: "transparent", color: active ? C.dark : C.taupe,
    fontFamily: "inherit", fontSize: 13, fontWeight: active ? 700 : 500,
    cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap",
  }}>{label}</button>
);

const Card = ({ children, style: s }) => (
  <div className="card anim-expand" style={{ padding: 20, ...s }}>{children}</div>
);

const KPICard = ({ label, real, ideal, fmtFn = brl, color, delay = 0 }) => {
  const diff = ideal - real;
  return (
    <div className="card anim-expand" style={{ padding: 18, animationDelay: `${delay}s` }}>
      <span style={{ fontSize: 10, color: C.taupe, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8, gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: C.taupe, marginBottom: 2 }}>Real</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: color || C.dark }}>{fmtFn(real)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.taupe, marginBottom: 2 }}>Ideal</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.success }}>{fmtFn(ideal)}</div>
        </div>
      </div>
      {diff !== 0 && (
        <div style={{ marginTop: 8, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, background: diff > 0 ? "#e8f5e9" : "#ffebee", color: diff > 0 ? "#2e7d32" : "#c62828" }}>
          {diff > 0 ? "▲" : "▼"} {fmtFn(Math.abs(diff))} potencial
        </div>
      )}
    </div>
  );
};

const HBar = ({ value, max, color = C.accent }) => (
  <div style={{ flex: 1, height: 8, borderRadius: 4, background: C.beige, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%`, height: "100%", borderRadius: 4, background: color, transition: "width .6s ease" }} />
  </div>
);

// ── Parse da planilha real (lê aba "🧪 Testes por Profissional") ─────────────
function parseExcelToGrid(workbook, conveniosConfig, profissionaisConfig) {
  // Resultado: { [profIdx]: { [convIdx]: { fev, mar } } }
  const grid = {};

  // Tentar aba "🧪 Testes por Profissional" ou aba "Resumo"
  const testesSheet = workbook.SheetNames.find(n => n.includes("Testes") || n.includes("Profissional"));

  if (testesSheet) {
    const ws = workbook.Sheets[testesSheet];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (data.length < 4) return grid;

    // Row 1 has convênio names every 4 columns starting from col 2
    const headerRow = data[1] || [];
    const convCols = []; // { colFev, colMar, convIdx }
    for (let c = 2; c < headerRow.length; c++) {
      const name = String(headerRow[c] || "").trim();
      if (!name) continue;
      const matchIdx = conveniosConfig.findIndex(cv =>
        cv.nome.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(cv.nome.toLowerCase())
      );
      if (matchIdx >= 0) {
        convCols.push({ colFev: c, colMar: c + 1, convIdx: matchIdx });
      }
      c += 3; // skip to next group (Fev, Mar, Receita, Custo)
    }

    // Row 3+ has professional data
    for (let r = 3; r < data.length; r++) {
      const row = data[r];
      const profName = String(row[0] || "").trim();
      if (!profName) continue;
      const profIdx = profissionaisConfig.findIndex(p =>
        (p.tags || []).some(tag => profName.toUpperCase().includes(tag.toUpperCase())) ||
        p.nome.toUpperCase().split(" ").some(part => part.length > 3 && profName.toUpperCase().includes(part))
      );
      if (profIdx < 0) continue;
      if (!grid[profIdx]) grid[profIdx] = {};
      for (const { colFev, colMar, convIdx } of convCols) {
        const fev = parseInt(row[colFev]) || 0;
        const mar = parseInt(row[colMar]) || 0;
        if (fev > 0 || mar > 0) {
          if (!grid[profIdx][convIdx]) grid[profIdx][convIdx] = { fev: 0, mar: 0 };
          grid[profIdx][convIdx].fev += fev;
          grid[profIdx][convIdx].mar += mar;
        }
      }
    }
  }
  return grid;
}

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// Calcular stats a partir da grade de sessões (filtrado por meses selecionados)
function calcStatsFromGrid(grid, conveniosConfig, profissionaisConfig, selectedMonths) {
  const byConv = {};
  const byProf = {};
  let totalSessoes = 0, totalReceita = 0, totalCusto = 0;

  for (const [pi, convs] of Object.entries(grid)) {
    const prof = profissionaisConfig[parseInt(pi)];
    if (!prof) continue;
    const pKey = prof.nome;
    if (!byProf[pKey]) byProf[pKey] = { nome: prof.nome, tipo: prof.tipo, valor: prof.valor, byMonth: {}, total: 0, receita: 0, custo: 0 };

    for (const [ci, months] of Object.entries(convs)) {
      const conv = conveniosConfig[parseInt(ci)];
      if (!conv) continue;
      const cKey = conv.nome;
      if (!byConv[cKey]) byConv[cKey] = { nome: conv.nome, valor: conv.valor, byMonth: {}, total: 0, receita: 0, custo: 0 };

      for (const m of selectedMonths) {
        const sess = months[m] || 0;
        if (sess === 0) continue;
        const receita = sess * conv.valor;
        const pctVal = Math.min(prof.valor, 1);
        const custo = prof.tipo === "pct" ? receita * pctVal : prof.tipo === "fixo" ? sess * prof.valor : 0;

        byConv[cKey].byMonth[m] = (byConv[cKey].byMonth[m] || 0) + sess;
        byConv[cKey].total += sess;
        byConv[cKey].receita += receita;
        byConv[cKey].custo += custo;

        byProf[pKey].byMonth[m] = (byProf[pKey].byMonth[m] || 0) + sess;
        byProf[pKey].total += sess;
        byProf[pKey].receita += receita;
        byProf[pKey].custo += custo;

        totalSessoes += sess;
        totalReceita += receita;
        totalCusto += custo;
      }
    }
  }
  return { byConv, byProf, totalSessoes, totalReceita, totalCusto };
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ClinicaPage({ companyId }) {
  const [tab, setTab] = useState("dashboard");
  const lsKey = `clinica_cfg_${companyId || "default"}`;

  const loadCfg = () => {
    try { const r = localStorage.getItem(lsKey); if (r) return JSON.parse(r); } catch (_) {}
    return null;
  };

  const [convenios, setConvenios]         = useState(() => loadCfg()?.convenios || DEFAULT_CONVENIOS);
  const [profissionais, setProfissionais] = useState(() => loadCfg()?.profissionais || DEFAULT_PROFISSIONAIS);
  const [params, setParams]               = useState(() => loadCfg()?.params || DEFAULT_PARAMS);
  const [saved, setSaved]                 = useState(false);

  // Grade de sessões: { [profIdx]: { [convIdx]: { "1": N, "2": N, ... "12": N } } }
  const [sessionsGrid, setSessionsGrid] = useState(() => loadCfg()?.sessionsGrid || {});
  // Custo de testes por mês: { "1": 0, "2": 0, ... "12": 0 }
  const [custoTestesMes, setCustoTestesMes] = useState(() => loadCfg()?.custoTestesMes || {});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [reportName, setReportName] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const saveCfg = useCallback(() => {
    localStorage.setItem(lsKey, JSON.stringify({ convenios, profissionais, params, sessionsGrid, custoTestesMes }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [convenios, profissionais, params, sessionsGrid, custoTestesMes, lsKey]);

  // Meses selecionados para calcular stats (o mês escolhido)
  const selMonths = [String(selectedMonth)];
  const reportStats = calcStatsFromGrid(sessionsGrid, convenios, profissionais, selMonths);

  // Atualizar célula: profissional × convênio × mês
  const updateCell = (pi, ci, month, val) => {
    setSessionsGrid(prev => {
      const g = JSON.parse(JSON.stringify(prev)); // deep clone
      if (!g[pi]) g[pi] = {};
      if (!g[pi][ci]) g[pi][ci] = {};
      g[pi][ci][String(month)] = Math.max(0, parseInt(val) || 0);
      return g;
    });
  };
  const getCell = (pi, ci, month) => sessionsGrid[pi]?.[ci]?.[String(month)] || 0;

  // ── Upload handler ──────────────────────────────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.xlsx?$/i)) { setReportError("Envie um arquivo .xlsx"); return; }
    setReportLoading(true); setReportError("");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const grid = parseExcelToGrid(wb, convenios, profissionais);
      setSessionsGrid(grid);
      setReportName(file.name);
      setTab("relatorio");
    } catch (e) {
      setReportError("Erro ao ler arquivo: " + e.message);
    } finally {
      setReportLoading(false);
    }
  };

  // ── Cálculos operacionais (config) ──────────────────────────────────────────
  const ticket = params.ticketMedio;
  const dias = params.diasUteis;
  const totalSessRealDia  = profissionais.reduce((a, p) => a + (p.real || 0), 0);
  const totalSessIdealDia = profissionais.reduce((a, p) => a + (p.meta || 0), 0);
  const totalSessRealMes  = totalSessRealDia * dias;
  const totalSessIdealMes = totalSessIdealDia * dias;
  const recBrutaReal  = totalSessRealMes * ticket;
  const recBrutaIdeal = totalSessIdealMes * ticket;
  const glosaReal  = recBrutaReal * params.glosa;
  const glosaIdeal = recBrutaIdeal * params.glosa;
  const impReal  = recBrutaReal * params.imposto;
  const impIdeal = recBrutaIdeal * params.imposto;
  const recPosImpReal  = recBrutaReal - glosaReal - impReal;
  const recPosImpIdeal = recBrutaIdeal - glosaIdeal - impIdeal;
  const cvReal  = totalSessRealMes * params.custoVariavel;
  const cvIdeal = totalSessIdealMes * params.custoVariavel;
  const calcRemuneracao = (prop) => profissionais.reduce((t, p) => {
    const s = (p[prop] || 0) * dias;
    if (p.tipo === "pct")  return t + s * ticket * Math.min(p.valor, 1); // cap 100%
    if (p.tipo === "fixo") return t + s * p.valor;
    return t;
  }, 0);
  const remunReal  = calcRemuneracao("real");
  const remunIdeal = calcRemuneracao("meta");
  const custoTestes = custoTestesMes[String(selectedMonth)] || 0;
  const ebitdaReal  = recPosImpReal - params.custoFixo - cvReal - remunReal - custoTestes;
  const ebitdaIdeal = recPosImpIdeal - params.custoFixo - cvIdeal - remunIdeal - custoTestes;
  const lucroReal  = ebitdaReal - params.prolabore;
  const lucroIdeal = ebitdaIdeal - params.prolabore;
  const margemReal  = recBrutaReal  > 0 ? lucroReal  / recBrutaReal  : 0;
  const margemIdeal = recBrutaIdeal > 0 ? lucroIdeal / recBrutaIdeal : 0;
  const roiReal  = (recBrutaReal - lucroReal)  > 0 ? lucroReal  / (recBrutaReal - lucroReal)  : 0;
  const roiIdeal = (recBrutaIdeal - lucroIdeal) > 0 ? lucroIdeal / (recBrutaIdeal - lucroIdeal) : 0;
  const margemPorSessao = ticket * (1 - params.glosa) * (1 - params.imposto) - params.custoVariavel;
  const sessoesBreakeven = margemPorSessao > 0
    ? Math.ceil((params.custoFixo + params.prolabore + custoTestes) / margemPorSessao) : 0;

  // ═══════════════════════════════════════════════════════════════════════════
  //  ABA DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  const renderDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {!reportStats && (
        <div onClick={() => setTab("relatorio")} style={{ padding: "14px 18px", borderRadius: 10, background: "#e3f2fd", border: "1px solid #90caf9", fontSize: 13, color: "#1565c0", cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}>
          <span>📥</span>
          <span><strong>Sem relatório carregado.</strong> Clique aqui para importar o arquivo de frequência e ver os dados reais da clínica.</span>
        </div>
      )}
      {reportStats && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "#e8f5e9", border: "1px solid #a5d6a7", fontSize: 13, color: "#2e7d32", display: "flex", gap: 10, alignItems: "center" }}>
          <span>✅</span>
          <span><strong>{reportName}</strong> carregado — <strong>{reportStats.total}</strong> sessões concluídas</span>
          <button onClick={() => setTab("relatorio")} style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 6, border: "none", background: "#2e7d32", color: "white", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Ver análise</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <KPICard label="Receita Bruta / Mês"  real={recBrutaReal}  ideal={recBrutaIdeal}  delay={0}    />
        <KPICard label="EBITDA Mensal"         real={ebitdaReal}    ideal={ebitdaIdeal}    delay={0.06} color={ebitdaReal >= 0 ? C.success : C.danger} />
        <KPICard label="Lucro Líquido"         real={lucroReal}     ideal={lucroIdeal}     delay={0.12} color={lucroReal >= 0 ? C.success : C.danger} />
        <KPICard label="ROI Mensal"            real={roiReal}       ideal={roiIdeal}       delay={0.18} fmtFn={pct} />
        <KPICard label="Sessões / Mês"         real={totalSessRealMes} ideal={totalSessIdealMes} delay={0.24} fmtFn={(v) => v.toFixed(0)} />
        <KPICard label="Margem Líquida"        real={margemReal}    ideal={margemIdeal}    delay={0.30} fmtFn={pct} />
      </div>

      {/* Ocupação */}
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Ocupação por Profissional</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {profissionais.map((p) => {
            const ocup = p.meta > 0 ? p.real / p.meta : 0;
            const cor = ocup >= 0.8 ? C.success : ocup >= 0.6 ? C.warning : C.danger;
            return (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "200px 1fr 56px 36px", alignItems: "center", gap: 12 }}>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{p.nome}</div><div style={{ fontSize: 11, color: C.taupe }}>{p.cargo}</div></div>
                <HBar value={p.real} max={p.meta} color={cor} />
                <span style={{ fontSize: 12, fontWeight: 700, color: cor, textAlign: "right" }}>{pct(ocup)}</span>
                <span style={{ fontSize: 14 }}>{ocup >= 0.8 ? "✅" : ocup >= 0.6 ? "⚠️" : "🔴"}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* DRE */}
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>DRE Resumida — Real vs Ideal</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.beige }}>
                {["Linha","Real (R$)","Ideal (R$)","Gap (R$)"].map((h, i) => (
                  <th key={i} style={{ padding: "10px 12px", textAlign: i === 0 ? "left" : "right", fontSize: 11, fontWeight: 700, color: C.taupe, textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { l: "(+) Receita Bruta",         r: recBrutaReal,   i: recBrutaIdeal,   bold: false },
                { l: "  (-) Glosa/Impostos",       r: -(glosaReal+impReal), i: -(glosaIdeal+impIdeal), bold: false },
                { l: "(=) Rec. Pós-impostos",      r: recPosImpReal,  i: recPosImpIdeal,  bold: true  },
                { l: "  (-) Custo Fixo",           r: -params.custoFixo, i: -params.custoFixo, bold: false },
                { l: "  (-) Custos Variáveis",     r: -cvReal,        i: -cvIdeal,        bold: false },
                { l: "  (-) Custo com Testes",       r: -custoTestes,   i: -custoTestes,    bold: false },
                { l: "  (-) Remuneração Profs.",   r: -remunReal,     i: -remunIdeal,     bold: false },
                { l: "(=) EBITDA",                 r: ebitdaReal,     i: ebitdaIdeal,     bold: true  },
                { l: "  (-) Pró-labore",           r: -params.prolabore, i: -params.prolabore, bold: false },
                { l: "(=) LUCRO LÍQUIDO",          r: lucroReal,      i: lucroIdeal,      bold: true, hl: true },
              ].map(({ l, r, i, bold, hl }, idx) => (
                <tr key={idx} style={{ background: hl ? "#f0fdf4" : idx % 2 === 0 ? C.cream : "transparent" }}>
                  <td style={{ padding: "10px 12px", fontWeight: bold ? 700 : 400 }}>{l}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: bold ? 700 : 400, color: r >= 0 ? C.dark : C.danger }}>{brl(r)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: bold ? 700 : 400, color: i >= 0 ? C.success : C.danger }}>{brl(i)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, color: (i-r) > 0 ? C.success : (i-r) < 0 ? C.danger : C.taupe }}>{(i-r) !== 0 ? brl(i-r) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Breakeven */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { l: "Breakeven (sess/mês)", v: sessoesBreakeven, s: `≈ ${(sessoesBreakeven/dias).toFixed(1)} sess/dia`, color: C.warning },
          { l: "Sessões/Dia (Real)", v: totalSessRealDia, s: `Meta: ${totalSessIdealDia}/dia`, color: C.accent },
          { l: "Receita Adicional Disponível", v: brl(recBrutaIdeal - recBrutaReal), s: `${totalSessIdealMes - totalSessRealMes} sessões a mais/mês`, color: C.success, isStr: true },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: 18, borderLeft: `4px solid ${k.color}` }}>
            <div style={{ fontSize: 10, color: C.taupe, fontWeight: 600, textTransform: "uppercase" }}>{k.l}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.dark, marginTop: 6 }}>{k.isStr ? k.v : k.v.toLocaleString("pt-BR")}</div>
            <div style={{ fontSize: 12, color: C.taupe, marginTop: 4 }}>{k.s}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  ABA RELATÓRIO
  // ═══════════════════════════════════════════════════════════════════════════
  const renderRelatorio = () => {
    const activeConvs = convenios.filter(c => c.ativo);
    const { byConv, byProf, totalSessoes, totalReceita, totalCusto } = reportStats;
    const convList = Object.values(byConv).sort((a, b) => b.receita - a.receita);
    const profList = Object.values(byProf).sort((a, b) => b.receita - a.receita);
    const hasSessions = totalSessoes > 0;
    const mesLabel = MESES[selectedMonth - 1];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Seletor de mês + Import */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1.5px solid ${C.sand}`, flexShrink: 0 }}>
            {MESES.map((m, i) => (
              <button key={i} onClick={() => setSelectedMonth(i + 1)} style={{
                padding: "8px 10px", border: "none", fontSize: 11, fontWeight: selectedMonth === i + 1 ? 700 : 400,
                background: selectedMonth === i + 1 ? C.accent : "transparent",
                color: selectedMonth === i + 1 ? "white" : C.taupe,
                cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
              }}>{m}</button>
            ))}
          </div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            style={{
              flex: 1, minWidth: 150, border: `2px dashed ${dragOver ? C.accent : C.sand}`,
              borderRadius: 10, padding: "10px 16px", textAlign: "center", cursor: "pointer",
              background: dragOver ? "#fdf8f2" : C.cream, transition: "all .2s", fontSize: 12,
            }}
          >
            {reportLoading ? "Processando..." : reportName ? `📄 ${reportName}` : "📥 Importar .xlsx"}
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
          {reportError && <span style={{ fontSize: 12, color: C.danger }}>{reportError}</span>}
        </div>

        {/* Grade: Profissional × Convênio → Sessões do mês selecionado */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>📝 Sessões — {mesLabel} 2026</h3>
            <span style={{ fontSize: 11, color: C.taupe }}>Preencha as sessões de cada profissional por convênio</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.beige }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.taupe, minWidth: 130 }}>PROFISSIONAL</th>
                  {activeConvs.map(c => (
                    <th key={c.id} style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.taupe, borderLeft: `1px solid ${C.sand}`, minWidth: 60 }}>
                      {c.sigla}<br/><span style={{ fontWeight: 400, fontSize: 9 }}>{brl(c.valor)}</span>
                    </th>
                  ))}
                  <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.accent, borderLeft: `2px solid ${C.accent}` }}>TOTAL</th>
                  <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.success }}>RECEITA</th>
                </tr>
              </thead>
              <tbody>
                {profissionais.map((p, pi) => {
                  let rowTotal = 0, rowReceita = 0;
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.beige}` }}>
                      <td style={{ padding: "6px 10px" }}>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{p.nome}</div>
                        <div style={{ fontSize: 10, color: C.taupe }}>{p.cargo} · {p.tipo === "pct" ? `${Math.round(p.valor*100)}%` : p.tipo === "fixo" ? brl(p.valor) : "PL"}</div>
                      </td>
                      {activeConvs.map(c => {
                        const ci = convenios.indexOf(c);
                        const val = getCell(pi, ci, selectedMonth);
                        rowTotal += val;
                        rowReceita += val * c.valor;
                        return (
                          <td key={c.id} style={{ padding: "4px 2px", textAlign: "center", borderLeft: `1px solid ${C.sand}` }}>
                            <input type="number" min="0" value={val || ""} placeholder="0"
                              style={{ width: 42, border: "none", background: val > 0 ? "#e8f5e9" : "transparent", borderRadius: 4, textAlign: "center", fontSize: 13, fontWeight: 700, color: C.dark, outline: "none", padding: "4px 2px", fontFamily: "inherit" }}
                              onChange={e => updateCell(pi, ci, selectedMonth, e.target.value)} onBlur={saveCfg} />
                          </td>
                        );
                      })}
                      <td style={{ padding: "6px 4px", textAlign: "center", fontWeight: 700, fontSize: 14, borderLeft: `2px solid ${C.accent}` }}>{rowTotal}</td>
                      <td style={{ padding: "6px 4px", textAlign: "center", fontWeight: 700, color: C.success, fontSize: 11 }}>{brl(rowReceita)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: C.beige, fontWeight: 700, fontSize: 13 }}>
                  <td style={{ padding: "8px 10px" }}>TOTAL {mesLabel}</td>
                  {activeConvs.map(c => {
                    const ci = convenios.indexOf(c);
                    const total = profissionais.reduce((a, _, pi) => a + getCell(pi, ci, selectedMonth), 0);
                    return <td key={c.id} style={{ padding: "6px 4px", textAlign: "center", borderLeft: `1px solid ${C.sand}` }}>{total}</td>;
                  })}
                  <td style={{ padding: "6px 4px", textAlign: "center", color: C.accent, borderLeft: `2px solid ${C.accent}` }}>{totalSessoes}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center", color: C.success, fontSize: 11 }}>{brl(totalReceita)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Custo com testes do mês */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: C.cream, borderRadius: 10, border: `1px solid ${C.sand}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>🧪 Custo com testes — {mesLabel}:</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12, color: C.taupe }}>R$</span>
            <input type="number" min="0" step="100"
              value={custoTestes || ""}
              placeholder="0"
              style={{ width: 100, border: `1.5px solid ${C.sand}`, borderRadius: 6, padding: "6px 8px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.danger, textAlign: "right", background: "white", outline: "none" }}
              onChange={e => setCustoTestesMes(prev => ({ ...prev, [String(selectedMonth)]: parseFloat(e.target.value) || 0 }))}
              onBlur={saveCfg}
              onFocus={e => e.target.style.borderColor = C.accent}
            />
          </div>
          <span style={{ fontSize: 11, color: C.taupe }}>Valor gasto comprando testes neste mês</span>
        </div>

        {/* KPIs do mês */}
        {hasSessions && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {[
              { l: `Sessões ${mesLabel}`, v: totalSessoes, color: C.accent },
              { l: "Receita Bruta", v: brl(totalReceita), color: C.success },
              { l: "Custo Profissionais", v: brl(totalCusto), color: C.danger },
              { l: "Margem Clínica", v: brl(totalReceita - totalCusto), color: totalReceita - totalCusto >= 0 ? C.success : C.danger },
              { l: "Margem %", v: pct(totalReceita > 0 ? (totalReceita - totalCusto) / totalReceita : 0), color: C.accent },
            ].map((k, i) => (
              <div key={i} className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: C.taupe, fontWeight: 600, textTransform: "uppercase" }}>{k.l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: k.color, marginTop: 4 }}>{k.v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Receita por Convênio */}
        {convList.length > 0 && (
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📋 Receita por Convênio — {mesLabel}</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: C.beige }}>
                  {["Convênio","Sessões","Val/Sessão","Receita","Custo Prof.","Margem","Margem %"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 10px", textAlign: i === 0 ? "left" : "right", fontSize: 10, fontWeight: 700, color: C.taupe, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{convList.map((c, i) => {
                  const margem = c.receita - c.custo;
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.beige}` }}>
                      <td style={{ padding: "10px 10px", fontWeight: 600 }}>{c.nome}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700 }}>{c.total}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right" }}>{brl(c.valor)}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: C.success }}>{brl(c.receita)}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right", color: C.danger }}>{brl(c.custo)}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: margem >= 0 ? C.success : C.danger }}>{brl(margem)}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right" }}>
                        <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: c.receita > 0 && margem/c.receita >= 0.5 ? "#e8f5e9" : "#fff8e1", color: c.receita > 0 && margem/c.receita >= 0.5 ? "#2e7d32" : "#f57f17" }}>
                          {pct(c.receita > 0 ? margem / c.receita : 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Custo por Profissional */}
        {profList.length > 0 && (
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>👥 Custo por Profissional — {mesLabel}</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: C.beige }}>
                  {["Profissional","Sessões","Receita","Repasse","Custo","Valor Neto"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 10px", textAlign: i === 0 ? "left" : "right", fontSize: 10, fontWeight: 700, color: C.taupe, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{profList.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.beige}` }}>
                    <td style={{ padding: "10px 10px", fontWeight: 600 }}>{p.nome}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700 }}>{p.total}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right", color: C.success }}>{brl(p.receita)}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      {p.tipo === "pct" ? <span style={{ fontSize: 11, color: "#1565c0" }}>{pct(p.valor)}</span> : <span style={{ fontSize: 11 }}>{brl(p.valor)}/s</span>}
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right", color: C.danger, fontWeight: 700 }}>{brl(p.custo)}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: (p.receita - p.custo) >= 0 ? C.success : C.danger }}>{brl(p.receita - p.custo)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  ABA CONVÊNIOS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderConvenios = () => {
    const ativos = convenios.filter(c => c.ativo);
    const maxVal = Math.max(...ativos.map(c => c.valor), 1);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Valores por Convênio</h3>
            <span style={{ fontSize: 12, color: C.taupe }}>Clique no valor para editar</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.beige }}>
                  {["#","Convênio","Sigla","Valor/Sessão","Referência","Ativo"].map((h, i) => (
                    <th key={i} style={{ padding: "10px 12px", textAlign: i >= 3 ? "right" : "left", fontSize: 11, fontWeight: 700, color: C.taupe, textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {convenios.map((c, idx) => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.beige}`, opacity: c.ativo ? 1 : 0.5 }}>
                    <td style={{ padding: "10px 12px", color: C.taupe, fontSize: 12 }}>{c.id}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                      <input style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.dark, width: "100%", outline: "none", borderBottom: "1.5px dashed transparent" }}
                        value={c.nome}
                        onChange={e => { const u = [...convenios]; u[idx] = { ...u[idx], nome: e.target.value }; setConvenios(u); }}
                        onBlur={saveCfg} />
                    </td>
                    <td style={{ padding: "10px 12px", color: C.taupe, fontSize: 11 }}>
                      <input style={{ border: "none", background: "transparent", fontFamily: "monospace", fontSize: 11, color: C.taupe, width: 50, outline: "none" }}
                        value={c.sigla}
                        onChange={e => { const u = [...convenios]; u[idx] = { ...u[idx], sigla: e.target.value.toUpperCase().slice(0,6) }; setConvenios(u); }}
                        onBlur={saveCfg} />
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <div style={{ flex: 1, maxWidth: 80 }}><HBar value={c.valor} max={maxVal} color={C.accent} /></div>
                        <span style={{ fontSize: 12, color: C.taupe }}>R$</span>
                        <input type="number" style={{ width: 72, border: "none", background: C.cream, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.dark, textAlign: "right", borderRadius: 6, padding: "4px 6px", outline: "none" }}
                          value={c.valor}
                          onChange={e => { const u = [...convenios]; u[idx] = { ...u[idx], valor: parseFloat(e.target.value)||0 }; setConvenios(u); }}
                          onBlur={saveCfg} />
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, color: C.taupe }}>
                      {c.valor >= 300 ? "🟢 Premium" : c.valor >= 180 ? "🟡 Médio" : "🔴 Básico"}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <div onClick={() => { const u = [...convenios]; u[idx] = { ...u[idx], ativo: !u[idx].ativo }; setConvenios(u); saveCfg(); }}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 20, borderRadius: 10, cursor: "pointer", transition: "all .2s", background: c.ativo ? C.success : C.sand }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", transform: `translateX(${c.ativo ? 8 : -8}px)`, transition: "transform .2s" }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  ABA PROFISSIONAIS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderProfissionais = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Remuneração e Metas</h3>
          <span style={{ fontSize: 12, color: C.taupe }}>Clique para editar</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.beige }}>
                {["Profissional","Cargo","Contrato","Tipo Pag.","Valor","Meta/Dia","Real/Dia","Custo/Sessão","Custo/Mês"].map((h, i) => (
                  <th key={i} style={{ padding: "10px 10px", textAlign: i >= 4 ? "right" : "left", fontSize: 10, fontWeight: 700, color: C.taupe, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profissionais.map((p, idx) => {
                const sessMesReal = (p.real || 0) * params.diasUteis;
                const recProf = sessMesReal * params.ticketMedio;
                const custoSessao = p.tipo === "pct" ? params.ticketMedio * p.valor : p.tipo === "fixo" ? p.valor : 0;
                const custoMes = p.tipo === "pct" ? recProf * p.valor : p.tipo === "fixo" ? sessMesReal * p.valor : params.prolabore;
                const ocup = p.meta > 0 ? p.real / p.meta : 0;
                const corOcup = ocup >= 0.8 ? C.success : ocup >= 0.6 ? C.warning : C.danger;

                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${C.beige}` }}>
                    <td style={{ padding: "10px 10px", fontWeight: 600, minWidth: 140 }}>
                      <input style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.dark, width: "100%", outline: "none" }}
                        value={p.nome}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], nome: e.target.value }; setProfissionais(u); }}
                        onBlur={saveCfg} />
                    </td>
                    <td style={{ padding: "10px 10px", color: C.taupe, minWidth: 120 }}>
                      <input style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: C.taupe, width: "100%", outline: "none" }}
                        value={p.cargo}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], cargo: e.target.value }; setProfissionais(u); }}
                        onBlur={saveCfg} />
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <select value={p.contrato} style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: C.dark, cursor: "pointer" }}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], contrato: e.target.value }; setProfissionais(u); saveCfg(); }}>
                        {["Sócio","CLT","PJ","CLT/PJ","Estag."].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <select value={p.tipo} style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: C.dark, cursor: "pointer" }}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], tipo: e.target.value, valor: 0 }; setProfissionais(u); saveCfg(); }}>
                        <option value="pct">% Repasse</option>
                        <option value="fixo">R$ Fixo/Sess.</option>
                        <option value="prolabore">Pró-labore</option>
                      </select>
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      {p.tipo !== "prolabore" ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                          <input type="number" style={{ width: 60, border: "none", background: C.cream, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: C.dark, textAlign: "right", borderRadius: 6, padding: "3px 6px", outline: "none" }}
                            value={p.tipo === "pct" ? (p.valor * 100).toFixed(0) : p.valor}
                            step={p.tipo === "pct" ? "1" : "10"}
                            onChange={e => { const v = parseFloat(e.target.value)||0; const u = [...profissionais]; u[idx] = { ...u[idx], valor: p.tipo === "pct" ? v/100 : v }; setProfissionais(u); }}
                            onBlur={saveCfg} />
                          <span style={{ fontSize: 11, color: C.taupe }}>{p.tipo === "pct" ? "%" : "R$"}</span>
                        </div>
                      ) : <span style={{ fontSize: 12, color: C.taupe }}>ver params.</span>}
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      <input type="number" min={0} max={12} value={p.meta}
                        style={{ width: 40, border: "none", background: C.cream, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.dark, textAlign: "center", borderRadius: 6, padding: "3px 4px", outline: "none" }}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], meta: parseInt(e.target.value)||0 }; setProfissionais(u); }}
                        onBlur={saveCfg} />
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      <input type="number" min={0} max={12} value={p.real}
                        style={{ width: 40, border: "none", background: ocup >= 0.8 ? "#e8f5e9" : ocup >= 0.6 ? "#fff8e1" : "#ffebee", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: corOcup, textAlign: "center", borderRadius: 6, padding: "3px 4px", outline: "none" }}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], real: parseInt(e.target.value)||0 }; setProfissionais(u); }}
                        onBlur={saveCfg} />
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontSize: 12, color: C.taupe }}>{brl(custoSessao)}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: C.danger }}>{brl(custoMes)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  ABA PARÂMETROS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderParametros = () => {
    const fields = [
      { key: "diasUteis",    label: "Dias úteis por mês",             tipo: "number", suffix: "dias" },
      { key: "ticketMedio",  label: "Ticket médio por sessão (R$)",   tipo: "number", prefix: "R$"   },
      { key: "custoFixo",    label: "Custo fixo mensal (R$)",         tipo: "number", prefix: "R$"   },
      { key: "custoVariavel",label: "Custo variável por sessão (R$)", tipo: "number", prefix: "R$"   },
      { key: "imposto",      label: "Alíquota de impostos (%)",       tipo: "pct"                    },
      { key: "glosa",        label: "Glosa / inadimplência (%)",      tipo: "pct"                    },
      { key: "prolabore",    label: "Pró-labore do sócio (R$)",       tipo: "number", prefix: "R$"   },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 580 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Parâmetros Gerais</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {fields.map(({ key, label, tipo, prefix, suffix }) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <label style={{ fontSize: 13, color: C.dark, flex: 1 }}>{label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {prefix && <span style={{ fontSize: 12, color: C.taupe }}>{prefix}</span>}
                  <input type="number"
                    style={{ width: 90, border: `1.5px solid ${C.sand}`, borderRadius: 8, padding: "8px 10px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.accent, textAlign: "right", background: C.cream, outline: "none" }}
                    value={tipo === "pct" ? (params[key] * 100).toFixed(1) : params[key]}
                    step={tipo === "pct" ? "0.1" : "1"}
                    onChange={e => { const v = parseFloat(e.target.value)||0; setParams(p => ({ ...p, [key]: tipo === "pct" ? v/100 : v })); }}
                    onBlur={saveCfg} />
                  {suffix && <span style={{ fontSize: 12, color: C.taupe }}>{suffix}</span>}
                  {tipo === "pct" && <span style={{ fontSize: 12, color: C.taupe }}>%</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={saveCfg} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", background: saved ? C.success : C.accent, color: "white", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
            {saved ? "✓ Salvo!" : "Salvar Configurações"}
          </button>
          <button onClick={() => { if (!confirm("Restaurar padrões?")) return; setConvenios(DEFAULT_CONVENIOS); setProfissionais(DEFAULT_PROFISSIONAIS); setParams(DEFAULT_PARAMS); localStorage.removeItem(lsKey); }}
            style={{ padding: "12px 20px", borderRadius: 8, border: `1.5px solid ${C.sand}`, background: "transparent", color: C.taupe, fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>
            Resetar
          </button>
        </div>
      </div>
    );
  };

  // ── nav ────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: "dashboard",     label: "📊 Dashboard"    },
    { id: "relatorio",     label: reportStats ? `📥 Relatório (${reportStats.total})` : "📥 Relatório" },
    { id: "convenios",     label: "🏥 Convênios"    },
    { id: "profissionais", label: "👥 Profissionais" },
    { id: "parametros",    label: "⚙ Parâmetros"   },
  ];

  const renderTab = () => {
    switch (tab) {
      case "dashboard":     return renderDashboard();
      case "relatorio":     return renderRelatorio();
      case "convenios":     return renderConvenios();
      case "profissionais": return renderProfissionais();
      case "parametros":    return renderParametros();
      default:              return renderDashboard();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Gestão Operacional da Clínica</h2>
          <p style={{ color: C.taupe, fontSize: 13, marginTop: 2 }}>Sessões · Convênios · Remuneração · ROI · Real vs Ideal</p>
        </div>
        {saved && (
          <div style={{ padding: "6px 14px", borderRadius: 20, background: "#e8f5e9", color: "#2e7d32", fontSize: 12, fontWeight: 600 }}>✓ Configurações salvas</div>
        )}
      </div>
      <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${C.beige}`, marginBottom: 20, scrollbarWidth: "none" }}>
        {TABS.map(t => <Tab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />)}
      </div>
      <div key={tab} className="anim-fade">{renderTab()}</div>
    </div>
  );
}
