// Dashboard widgets — reflete os 5 pilares obrigatórios:
// • Contas (previsto vs realizado) separadas de Compras (caixa efetivo)
// • Filtro por mês/período (recebido via prop `filter`)
// • Saldo anterior do mês anterior sempre presente

const DEFAULT_FILTER = () => {
  // Usa o último mês com dados (compras + contas) — garante que os widgets não fiquem vazios.
  const avail = window.availableMonths();
  if (avail && avail.length) {
    // Prefer o mês atual (now) se houver dados, senão o último disponível
    const now = new Date();
    const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return { mode: 'month', month: avail.includes(cur) ? cur : avail[avail.length - 1] };
  }
  const now = new Date();
  return { mode: 'month', month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` };
};

// Hook: computa dados a partir do filtro global (mês ou período)
function useWidgetData(filter) {
  return React.useMemo(() => {
    filter = filter || DEFAULT_FILTER();
    const f = filter.mode === 'month'
      ? { month: filter.month }
      : { from: filter.from, to: filter.to };

    const compras = window.filterCompras(f);
    const contas = window.filterContas(f);
    const agg = window.monthlyAggregates();

    // Caixa (compras efetivas)
    const totalIn = compras.filter(c => c.type === 'entrada').reduce((s, c) => s + c.amount, 0);
    const totalOut = compras.filter(c => c.type === 'saida').reduce((s, c) => s + c.amount, 0);
    const saldoMes = totalIn - totalOut;

    // Contas previstas vs realizadas
    const prev_in = contas.filter(c => c.tipo === 'receber').reduce((s, c) => s + c.previsto, 0);
    const real_in = contas.filter(c => c.tipo === 'receber').reduce((s, c) => s + c.realizado, 0);
    const prev_out = contas.filter(c => c.tipo === 'pagar').reduce((s, c) => s + c.previsto, 0);
    const real_out = contas.filter(c => c.tipo === 'pagar').reduce((s, c) => s + c.realizado, 0);

    // Saldo anterior (mês anterior ao início da janela)
    const anchor = filter.mode === 'month' ? filter.month : (filter.from || '').slice(0, 7);
    const saldoAnt = anchor ? window.saldoAnterior(anchor) : 0;
    const saldoAcumulado = saldoAnt + saldoMes;

    // Comparativo mês anterior (caixa)
    const prevMonthKey = (() => {
      if (!anchor) return null;
      const [y, m] = anchor.split('-').map(Number);
      const d = new Date(y, m - 2, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();
    const prevAggMonth = agg.find(a => a.key === prevMonthKey);
    const prevIn = prevAggMonth?.compras.in || 0;
    const prevOut = prevAggMonth?.compras.out || 0;
    const prevSaldo = prevIn - prevOut;

    const saldoTrend = prevSaldo !== 0 ? ((saldoMes - prevSaldo) / Math.abs(prevSaldo)) * 100 : 0;
    const inTrend = prevIn ? ((totalIn - prevIn) / prevIn) * 100 : 0;
    const outTrend = prevOut ? ((totalOut - prevOut) / prevOut) * 100 : 0;

    // Série de fluxo (últimos 8 meses — independente do filtro, p/ contexto)
    const last8 = agg.slice(-8);
    let running = 0;
    const flow = last8.map(m => {
      running += (m.compras.in - m.compras.out);
      return { label: m.label, in: m.compras.in, out: m.compras.out, balance: running };
    });
    const sparkVals = last8.map(m => m.compras.in - m.compras.out);

    // Ranking de receita por categoria (dentro do filtro)
    const revByCat = new Map();
    compras.filter(c => c.type === 'entrada').forEach(t => {
      if (!revByCat.has(t.category)) revByCat.set(t.category, { label: t.category, value: 0, color: t.color });
      revByCat.get(t.category).value += t.amount;
    });
    const revRanking = [...revByCat.values()].sort((a, b) => b.value - a.value);

    // Últimas compras (dentro do filtro)
    const recentTxs = [...compras].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

    // Contas pendentes próximas (não pagas, ordenadas por vencimento)
    const pendentes = contas.filter(c => !c.pago).sort((a, b) => a.vencimento.localeCompare(b.vencimento)).slice(0, 6);

    return {
      filter, compras, contas,
      totalIn, totalOut, saldoMes, saldoAnt, saldoAcumulado,
      prev_in, real_in, prev_out, real_out,
      saldoTrend, inTrend, outTrend,
      flow, sparkVals, revRanking, recentTxs, pendentes,
    };
  }, [filter]);
}

// ─── Saldo + saldo anterior + compras do período ───
const SummaryWidget = ({ data }) => {
  return (
    <TiltCard glowColor="var(--c-primary)" padding={0} style={{ overflow: 'hidden' }}>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Saldo anterior banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: 12,
          background: 'color-mix(in oklch, var(--c-secondary) 8%, transparent)',
          border: '1px dashed color-mix(in oklch, var(--c-secondary) 40%, transparent)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, color: 'var(--c-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <Icon name="arrow_right" size={12} stroke={2.4} /> Saldo anterior
          </span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
            {window.fmt(data.saldoAnt)}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Saldo acumulado
            </div>
            <Counter
              value={data.saldoAcumulado}
              format={(n) => window.fmt(n)}
              className="mono"
              style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.3, color: 'var(--ink)', display: 'block', marginTop: 6, lineHeight: 1 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <Pill color={data.saldoTrend >= 0 ? 'var(--c-primary)' : 'var(--c-danger)'}>
                <Icon name={data.saldoTrend >= 0 ? 'trending_up' : 'trending_down'} size={12} stroke={2.5} />
                {Math.abs(data.saldoTrend).toFixed(1)}%
              </Pill>
              <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>movimento do período: <span className="mono" style={{ color: data.saldoMes >= 0 ? 'var(--c-primary)' : 'var(--c-danger)', fontWeight: 600 }}>{data.saldoMes >= 0 ? '+' : ''}{window.fmtShort(data.saldoMes)}</span></span>
            </div>
          </div>
          <div style={{ width: 120, height: 40 }}>
            <Sparkline values={data.sparkVals} color="var(--c-primary)" width={120} height={40} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--c-primary)' }} />
              <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 500 }}>Entradas (compras)</span>
            </div>
            <Counter value={data.totalIn} format={(n) => window.fmtShort(n)}
              className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.5 }} />
            <span style={{ fontSize: 11, color: data.inTrend >= 0 ? 'var(--c-primary)' : 'var(--c-danger)', fontWeight: 600 }}>
              {data.inTrend >= 0 ? '↑' : '↓'} {Math.abs(data.inTrend).toFixed(1)}% vs anterior
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--c-danger)' }} />
              <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 500 }}>Saídas (compras)</span>
            </div>
            <Counter value={data.totalOut} format={(n) => window.fmtShort(n)}
              className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.5 }} />
            <span style={{ fontSize: 11, color: data.outTrend <= 0 ? 'var(--c-primary)' : 'var(--c-danger)', fontWeight: 600 }}>
              {data.outTrend >= 0 ? '↑' : '↓'} {Math.abs(data.outTrend).toFixed(1)}% vs anterior
            </span>
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

// ─── PREVISTO vs REALIZADO (entradas e saídas) — pilar #4 ───
const PrevRealWidget = ({ data }) => {
  const rows = [
    { label: 'Entradas previstas', prev: data.prev_in, real: data.real_in, color: 'var(--c-primary)' },
    { label: 'Saídas previstas',   prev: data.prev_out, real: data.real_out, color: 'var(--c-danger)' },
  ];
  return (
    <TiltCard glowColor="var(--c-violet)" padding={24}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>Previsto × Realizado</h3>
          <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>Contas do período</p>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 12, background: 'var(--c-violet-soft)', color: 'var(--c-violet)', display: 'grid', placeItems: 'center' }}>
          <Icon name="pulse" size={18} stroke={2.2} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {rows.map((r, i) => {
          const pct = r.prev > 0 ? Math.min(100, (r.real / r.prev) * 100) : 0;
          const diff = r.real - r.prev;
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.label}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600 }}>{pct.toFixed(0)}%</span>
              </div>
              {/* Barra — previsto (trilho) + realizado (preenchido) */}
              <div style={{ position: 'relative', height: 14, borderRadius: 8, background: 'var(--bg-alt)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                <div style={{
                  position: 'absolute', inset: 0, width: pct + '%',
                  background: `linear-gradient(90deg, ${r.color}, color-mix(in oklch, ${r.color} 70%, var(--c-violet)))`,
                  transformOrigin: 'left',
                  animation: 'barGrowH 0.9s cubic-bezier(.22,1,.36,1) both',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
                <span style={{ color: 'var(--ink-mute)' }}>Previsto: <span className="mono" style={{ color: 'var(--ink)', fontWeight: 600 }}>{window.fmtShort(r.prev)}</span></span>
                <span style={{ color: 'var(--ink-mute)' }}>Realizado: <span className="mono" style={{ color: r.color, fontWeight: 700 }}>{window.fmtShort(r.real)}</span></span>
                <span style={{ color: diff >= 0 ? (i === 0 ? 'var(--c-primary)' : 'var(--c-danger)') : (i === 0 ? 'var(--c-danger)' : 'var(--c-primary)'), fontWeight: 600 }} className="mono">
                  {diff >= 0 ? '+' : ''}{window.fmtShort(diff)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </TiltCard>
  );
};

const FlowWidget = ({ data }) => (
  <TiltCard interactive={false} padding={24}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>Fluxo de caixa</h3>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>Últimos 8 meses</p>
      </div>
      <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-soft)' }}>
          <span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--c-primary)' }} /> Entradas
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-soft)' }}>
          <span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--c-danger)' }} /> Saídas
        </span>
      </div>
    </div>
    <FlowChart data={data.flow} height={240} />
  </TiltCard>
);

const RankingWidget = ({ data }) => (
  <TiltCard glowColor="var(--c-secondary)" padding={24}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>Top receitas</h3>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>Categorias do período</p>
      </div>
      <div style={{ width: 34, height: 34, borderRadius: 12, background: 'var(--c-secondary-soft)', color: 'var(--c-secondary)', display: 'grid', placeItems: 'center' }}>
        <Icon name="trending_up" size={18} stroke={2.2} />
      </div>
    </div>
    <RankBars items={data.revRanking} maxItems={5} />
  </TiltCard>
);

const RecentWidget = ({ data }) => (
  <TiltCard glowColor="var(--c-tertiary)" padding={24}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>Últimas compras</h3>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>Movimentações do caixa</p>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--c-primary)' }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--c-primary)', boxShadow: '0 0 0 0 var(--c-primary)', animation: 'pulseRing 1.6s infinite' }} />
        ATIVO
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {data.recentTxs.slice(0, 6).map((t, i) => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
          borderBottom: i < 5 ? '1px solid var(--line)' : 'none',
          animation: `slideUp 0.5s ease ${i*0.06}s both`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: `color-mix(in oklch, ${t.color} 18%, transparent)`,
            color: t.color,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon name={t.type === 'entrada' ? 'arrow_down' : 'arrow_up'} size={16} stroke={2.4} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{window.fmtDate(t.date)} · {t.category}</div>
          </div>
          <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: t.type === 'entrada' ? 'var(--c-primary)' : 'var(--c-danger)' }}>
            {t.type === 'entrada' ? '+' : '−'}{window.fmtShort(t.amount)}
          </span>
        </div>
      ))}
      {data.recentTxs.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-mute)', fontSize: 13 }}>Sem compras no período.</div>
      )}
    </div>
  </TiltCard>
);

// Pendentes (contas não pagas / não recebidas próximas)
const PendentesWidget = ({ data }) => (
  <TiltCard glowColor="var(--c-tertiary)" padding={24}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>Contas pendentes</h3>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>Vencimentos próximos</p>
      </div>
      <div style={{ width: 34, height: 34, borderRadius: 12, background: 'var(--c-tertiary-soft)', color: 'var(--c-tertiary)', display: 'grid', placeItems: 'center' }}>
        <Icon name="calendar" size={18} stroke={2.2} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {data.pendentes.map((c, i) => (
        <div key={c.id} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
          borderBottom: i < data.pendentes.length - 1 ? '1px solid var(--line)' : 'none',
          animation: `slideUp 0.5s ease ${i*0.06}s both`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: c.tipo === 'receber' ? 'var(--c-primary-soft)' : 'var(--c-danger-soft)',
            color: c.tipo === 'receber' ? 'var(--c-primary)' : 'var(--c-danger)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon name={c.tipo === 'receber' ? 'arrow_down' : 'arrow_up'} size={16} stroke={2.4} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>Vence {window.fmtDate(c.vencimento)}</div>
          </div>
          <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: c.tipo === 'receber' ? 'var(--c-primary)' : 'var(--c-danger)' }}>
            {window.fmtShort(c.previsto)}
          </span>
        </div>
      ))}
      {data.pendentes.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-mute)', fontSize: 13 }}>Tudo em dia ✨</div>
      )}
    </div>
  </TiltCard>
);

const WIDGETS = {
  summary:   { title: 'Saldo geral',         render: SummaryWidget,   span: 6 },
  flow:      { title: 'Fluxo de caixa',      render: FlowWidget,      span: 6 },
  prevreal:  { title: 'Previsto × Realizado', render: PrevRealWidget, span: 6 },
  ranking:   { title: 'Top receitas',        render: RankingWidget,   span: 3 },
  recent:    { title: 'Últimas compras',     render: RecentWidget,    span: 3 },
  pendentes: { title: 'Contas pendentes',    render: PendentesWidget, span: 6 },
};

Object.assign(window, {
  WIDGETS, useWidgetData, DEFAULT_FILTER,
  SummaryWidget, FlowWidget, RankingWidget, RecentWidget, PrevRealWidget, PendentesWidget,
});
