// ─── ClinicaPage.jsx — Gestão Operacional da Clínica ───────────────────────
// Integra-se ao Infinity App (Supabase + React)
// Config salva em localStorage; receita real puxada das transactions do Supabase

import { useState, useCallback } from "react";

// ── helpers de formato ────────────────────────────────────────────────────────
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

// ── paleta (mesma do Infinity App) ────────────────────────────────────────────
const C = {
  cream: "var(--cream)",
  beige: "var(--beige)",
  sand: "var(--sand)",
  taupe: "var(--taupe)",
  dark: "var(--dark)",
  accent: "var(--accent)",
  success: "var(--success)",
  danger: "var(--danger)",
  warning: "var(--warning)",
  white: "var(--white)",
};

// ── convênios padrão ──────────────────────────────────────────────────────────
const DEFAULT_CONVENIOS = [
  { id: 1, nome: "Particular",      sigla: "PART", valor: 350, ativo: true },
  { id: 2, nome: "Unimed",          sigla: "UNIM", valor: 180, ativo: true },
  { id: 3, nome: "Hapvida",         sigla: "HAPV", valor: 140, ativo: true },
  { id: 4, nome: "NotreDame",       sigla: "NDME", valor: 155, ativo: true },
  { id: 5, nome: "SulAmérica",      sigla: "SULA", valor: 165, ativo: true },
  { id: 6, nome: "Bradesco Saúde",  sigla: "BRAD", valor: 175, ativo: true },
  { id: 7, nome: "Convênio Empresa",sigla: "EMP",  valor: 200, ativo: false },
  { id: 8, nome: "Outros",          sigla: "OUTR", valor: 150, ativo: false },
];

const DEFAULT_PROFISSIONAIS = [
  { id: 1, nome: "Wessilon Marques",  cargo: "Neuropsicólogo",   contrato: "Sócio",   tipo: "prolabore", valor: 0,    meta: 4, real: 3 },
  { id: 2, nome: "Profissional 2",    cargo: "Psicólogo(a)",     contrato: "CLT/PJ",  tipo: "pct",       valor: 0.40, meta: 4, real: 3 },
  { id: 3, nome: "Profissional 3",    cargo: "Psicólogo(a)",     contrato: "CLT/PJ",  tipo: "pct",       valor: 0.40, meta: 4, real: 2 },
  { id: 4, nome: "Profissional 4",    cargo: "Psicólogo(a)",     contrato: "CLT/PJ",  tipo: "fixo",      valor: 150,  meta: 3, real: 2 },
  { id: 5, nome: "Profissional 5",    cargo: "Neuropsicólogo(a)",contrato: "PJ",      tipo: "pct",       valor: 0.45, meta: 4, real: 3 },
  { id: 6, nome: "Profissional 6",    cargo: "Psicólogo(a)",     contrato: "Estag.",  tipo: "fixo",      valor: 60,   meta: 3, real: 2 },
  { id: 7, nome: "Profissional 7",    cargo: "Psicólogo(a)",     contrato: "CLT/PJ",  tipo: "pct",       valor: 0.40, meta: 3, real: 2 },
  { id: 8, nome: "Profissional 8",    cargo: "Psicólogo(a)",     contrato: "CLT/PJ",  tipo: "pct",       valor: 0.40, meta: 3, real: 2 },
];

const DEFAULT_PARAMS = {
  diasUteis: 22,
  ticketMedio: 180,
  custoFixo: 8000,
  custoVariavel: 25,
  imposto: 0.06,
  glosa: 0.05,
  prolabore: 5000,
};

// ── mini-componentes ──────────────────────────────────────────────────────────
const Tab = ({ label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 18px",
      border: "none",
      borderBottom: `3px solid ${active ? C.accent : "transparent"}`,
      background: "transparent",
      color: active ? C.dark : C.taupe,
      fontFamily: "inherit",
      fontSize: 13,
      fontWeight: active ? 700 : 500,
      cursor: "pointer",
      transition: "all .2s",
      whiteSpace: "nowrap",
      position: "relative",
    }}
  >
    {label}
    {badge != null && (
      <span style={{
        marginLeft: 6, fontSize: 10, fontWeight: 700,
        background: C.accent, color: "white",
        borderRadius: 10, padding: "1px 6px",
      }}>{badge}</span>
    )}
  </button>
);

const Card = ({ children, style: s, delay = 0 }) => (
  <div
    className="card anim-expand"
    style={{ padding: 20, animationDelay: `${delay}s`, ...s }}
  >
    {children}
  </div>
);

const KPICard = ({ label, real, ideal, fmt: fmtFn = brl, color, delay = 0 }) => {
  const diff = ideal - real;
  return (
    <div className="card anim-expand" style={{ padding: 18, animationDelay: `${delay}s` }}>
      <span style={{ fontSize: 10, color: C.taupe, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </span>
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
        <div style={{
          marginTop: 8, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
          background: diff > 0 ? "#e8f5e9" : "#ffebee",
          color: diff > 0 ? "#2e7d32" : "#c62828",
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          {diff > 0 ? "▲" : "▼"} {fmtFn(Math.abs(diff))} potencial
        </div>
      )}
    </div>
  );
};

// ── mini barra horizontal ────────────────────────────────────────────────────
const HBar = ({ value, max, color = C.accent, fmt: fmtFn = brl }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ flex: 1, height: 8, borderRadius: 4, background: C.beige, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%`,
        height: "100%", borderRadius: 4, background: color, transition: "width .6s ease",
      }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 600, color: C.dark, minWidth: 70, textAlign: "right" }}>
      {fmtFn(value)}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function ClinicaPage({ transactions = [], companyId }) {
  // ── estado de aba interna ───────────────────────────────────────────────────
  const [tab, setTab] = useState("dashboard");

  // ── configurações persistidas em localStorage ──────────────────────────────
  const lsKey = `clinica_cfg_${companyId || "default"}`;

  const loadCfg = () => {
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  };

  const [convenios, setConvenios] = useState(() => loadCfg()?.convenios || DEFAULT_CONVENIOS);
  const [profissionais, setProfissionais] = useState(() => loadCfg()?.profissionais || DEFAULT_PROFISSIONAIS);
  const [params, setParams] = useState(() => loadCfg()?.params || DEFAULT_PARAMS);
  const [saved, setSaved] = useState(false);


  const saveCfg = useCallback(() => {
    localStorage.setItem(lsKey, JSON.stringify({ convenios, profissionais, params }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [convenios, profissionais, params, lsKey]);

  // ── cálculos ────────────────────────────────────────────────────────────────
  // Ticket médio ponderado (pode ser configurado manualmente ou calculado)
  const ticket = params.ticketMedio;
  const dias = params.diasUteis;

  // Sessões reais e ideais (soma dos profissionais)
  const totalSessoesRealDia  = profissionais.reduce((a, p) => a + (p.real || 0), 0);
  const totalSessoesIdealDia = profissionais.reduce((a, p) => a + (p.meta || 0), 0);
  const totalSessoesRealMes  = totalSessoesRealDia * dias;
  const totalSessoesIdealMes = totalSessoesIdealDia * dias;

  // Receita bruta
  const recBrutaReal  = totalSessoesRealMes * ticket;
  const recBrutaIdeal = totalSessoesIdealMes * ticket;

  // Glosa
  const glosaReal  = recBrutaReal * params.glosa;
  const glosaIdeal = recBrutaIdeal * params.glosa;

  // Receita líquida (pós-glosa)
  const recLiqReal  = recBrutaReal - glosaReal;
  const recLiqIdeal = recBrutaIdeal - glosaIdeal;

  // Impostos
  const impReal  = recBrutaReal * params.imposto;
  const impIdeal = recBrutaIdeal * params.imposto;

  // Receita pós-impostos
  const recPosImpReal  = recLiqReal - impReal;
  const recPosImpIdeal = recLiqIdeal - impIdeal;

  // Custo variável total
  const cvReal  = totalSessoesRealMes * params.custoVariavel;
  const cvIdeal = totalSessoesIdealMes * params.custoVariavel;

  // Remuneração profissionais
  // IMPORTANTE: p.valor para tipo "pct" é DECIMAL (0.40 = 40%)
  const calcRemunProf = (sessoesDiaProp) =>
    profissionais.reduce((total, p) => {
      const sessMes = (p[sessoesDiaProp] || 0) * dias;
      const recProf = sessMes * ticket;
      if (p.tipo === "pct")   return total + recProf * Math.min(p.valor, 1); // cap at 100%
      if (p.tipo === "fixo")  return total + sessMes * p.valor;
      return total; // prolabore: descontado separado
    }, 0);

  const remunReal  = calcRemunProf("real");
  const remunIdeal = calcRemunProf("meta");

  // Custo médio de remuneração por sessão (para breakeven)
  const remunPorSessaoReal = totalSessoesRealMes > 0 ? remunReal / totalSessoesRealMes : 0;

  // EBITDA
  const ebitdaReal  = recPosImpReal - params.custoFixo - cvReal - remunReal;
  const ebitdaIdeal = recPosImpIdeal - params.custoFixo - cvIdeal - remunIdeal;

  // Lucro líquido
  const lucroReal  = ebitdaReal - params.prolabore;
  const lucroIdeal = ebitdaIdeal - params.prolabore;

  // Margem
  const margemReal  = recBrutaReal  > 0 ? lucroReal  / recBrutaReal  : 0;
  const margemIdeal = recBrutaIdeal > 0 ? lucroIdeal / recBrutaIdeal : 0;

  // ROI = Lucro / Custos Totais
  const custosReais = params.custoFixo + cvReal + remunReal + params.prolabore + impReal + glosaReal;
  const custosIdeais = params.custoFixo + cvIdeal + remunIdeal + params.prolabore + impIdeal + glosaIdeal;
  const roiReal  = custosReais  > 0 ? lucroReal  / custosReais  : 0;
  const roiIdeal = custosIdeais > 0 ? lucroIdeal / custosIdeais : 0;

  // Breakeven: sessões necessárias para cobrir custos fixos + pró-labore
  // Margem de contribuição por sessão = receita por sessão - custos variáveis por sessão
  const custosTotaisFixos = params.custoFixo + params.prolabore;
  const receitaPorSessao = ticket * (1 - params.glosa) * (1 - params.imposto);
  const custoVarPorSessao = params.custoVariavel + remunPorSessaoReal;
  const margemContribuicaoPorSessao = receitaPorSessao - custoVarPorSessao;
  const sessoesBreakeven = margemContribuicaoPorSessao > 0
    ? Math.ceil(custosTotaisFixos / margemContribuicaoPorSessao)
    : 0;
  const sessoesBreakevenDia = dias > 0 ? (sessoesBreakeven / dias).toFixed(1) : 0;

  // Receita real do Supabase (categorias de convênio/consulta)
  const receitaSupabase = transactions
    .filter(t =>
      t.type === "entrada" &&
      (t.status === "recebido" || t.status === "pago") &&
      (
        (t.category || "").toLowerCase().includes("convênio") ||
        (t.category || "").toLowerCase().includes("consulta") ||
        (t.category || "").toLowerCase().includes("pacote") ||
        (t.category || "").toLowerCase().includes("procedimento")
      )
    )
    .reduce((a, t) => a + Number(t.actual_value || t.value || 0), 0);

  const temDadosSupa = receitaSupabase > 0;

  // ── renderizações de abas ───────────────────────────────────────────────────

  // ── ABA DASHBOARD ──────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Alerta se há dados reais do Supabase */}
      {temDadosSupa && (
        <div style={{
          padding: "12px 16px", borderRadius: 10,
          background: "#e8f5e9", border: "1px solid #a5d6a7",
          fontSize: 13, color: "#2e7d32", display: "flex", gap: 10, alignItems: "center",
        }}>
          <span style={{ fontSize: 18 }}>🔗</span>
          <span>
            <strong>Dados do Supabase detectados.</strong> Receita de convênios/consultas confirmadas: <strong>{brl(receitaSupabase)}</strong>
          </span>
        </div>
      )}

      {/* KPIs principais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <KPICard label="Receita Bruta / Mês"  real={recBrutaReal}  ideal={recBrutaIdeal}  delay={0}    />
        <KPICard label="EBITDA Mensal"         real={ebitdaReal}    ideal={ebitdaIdeal}    delay={0.06} color={ebitdaReal >= 0 ? C.success : C.danger} />
        <KPICard label="Lucro Líquido"         real={lucroReal}     ideal={lucroIdeal}     delay={0.12} color={lucroReal >= 0 ? C.success : C.danger} />
        <KPICard label="ROI Mensal"            real={roiReal}       ideal={roiIdeal}       delay={0.18} fmt={pct} />
        <KPICard label="Sessões / Mês"         real={totalSessoesRealMes}  ideal={totalSessoesIdealMes}  delay={0.24} fmt={(v) => v.toFixed(0)} />
        <KPICard label="Margem Líquida"        real={margemReal}    ideal={margemIdeal}    delay={0.30} fmt={pct} />
      </div>

      {/* Semáforo de ocupação */}
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Ocupação por Profissional</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {profissionais.map((p) => {
            const ocup = p.meta > 0 ? p.real / p.meta : 0;
            const cor = ocup >= 0.8 ? C.success : ocup >= 0.6 ? C.warning : C.danger;
            const status = ocup >= 0.8 ? "✅" : ocup >= 0.6 ? "⚠️" : "🔴";
            return (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "200px 1fr 50px 60px", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: C.taupe }}>{p.cargo}</div>
                </div>
                <HBar value={p.real} max={p.meta} color={cor} fmt={(v) => `${v}/${p.meta} sess.`} />
                <span style={{ fontSize: 12, fontWeight: 700, color: cor }}>{pct(ocup)}</span>
                <span style={{ fontSize: 14 }}>{status}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Breakeven */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid var(--warning)" }}>
          <div style={{ fontSize: 11, color: C.taupe, fontWeight: 600, textTransform: "uppercase" }}>Breakeven (sessões/mês)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.dark, marginTop: 6 }}>{sessoesBreakeven}</div>
          <div style={{ fontSize: 12, color: C.taupe, marginTop: 4 }}>≈ {sessoesBreakevenDia} sessões/dia</div>
        </Card>
        <Card style={{ borderLeft: "4px solid var(--accent)" }}>
          <div style={{ fontSize: 11, color: C.taupe, fontWeight: 600, textTransform: "uppercase" }}>Sessões/Dia (Real)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.dark, marginTop: 6 }}>{totalSessoesRealDia}</div>
          <div style={{ fontSize: 12, color: C.taupe, marginTop: 4 }}>Meta: {totalSessoesIdealDia}/dia</div>
        </Card>
        <Card style={{ borderLeft: "4px solid var(--success)" }}>
          <div style={{ fontSize: 11, color: C.taupe, fontWeight: 600, textTransform: "uppercase" }}>Receita Adicional Disponível</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.success, marginTop: 6 }}>{brl(recBrutaIdeal - recBrutaReal)}</div>
          <div style={{ fontSize: 12, color: C.taupe, marginTop: 4 }}>{totalSessoesIdealMes - totalSessoesRealMes} sessões a mais/mês</div>
        </Card>
        <Card style={{ borderLeft: "4px solid var(--accent)" }}>
          <div style={{ fontSize: 11, color: C.taupe, fontWeight: 600, textTransform: "uppercase" }}>Ganho por Sessão Extra</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.accent, marginTop: 6 }}>
            {brl(totalSessoesIdealMes > totalSessoesRealMes
              ? (lucroIdeal - lucroReal) / (totalSessoesIdealMes - totalSessoesRealMes)
              : 0)}
          </div>
          <div style={{ fontSize: 12, color: C.taupe, marginTop: 4 }}>margem incremental</div>
        </Card>
      </div>

      {/* DRE resumida */}
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>DRE Resumida — Real vs Ideal</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.beige }}>
                {["Linha", "Real (R$)", "Ideal (R$)", "Gap (R$)"].map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 12px", textAlign: i === 0 ? "left" : "right",
                    fontSize: 11, fontWeight: 700, color: C.taupe,
                    textTransform: "uppercase", letterSpacing: 0.3,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "(+) Receita Bruta",          r: recBrutaReal,   i: recBrutaIdeal,   bold: false },
                { label: "  (-) Glosa/Inadimplência",  r: -glosaReal,     i: -glosaIdeal,     bold: false },
                { label: "  (-) Impostos",             r: -impReal,       i: -impIdeal,       bold: false },
                { label: "(=) Rec. Pós-impostos",      r: recPosImpReal,  i: recPosImpIdeal,  bold: true  },
                { label: "  (-) Custo Fixo",           r: -params.custoFixo, i: -params.custoFixo, bold: false },
                { label: "  (-) Custos Variáveis",     r: -cvReal,        i: -cvIdeal,        bold: false },
                { label: "  (-) Remuneração Profs.",   r: -remunReal,     i: -remunIdeal,     bold: false },
                { label: "(=) EBITDA",                 r: ebitdaReal,     i: ebitdaIdeal,     bold: true  },
                { label: "  (-) Pró-labore",           r: -params.prolabore, i: -params.prolabore, bold: false },
                { label: "(=) LUCRO LÍQUIDO",          r: lucroReal,      i: lucroIdeal,      bold: true, highlight: true },
              ].map(({ label, r, i, bold, highlight }, idx) => (
                <tr key={idx} style={{ background: highlight ? "#f0fdf4" : idx % 2 === 0 ? C.cream : "transparent" }}>
                  <td style={{ padding: "10px 12px", fontWeight: bold ? 700 : 400, color: C.dark }}>{label}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: bold ? 700 : 400, color: r >= 0 ? C.dark : C.danger }}>{brl(r)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: bold ? 700 : 400, color: i >= 0 ? C.success : C.danger }}>{brl(i)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, color: (i - r) > 0 ? C.success : (i - r) < 0 ? C.danger : C.taupe }}>
                    {(i - r) !== 0 ? brl(i - r) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ── ABA CONVÊNIOS ──────────────────────────────────────────────────────────
  const renderConvenios = () => {
    const ativos = convenios.filter(c => c.ativo);
    const maxVal = Math.max(...ativos.map(c => c.valor));
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
                  {["#", "Convênio", "Sigla", "Valor/Sessão", "Referência", "Ativo"].map((h, i) => (
                    <th key={i} style={{
                      padding: "10px 12px", textAlign: i >= 3 ? "right" : "left",
                      fontSize: 11, fontWeight: 700, color: C.taupe,
                      textTransform: "uppercase", letterSpacing: 0.3,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {convenios.map((c, idx) => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.beige}`, opacity: c.ativo ? 1 : 0.5 }}>
                    <td style={{ padding: "10px 12px", color: C.taupe, fontSize: 12 }}>{c.id}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                      <input
                        style={{
                          border: "none", background: "transparent", fontFamily: "inherit",
                          fontSize: 13, fontWeight: 600, color: C.dark, width: "100%",
                          outline: "none", cursor: "text",
                          borderBottom: "1.5px dashed transparent",
                        }}
                        value={c.nome}
                        onChange={e => {
                          const updated = [...convenios];
                          updated[idx] = { ...updated[idx], nome: e.target.value };
                          setConvenios(updated);
                        }}
                        onFocus={e => e.target.style.borderBottomColor = C.accent}
                        onBlur={e => { e.target.style.borderBottomColor = "transparent"; saveCfg(); }}
                      />
                    </td>
                    <td style={{ padding: "10px 12px", color: C.taupe, fontSize: 11, fontFamily: "monospace" }}>
                      <input
                        style={{
                          border: "none", background: "transparent", fontFamily: "monospace",
                          fontSize: 11, color: C.taupe, width: 50, outline: "none",
                          borderBottom: "1.5px dashed transparent",
                        }}
                        value={c.sigla}
                        onChange={e => {
                          const updated = [...convenios];
                          updated[idx] = { ...updated[idx], sigla: e.target.value.toUpperCase().slice(0, 6) };
                          setConvenios(updated);
                        }}
                        onFocus={e => e.target.style.borderBottomColor = C.accent}
                        onBlur={e => { e.target.style.borderBottomColor = "transparent"; saveCfg(); }}
                      />
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <div style={{ flex: 1, maxWidth: 80 }}>
                          <HBar value={c.valor} max={maxVal} color={C.accent} fmt={() => ""} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 12, color: C.taupe }}>R$</span>
                          <input
                            type="number"
                            style={{
                              width: 72, border: "none", background: C.cream, fontFamily: "inherit",
                              fontSize: 14, fontWeight: 700, color: C.dark, textAlign: "right",
                              borderRadius: 6, padding: "4px 6px", outline: "none",
                              border: `1.5px solid transparent`,
                            }}
                            value={c.valor}
                            onChange={e => {
                              const updated = [...convenios];
                              updated[idx] = { ...updated[idx], valor: parseFloat(e.target.value) || 0 };
                              setConvenios(updated);
                            }}
                            onFocus={e => e.target.style.border = `1.5px solid ${C.accent}`}
                            onBlur={e => { e.target.style.border = "1.5px solid transparent"; saveCfg(); }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, color: C.taupe }}>
                      {c.valor >= 300 ? "🟢 Premium" : c.valor >= 180 ? "🟡 Médio" : "🔴 Básico"}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <div
                        onClick={() => { const u = [...convenios]; u[idx] = { ...u[idx], ativo: !u[idx].ativo }; setConvenios(u); saveCfg(); }}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 36, height: 20, borderRadius: 10, cursor: "pointer", transition: "all .2s",
                          background: c.ativo ? C.success : C.sand,
                        }}
                      >
                        <div style={{
                          width: 14, height: 14, borderRadius: "50%", background: "white",
                          transform: `translateX(${c.ativo ? 8 : -8}px)`, transition: "transform .2s",
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Ranking de rentabilidade */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Ranking de Rentabilidade</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...ativos].sort((a, b) => b.valor - a.valor).map((c, idx) => {
              const margem = (c.valor * (1 - params.glosa) * (1 - params.imposto) - params.custoVariavel);
              return (
                <div key={c.id} style={{ display: "grid", gridTemplateColumns: "24px 1fr 80px 80px", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.taupe }}>#{idx + 1}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nome}</div>
                    <HBar value={c.valor} max={maxVal} color={
                      idx === 0 ? C.success : idx === ativos.length - 1 ? C.danger : C.accent
                    } fmt={() => ""} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, textAlign: "right" }}>{brl(c.valor)}</span>
                  <span style={{ fontSize: 12, color: C.taupe, textAlign: "right" }}>marg: {brl(margem)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  // ── ABA PROFISSIONAIS ──────────────────────────────────────────────────────
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
                {["Profissional","Cargo","Contrato","Tipo Pag.","Valor","Sess./Dia Meta","Sess./Dia Real","Custo/Sessão","Custo/Mês"].map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 10px", textAlign: i >= 4 ? "right" : "left",
                    fontSize: 10, fontWeight: 700, color: C.taupe,
                    textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profissionais.map((p, idx) => {
                const sessMesReal = (p.real || 0) * dias;
                const recProf = sessMesReal * ticket;
                const pctVal = Math.min(p.valor, 1); // guard: cap at 100%
                const custoSessao = p.tipo === "pct" ? ticket * pctVal
                  : p.tipo === "fixo" ? p.valor : 0;
                const custoMes = p.tipo === "pct" ? recProf * pctVal
                  : p.tipo === "fixo" ? sessMesReal * p.valor : params.prolabore;

                const editCell = (field, value, type = "text") => (
                  <input
                    type={type}
                    style={{
                      width: type === "number" ? 60 : "100%",
                      border: "none", background: "transparent", fontFamily: "inherit",
                      fontSize: 13, color: C.dark, outline: "none",
                      borderBottom: "1.5px dashed transparent", textAlign: type === "number" ? "right" : "left",
                    }}
                    value={value}
                    step={field === "valor" && p.tipo === "pct" ? "0.01" : "1"}
                    min={0}
                    onChange={e => {
                      const updated = [...profissionais];
                      updated[idx] = {
                        ...updated[idx],
                        [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
                      };
                      setProfissionais(updated);
                    }}
                    onFocus={e => e.target.style.borderBottomColor = C.accent}
                    onBlur={e => { e.target.style.borderBottomColor = "transparent"; saveCfg(); }}
                  />
                );

                const ocup = p.meta > 0 ? p.real / p.meta : 0;
                const corOcup = ocup >= 0.8 ? C.success : ocup >= 0.6 ? C.warning : C.danger;

                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${C.beige}` }}>
                    <td style={{ padding: "10px 10px", fontWeight: 600, minWidth: 140 }}>{editCell("nome", p.nome)}</td>
                    <td style={{ padding: "10px 10px", color: C.taupe, minWidth: 120 }}>{editCell("cargo", p.cargo)}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <select
                        value={p.contrato}
                        style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: C.dark, cursor: "pointer" }}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], contrato: e.target.value }; setProfissionais(u); saveCfg(); }}
                      >
                        {["Sócio","CLT","PJ","CLT/PJ","Estag."].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <select
                        value={p.tipo}
                        style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: C.dark, cursor: "pointer" }}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], tipo: e.target.value, valor: 0 }; setProfissionais(u); saveCfg(); }}
                      >
                        <option value="pct">% Repasse</option>
                        <option value="fixo">R$ Fixo/Sessão</option>
                        <option value="prolabore">Pró-labore</option>
                      </select>
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      {p.tipo !== "prolabore" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                          {p.tipo === "pct" ? (
                            <>
                              <input
                                type="number"
                                style={{
                                  width: 60, border: "none", background: "transparent", fontFamily: "inherit",
                                  fontSize: 13, color: C.dark, outline: "none",
                                  borderBottom: "1.5px dashed transparent", textAlign: "right",
                                }}
                                value={Math.round(p.valor * 100)}
                                step="1" min="0" max="100"
                                onChange={e => {
                                  const pctVal = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                  const u = [...profissionais];
                                  u[idx] = { ...u[idx], valor: pctVal / 100 };
                                  setProfissionais(u);
                                }}
                                onFocus={e => e.target.style.borderBottomColor = C.accent}
                                onBlur={e => { e.target.style.borderBottomColor = "transparent"; saveCfg(); }}
                              />
                              <span style={{ color: C.taupe }}>%</span>
                            </>
                          ) : (
                            <>{editCell("valor", p.valor, "number")}<span style={{ color: C.taupe, fontSize: 11 }}>R$</span></>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: C.taupe }}>ver parâmetros</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      <input
                        type="number" min={0} max={12} step={1}
                        value={p.meta}
                        style={{
                          width: 40, border: "none", background: C.cream, fontFamily: "inherit",
                          fontSize: 13, fontWeight: 600, color: C.dark, textAlign: "center",
                          borderRadius: 6, padding: "3px 4px", outline: "none",
                        }}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], meta: parseInt(e.target.value) || 0 }; setProfissionais(u); }}
                        onBlur={saveCfg}
                      />
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      <input
                        type="number" min={0} max={12} step={1}
                        value={p.real}
                        style={{
                          width: 40, border: "none",
                          background: ocup >= 0.8 ? "#e8f5e9" : ocup >= 0.6 ? "#fff8e1" : "#ffebee",
                          fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: corOcup, textAlign: "center",
                          borderRadius: 6, padding: "3px 4px", outline: "none",
                        }}
                        onChange={e => { const u = [...profissionais]; u[idx] = { ...u[idx], real: parseInt(e.target.value) || 0 }; setProfissionais(u); }}
                        onBlur={saveCfg}
                      />
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontSize: 12, color: C.taupe }}>{brl(custoSessao)}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: C.danger }}>{brl(custoMes)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: C.beige, fontWeight: 700 }}>
                <td colSpan={5} style={{ padding: "10px 10px", fontSize: 13 }}>TOTAL</td>
                <td style={{ padding: "10px 10px", textAlign: "right" }}>{totalSessoesIdealDia}/dia</td>
                <td style={{ padding: "10px 10px", textAlign: "right" }}>{totalSessoesRealDia}/dia</td>
                <td />
                <td style={{ padding: "10px 10px", textAlign: "right", color: C.danger }}>{brl(remunReal + params.prolabore)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );

  // ── ABA ROI ───────────────────────────────────────────────────────────────
  const renderROI = () => {
    const rows = [
      { label: "Receita Bruta",              r: recBrutaReal,   i: recBrutaIdeal,   pctR: 1,          pctI: 1       },
      { label: "Glosa / Inadimplência",      r: glosaReal,      i: glosaIdeal,      pctR: params.glosa,   pctI: params.glosa   },
      { label: "Impostos",                   r: impReal,        i: impIdeal,        pctR: params.imposto, pctI: params.imposto },
      { label: "Custos Fixos",               r: params.custoFixo, i: params.custoFixo, pctR: recBrutaReal > 0 ? params.custoFixo/recBrutaReal : 0, pctI: recBrutaIdeal > 0 ? params.custoFixo/recBrutaIdeal : 0 },
      { label: "Custos Variáveis",           r: cvReal,         i: cvIdeal,         pctR: recBrutaReal > 0 ? cvReal/recBrutaReal : 0, pctI: recBrutaIdeal > 0 ? cvIdeal/recBrutaIdeal : 0 },
      { label: "Remuneração Profissionais",  r: remunReal,      i: remunIdeal,      pctR: recBrutaReal > 0 ? remunReal/recBrutaReal : 0, pctI: recBrutaIdeal > 0 ? remunIdeal/recBrutaIdeal : 0 },
      { label: "Pró-labore",                 r: params.prolabore, i: params.prolabore, pctR: recBrutaReal > 0 ? params.prolabore/recBrutaReal : 0, pctI: recBrutaIdeal > 0 ? params.prolabore/recBrutaIdeal : 0 },
      { label: "LUCRO LÍQUIDO",              r: lucroReal,      i: lucroIdeal,      bold: true,       pctR: margemReal, pctI: margemIdeal },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Waterfall-style ROI */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Decomposição do ROI</h3>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {/* Real */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.taupe, textTransform: "uppercase", marginBottom: 12 }}>Cenário Real</div>
              {rows.map(({ label, r, pctR, bold }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 140, fontSize: 12, fontWeight: bold ? 700 : 400 }}>{label}</div>
                  <div style={{ flex: 1 }}>
                    <HBar
                      value={Math.abs(r)}
                      max={recBrutaReal}
                      color={bold ? (r >= 0 ? C.success : C.danger) : r >= 0 ? C.accent : C.danger}
                      fmt={() => ""}
                    />
                  </div>
                  <div style={{ width: 70, textAlign: "right", fontSize: 12, fontWeight: bold ? 700 : 400 }}>{pct(pctR)}</div>
                </div>
              ))}
              <div style={{
                marginTop: 14, padding: "12px 16px", borderRadius: 10,
                background: roiReal >= 0 ? "#e8f5e9" : "#ffebee",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>ROI Mensal</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: roiReal >= 0 ? C.success : C.danger }}>{pct(roiReal)}</span>
              </div>
            </div>
            {/* Ideal */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.success, textTransform: "uppercase", marginBottom: 12 }}>Cenário Ideal</div>
              {rows.map(({ label, i: iv, pctI, bold }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 140, fontSize: 12, fontWeight: bold ? 700 : 400 }}>{label}</div>
                  <div style={{ flex: 1 }}>
                    <HBar
                      value={Math.abs(iv)}
                      max={recBrutaIdeal}
                      color={bold ? (iv >= 0 ? C.success : C.danger) : iv >= 0 ? C.success : C.danger}
                      fmt={() => ""}
                    />
                  </div>
                  <div style={{ width: 70, textAlign: "right", fontSize: 12, fontWeight: bold ? 700 : 400 }}>{pct(pctI)}</div>
                </div>
              ))}
              <div style={{
                marginTop: 14, padding: "12px 16px", borderRadius: 10,
                background: roiIdeal >= 0 ? "#e8f5e9" : "#ffebee",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>ROI Mensal</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: roiIdeal >= 0 ? C.success : C.danger }}>{pct(roiIdeal)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recomendações */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📋 Recomendações</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              lucroReal < 0 && { tipo: "danger",  msg: `Operação no prejuízo (${brl(lucroReal)}). Prioridade: aumentar sessões ou reduzir custos fixos.` },
              totalSessoesRealDia < sessoesBreakevenDia && { tipo: "warning", msg: `Abaixo do breakeven (${sessoesBreakevenDia} sess/dia). Atual: ${totalSessoesRealDia} sess/dia.` },
              roiReal < 0.10 && roiReal >= 0 && { tipo: "warning", msg: `ROI abaixo de 10% (${pct(roiReal)}). Considere revisar o mix de convênios.` },
              (totalSessoesIdealMes - totalSessoesRealMes) > 10 && { tipo: "success", msg: `Potencial de +${totalSessoesIdealMes - totalSessoesRealMes} sessões/mês = +${brl(recBrutaIdeal - recBrutaReal)} em receita.` },
              params.glosa > 0.07 && { tipo: "warning", msg: `Taxa de glosa elevada (${pct(params.glosa)}). Revise o faturamento com convênios.` },
              convenios.filter(c => c.ativo && c.valor < 150).length > 0 && { tipo: "warning", msg: `${convenios.filter(c => c.ativo && c.valor < 150).length} convênio(s) com valor abaixo de R$150. Considere reajuste ou descredenciamento.` },
              roiReal >= 0.20 && { tipo: "success", msg: `ROI saudável (${pct(roiReal)}). Modelo operacional está funcionando bem.` },
            ].filter(Boolean).map((r, i) => r && (
              <div key={i} style={{
                padding: "10px 14px", borderRadius: 8, fontSize: 13,
                background: r.tipo === "danger" ? "#ffebee" : r.tipo === "warning" ? "#fff8e1" : "#e8f5e9",
                color: r.tipo === "danger" ? "#c62828" : r.tipo === "warning" ? "#f57f17" : "#2e7d32",
                borderLeft: `4px solid ${r.tipo === "danger" ? "#ef9a9a" : r.tipo === "warning" ? "#ffd54f" : "#a5d6a7"}`,
              }}>
                {r.msg}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // ── ABA PARÂMETROS ─────────────────────────────────────────────────────────
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
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Parâmetros Gerais</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {fields.map(({ key, label, tipo, prefix, suffix }) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <label style={{ fontSize: 13, color: C.dark, flex: 1 }}>{label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {prefix && <span style={{ fontSize: 12, color: C.taupe }}>{prefix}</span>}
                  <input
                    type="number"
                    style={{
                      width: 90, border: `1.5px solid ${C.sand}`, borderRadius: 8,
                      padding: "8px 10px", fontFamily: "inherit", fontSize: 14,
                      fontWeight: 700, color: C.accent, textAlign: "right",
                      background: C.cream, outline: "none",
                    }}
                    value={tipo === "pct" ? (params[key] * 100).toFixed(1) : params[key]}
                    step={tipo === "pct" ? "0.1" : "1"}
                    min={0}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setParams(prev => ({ ...prev, [key]: tipo === "pct" ? v / 100 : v }));
                    }}
                    onBlur={saveCfg}
                    onFocus={e => e.target.style.borderColor = C.accent}
                  />
                  {suffix && <span style={{ fontSize: 12, color: C.taupe }}>{suffix}</span>}
                  {tipo === "pct" && <span style={{ fontSize: 12, color: C.taupe }}>%</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Resumo dos Parâmetros</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { l: "Margem por sessão (antes custo fixo)", v: brl(ticket * (1 - params.glosa) * (1 - params.imposto) - params.custoVariavel) },
              { l: "Custo fixo por sessão (breakeven)", v: brl(custosTotaisFixos / Math.max(1, sessoesBreakeven)) },
              { l: "Receita necessária (breakeven/mês)", v: brl(sessoesBreakeven * ticket) },
              { l: "Horas/dia disponíveis (50min/sessão)", v: `${((totalSessoesIdealDia * 50) / 60).toFixed(1)}h` },
            ].map(({ l, v }, i) => (
              <div key={i} style={{ background: C.cream, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, color: C.taupe, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={saveCfg}
            style={{
              flex: 1, padding: "12px", borderRadius: 8, border: "none",
              background: C.accent, color: "white", fontFamily: "inherit",
              fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .2s",
            }}
          >
            {saved ? "✓ Salvo!" : "Salvar Configurações"}
          </button>
          <button
            onClick={() => {
              if (!confirm("Restaurar configurações padrão?")) return;
              setConvenios(DEFAULT_CONVENIOS);
              setProfissionais(DEFAULT_PROFISSIONAIS);
              setParams(DEFAULT_PARAMS);
              localStorage.removeItem(lsKey);
            }}
            style={{
              padding: "12px 20px", borderRadius: 8,
              border: `1.5px solid ${C.sand}`, background: "transparent",
              color: C.taupe, fontFamily: "inherit", fontSize: 14, cursor: "pointer",
            }}
          >
            Resetar
          </button>
        </div>
      </div>
    );
  };

  // ── render principal ───────────────────────────────────────────────────────
  const TABS = [
    { id: "dashboard",     label: "📊 Dashboard"      },
    { id: "convenios",     label: "🏥 Convênios"       },
    { id: "profissionais", label: "👥 Profissionais"   },
    { id: "roi",           label: "📈 ROI & Análise"   },
    { id: "parametros",    label: "⚙ Parâmetros"      },
  ];

  const renderTab = () => {
    switch (tab) {
      case "dashboard":     return renderDashboard();
      case "convenios":     return renderConvenios();
      case "profissionais": return renderProfissionais();
      case "roi":           return renderROI();
      case "parametros":    return renderParametros();
      default:              return renderDashboard();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header da página */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
            Gestão Operacional da Clínica
          </h2>
          <p style={{ color: C.taupe, fontSize: 13, marginTop: 2 }}>
            Sessões · Convênios · Remuneração · ROI · Real vs Ideal
          </p>
        </div>
        {saved && (
          <div style={{
            padding: "6px 14px", borderRadius: 20, background: "#e8f5e9",
            color: "#2e7d32", fontSize: 12, fontWeight: 600,
          }}>
            ✓ Configurações salvas
          </div>
        )}
      </div>

      {/* Sub-abas */}
      <div style={{
        display: "flex", overflowX: "auto", borderBottom: `1px solid ${C.beige}`,
        marginBottom: 20, gap: 0,
        scrollbarWidth: "none",
      }}>
        {TABS.map(t => (
          <Tab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />
        ))}
      </div>

      {/* Conteúdo */}
      <div key={tab} className="anim-fade">
        {renderTab()}
      </div>
    </div>
  );
}
