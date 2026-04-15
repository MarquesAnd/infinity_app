// ─── ClinicaPage.jsx — Gestão Operacional da Clínica ───────────────────────
// v2: Adiciona aba de upload do Relatório de Frequência (.xlsx)
// Dependência extra: xlsx (SheetJS) — npm install xlsx

import { useState, useEffect, useCallback, useRef } from "react";
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

// ── Parsing do relatório ──────────────────────────────────────────────────────
const STATUS_CONCLUIDO = ["Concluído", "Concluido"];

function parseReport(workbook, conveniosConfig, profissionaisConfig) {
  const rows = [];
  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (data.length < 2) continue;

    // Encontrar linha de cabeçalho (tem "Convenio")
    let headerRow = 0;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      if (String(data[i][0]).toLowerCase().includes("convenio") || String(data[i][0]).toLowerCase().includes("convênio")) {
        headerRow = i; break;
      }
    }

    const COL = { convenio: 0, data: 1, paciente: 2, procedimento: 3, profissional: 4, status: 5 };

    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      const convenio = String(row[COL.convenio] || "").trim();
      const status = String(row[COL.status] || "").trim();
      const profissional = String(row[COL.profissional] || "").trim();
      const procedimento = String(row[COL.procedimento] || "").trim();
      let dataRaw = row[COL.data];

      if (!convenio || convenio === "Convenio" || convenio === "Convênio") continue;
      if (!STATUS_CONCLUIDO.includes(status)) continue;

      // Parse data
      let mes = null;
      if (dataRaw instanceof Date) {
        mes = dataRaw.getMonth() + 1;
      } else if (typeof dataRaw === "number") {
        const d = new Date((dataRaw - 25569) * 86400 * 1000);
        mes = d.getMonth() + 1;
      } else if (typeof dataRaw === "string") {
        const parts = dataRaw.split(/[-\/]/);
        mes = parts.length >= 2 ? parseInt(parts[1]) : null;
      }

      // Simplificar procedimento
      let proc = "Avaliação";
      const p = procedimento.toLowerCase();
      if (p.includes("devolutiva")) proc = "Devolutiva";
      else if (p.includes("psicoterapi")) proc = "Psicoterapia";
      else if (p.includes("anamnese")) proc = "Anamnese";

      // Match convênio → config
      const convMatch = conveniosConfig.find(c =>
        c.nome.toLowerCase().includes(convenio.toLowerCase()) ||
        convenio.toLowerCase().includes(c.nome.toLowerCase()) ||
        c.sigla.toLowerCase() === convenio.toLowerCase()
      );

      // Match profissional → config
      const profUpper = profissional.toUpperCase();
      const profMatch = profissionaisConfig.find(p =>
        (p.tags || []).some(tag => profUpper.includes(tag.toUpperCase())) ||
        p.nome.toUpperCase().split(" ").some(part => part.length > 3 && profUpper.includes(part))
      );

      rows.push({
        convenio, convenioNome: convMatch ? convMatch.nome : convenio,
        convenioValor: convMatch ? convMatch.valor : 0,
        profissional, profNome: profMatch ? profMatch.nome : profissional,
        profTipo: profMatch ? profMatch.tipo : "pct",
        profValor: profMatch ? profMatch.valor : 0.40,
        procedimento: proc, mes, sheet: sheetName,
      });
    }
  }
  return rows;
}

function calcStats(rows, profissionaisConfig) {
  // Por convênio
  const byConv = {};
  // Por profissional
  const byProf = {};
  // Por mês
  const byMes = {};

  for (const r of rows) {
    // Por convênio
    if (!byConv[r.convenioNome]) byConv[r.convenioNome] = { nome: r.convenioNome, valor: r.convenioValor, fev: 0, mar: 0, outros: 0, recBruta: 0, custoProf: 0 };
    const bc = byConv[r.convenioNome];
    if (r.mes === 2) bc.fev++;
    else if (r.mes === 3) bc.mar++;
    else bc.outros++;
    bc.recBruta += r.convenioValor;
    if (r.profTipo === "pct") bc.custoProf += r.convenioValor * r.profValor;
    else if (r.profTipo === "fixo") bc.custoProf += r.profValor;

    // Por profissional
    const pk = r.profNome;
    if (!byProf[pk]) byProf[pk] = { nome: r.profNome, tipo: r.profTipo, valor: r.profValor, convs: {}, fev: 0, mar: 0, recBruta: 0, custoProf: 0 };
    const bp = byProf[pk];
    if (r.mes === 2) bp.fev++;
    else if (r.mes === 3) bp.mar++;
    bp.recBruta += r.convenioValor;
    if (r.profTipo === "pct") bp.custoProf += r.convenioValor * r.profValor;
    else if (r.profTipo === "fixo") bp.custoProf += r.profValor;
    if (!bp.convs[r.convenioNome]) bp.convs[r.convenioNome] = 0;
    bp.convs[r.convenioNome]++;

    // Por mês
    const mk = r.mes === 2 ? "Fevereiro" : r.mes === 3 ? "Março" : `Mês ${r.mes}`;
    if (!byMes[mk]) byMes[mk] = { mes: mk, sessoes: 0, recBruta: 0, custoProf: 0 };
    byMes[mk].sessoes++;
    byMes[mk].recBruta += r.convenioValor;
    if (r.profTipo === "pct") byMes[mk].custoProf += r.convenioValor * r.profValor;
    else if (r.profTipo === "fixo") byMes[mk].custoProf += r.profValor;
  }

  return { byConv, byProf, byMes, total: rows.length };
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ClinicaPage({ transactions = [], companyId }) {
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

  // Relatório
  const [reportData, setReportData] = useState(null); // rows brutas
  const [reportStats, setReportStats] = useState(null);
  const [reportName, setReportName] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const saveCfg = useCallback(() => {
    localStorage.setItem(lsKey, JSON.stringify({ convenios, profissionais, params }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [convenios, profissionais, params, lsKey]);

  // Recalcular stats quando config muda
  useEffect(() => {
    if (reportData) {
      const rows = parseReport({ SheetNames: reportData._sheetNames, Sheets: reportData._sheets }, convenios, profissionais);
      setReportStats(calcStats(rows, profissionais));
    }
  }, [convenios, profissionais, reportData]);

  // ── Upload handler ──────────────────────────────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.xlsx?$/i)) { setReportError("Envie um arquivo .xlsx"); return; }
    setReportLoading(true); setReportError("");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      // Guardar workbook raw para recalcular quando config mudar
      setReportData({ _sheetNames: wb.SheetNames, _sheets: wb.Sheets });
      const rows = parseReport(wb, convenios, profissionais);
      setReportStats(calcStats(rows, profissionais));
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
  const ebitdaReal  = recPosImpReal - params.custoFixo - cvReal - remunReal;
  const ebitdaIdeal = recPosImpIdeal - params.custoFixo - cvIdeal - remunIdeal;
  const lucroReal  = ebitdaReal - params.prolabore;
  const lucroIdeal = ebitdaIdeal - params.prolabore;
  const margemReal  = recBrutaReal  > 0 ? lucroReal  / recBrutaReal  : 0;
  const margemIdeal = recBrutaIdeal > 0 ? lucroIdeal / recBrutaIdeal : 0;
  const roiReal  = (recBrutaReal - lucroReal)  > 0 ? lucroReal  / (recBrutaReal - lucroReal)  : 0;
  const roiIdeal = (recBrutaIdeal - lucroIdeal) > 0 ? lucroIdeal / (recBrutaIdeal - lucroIdeal) : 0;
  const margemPorSessao = ticket * (1 - params.glosa) * (1 - params.imposto) - params.custoVariavel;
  const sessoesBreakeven = margemPorSessao > 0
    ? Math.ceil((params.custoFixo + params.prolabore) / margemPorSessao) : 0;

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
    const DropZone = () => (
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? C.accent : C.sand}`,
          borderRadius: 16, padding: "52px 24px", textAlign: "center", cursor: "pointer",
          background: dragOver ? "#fdf8f2" : C.cream, transition: "all .2s",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📥</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 8 }}>
          Arraste o relatório de frequência aqui
        </div>
        <div style={{ fontSize: 13, color: C.taupe, marginBottom: 16 }}>
          ou clique para selecionar o arquivo <strong>.xlsx</strong>
        </div>
        <div style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, background: C.accent, color: "white", fontSize: 14, fontWeight: 600 }}>
          {reportLoading ? "Processando..." : "Selecionar arquivo"}
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      </div>
    );

    if (!reportStats) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <DropZone />
        {reportError && (
          <div style={{ padding: "12px 16px", borderRadius: 8, background: "#ffebee", color: "#c62828", fontSize: 13 }}>{reportError}</div>
        )}
        <div style={{ padding: "16px 20px", borderRadius: 12, background: C.beige, fontSize: 13, color: C.taupe }}>
          <strong>Como usar:</strong> Exporte o relatório de frequência do seu sistema de agendamento como .xlsx, arraste aqui e o sistema calcula automaticamente a receita por convênio e o custo por profissional com base nas configurações da aba ⚙ Parâmetros.
        </div>
      </div>
    );

    // Dados carregados
    const convs = Object.values(reportStats.byConv).sort((a, b) => b.recBruta - a.recBruta);
    const profs = Object.values(reportStats.byProf).sort((a, b) => b.recBruta - a.recBruta);
    const meses = Object.values(reportStats.byMes).sort((a, b) => (a.mes > b.mes ? 1 : -1));
    const totalRec   = convs.reduce((a, c) => a + c.recBruta, 0);
    const totalCusto = convs.reduce((a, c) => a + c.custoProf, 0);
    const totalSess  = convs.reduce((a, c) => a + c.fev + c.mar + c.outros, 0);
    const maxRec = Math.max(...convs.map(c => c.recBruta), 1);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Cabeçalho com nome do arquivo e botão de re-upload */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: C.taupe }}>Arquivo carregado:</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>📄 {reportName}</div>
          </div>
          <button onClick={() => { setReportData(null); setReportStats(null); setReportName(""); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${C.sand}`, background: "transparent", color: C.taupe, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>
            Trocar arquivo
          </button>
        </div>

        {/* KPIs do relatório */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
          {[
            { l: "Sessões Concluídas", v: totalSess.toLocaleString("pt-BR"), color: C.accent },
            { l: "Receita Bruta Total",  v: brl(totalRec),   color: C.success },
            { l: "Custo Profissionais",  v: brl(totalCusto), color: C.danger  },
            { l: "Margem Clínica",       v: brl(totalRec - totalCusto), color: C.success },
            { l: "Margem %",             v: pct(totalRec > 0 ? (totalRec - totalCusto) / totalRec : 0), color: C.accent },
          ].map((k, i) => (
            <div key={i} className="card anim-expand" style={{ padding: 16, animationDelay: `${i*0.06}s` }}>
              <div style={{ fontSize: 10, color: C.taupe, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{k.l}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: k.color, marginTop: 6 }}>{k.v}</div>
            </div>
          ))}
        </div>

        {/* Por convênio */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📋 Receita e Custo por Convênio</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.beige }}>
                  {["Convênio","Fev","Mar","Total Sess.","Valor/Sessão","Receita Bruta","Custo Prof.","Margem","Margem %"].map((h, i) => (
                    <th key={i} style={{ padding: "10px 12px", textAlign: i === 0 ? "left" : "right", fontSize: 11, fontWeight: 700, color: C.taupe, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {convs.map((c, idx) => {
                  const total = c.fev + c.mar + c.outros;
                  const margem = c.recBruta - c.custoProf;
                  const margemPct = c.recBruta > 0 ? margem / c.recBruta : 0;
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${C.beige}` }}>
                      <td style={{ padding: "12px 12px" }}>
                        <div style={{ fontWeight: 600 }}>{c.nome}</div>
                        <div style={{ marginTop: 4 }}>
                          <HBar value={c.recBruta} max={maxRec} color={C.accent} />
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px", textAlign: "right", color: C.taupe }}>{c.fev}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right", color: C.taupe }}>{c.mar}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 700 }}>{total}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right" }}>
                        <span style={{ fontSize: 12, color: c.valor > 0 ? C.dark : C.danger, fontWeight: c.valor > 0 ? 600 : 400 }}>
                          {c.valor > 0 ? brl(c.valor) : "⚠ config."}
                        </span>
                      </td>
                      <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 700, color: C.success }}>{brl(c.recBruta)}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right", color: C.danger }}>{brl(c.custoProf)}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 700, color: margem >= 0 ? C.success : C.danger }}>{brl(margem)}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right" }}>
                        <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: margemPct >= 0.5 ? "#e8f5e9" : margemPct >= 0.3 ? "#fff8e1" : "#ffebee", color: margemPct >= 0.5 ? "#2e7d32" : margemPct >= 0.3 ? "#f57f17" : "#c62828" }}>
                          {pct(margemPct)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: C.beige, fontWeight: 700 }}>
                  <td style={{ padding: "12px 12px" }}>TOTAL</td>
                  <td style={{ padding: "12px 12px", textAlign: "right" }}>{convs.reduce((a,c)=>a+c.fev,0)}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right" }}>{convs.reduce((a,c)=>a+c.mar,0)}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right" }}>{totalSess}</td>
                  <td />
                  <td style={{ padding: "12px 12px", textAlign: "right", color: C.success }}>{brl(totalRec)}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right", color: C.danger }}>{brl(totalCusto)}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right", color: C.success }}>{brl(totalRec - totalCusto)}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right" }}>{pct(totalRec > 0 ? (totalRec-totalCusto)/totalRec : 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Por profissional */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>👥 Sessões e Custo por Profissional</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.beige }}>
                  {["Profissional","Fev","Mar","Total","Receita Gerada","Repasse (%)","Custo Total","Valor Neto"].map((h, i) => (
                    <th key={i} style={{ padding: "10px 12px", textAlign: i === 0 ? "left" : "right", fontSize: 11, fontWeight: 700, color: C.taupe, textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profs.map((p, idx) => {
                  const total = p.fev + p.mar;
                  const neto = p.recBruta - p.custoProf;
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${C.beige}` }}>
                      <td style={{ padding: "12px 12px", fontWeight: 600 }}>{p.nome}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right", color: C.taupe }}>{p.fev}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right", color: C.taupe }}>{p.mar}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 700 }}>{total}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right", color: C.success }}>{brl(p.recBruta)}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right" }}>
                        {p.tipo === "pct" ? <span style={{ padding: "2px 8px", borderRadius: 4, background: "#e3f2fd", color: "#1565c0", fontWeight: 700 }}>{pct(p.valor)}</span>
                        : p.tipo === "fixo" ? <span style={{ padding: "2px 8px", borderRadius: 4, background: "#fff8e1", color: "#f57f17", fontWeight: 700 }}>{brl(p.valor)}/sess</span>
                        : <span style={{ fontSize: 11, color: C.taupe }}>Pró-labore</span>}
                      </td>
                      <td style={{ padding: "12px 12px", textAlign: "right", color: C.danger, fontWeight: 700 }}>{brl(p.custoProf)}</td>
                      <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 700, color: neto >= 0 ? C.success : C.danger }}>{brl(neto)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: C.beige, fontWeight: 700 }}>
                  <td style={{ padding: "12px 12px" }}>TOTAL</td>
                  <td style={{ padding: "12px 12px", textAlign: "right" }}>{profs.reduce((a,p)=>a+p.fev,0)}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right" }}>{profs.reduce((a,p)=>a+p.mar,0)}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right" }}>{profs.reduce((a,p)=>a+p.fev+p.mar,0)}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right", color: C.success }}>{brl(profs.reduce((a,p)=>a+p.recBruta,0))}</td>
                  <td />
                  <td style={{ padding: "12px 12px", textAlign: "right", color: C.danger }}>{brl(profs.reduce((a,p)=>a+p.custoProf,0))}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right", color: C.success }}>{brl(profs.reduce((a,p)=>a+p.recBruta-p.custoProf,0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Fev vs Mar */}
        {meses.length > 1 && (
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📅 Fevereiro vs Março</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              {meses.map((m, i) => (
                <div key={i} style={{ padding: 16, borderRadius: 10, background: C.cream, border: `1px solid ${C.sand}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{m.mes}</div>
                  {[
                    { l: "Sessões", v: m.sessoes.toLocaleString("pt-BR"), color: C.accent },
                    { l: "Receita Bruta", v: brl(m.recBruta), color: C.success },
                    { l: "Custo Profis.", v: brl(m.custoProf), color: C.danger },
                    { l: "Margem", v: brl(m.recBruta - m.custoProf), color: C.success },
                  ].map((k, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: j < 3 ? `1px solid ${C.beige}` : "none" }}>
                      <span style={{ fontSize: 12, color: C.taupe }}>{k.l}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: k.color }}>{k.v}</span>
                    </div>
                  ))}
                </div>
              ))}
              {/* Delta */}
              {meses.length === 2 && (() => {
                const [fev, mar] = meses;
                const dSess = mar.sessoes - fev.sessoes;
                const dRec  = mar.recBruta - fev.recBruta;
                return (
                  <div style={{ padding: 16, borderRadius: 10, background: dRec >= 0 ? "#e8f5e9" : "#ffebee", border: `1px solid ${dRec >= 0 ? "#a5d6a7" : "#ef9a9a"}` }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Variação (Δ)</div>
                    {[
                      { l: "Sessões",      v: (dSess >= 0 ? "+" : "") + dSess,          color: dSess >= 0 ? C.success : C.danger },
                      { l: "Receita",      v: (dRec >= 0 ? "+" : "") + brl(dRec),       color: dRec  >= 0 ? C.success : C.danger },
                      { l: "Custo",        v: (+(mar.custoProf-fev.custoProf) >= 0 ? "+" : "") + brl(mar.custoProf-fev.custoProf), color: C.taupe },
                      { l: "Margem",       v: (+(mar.recBruta-mar.custoProf-fev.recBruta+fev.custoProf) >= 0 ? "+" : "") + brl(mar.recBruta-mar.custoProf-fev.recBruta+fev.custoProf), color: dRec >= 0 ? C.success : C.danger },
                    ].map((k, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: j < 3 ? `1px solid ${C.beige}` : "none" }}>
                        <span style={{ fontSize: 12, color: C.taupe }}>{k.l}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: k.color }}>{k.v}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </Card>
        )}

        {/* Convênios não mapeados */}
        {convs.some(c => c.valor === 0) && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "#fff8e1", border: "1px solid #ffe082", fontSize: 13, color: "#f57f17" }}>
            ⚠️ Alguns convênios não foram encontrados nas configurações (valor = R$0). Abra a aba <strong>⚙ Parâmetros</strong> e adicione-os para ver os valores corretos.
          </div>
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
