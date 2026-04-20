// Pages — respeita as 5 estruturas obrigatórias
// CONTAS e COMPRAS são páginas separadas.

// ─── FILTRO GLOBAL (mês ou período) ─────────────────────────────
const FilterBar = ({ filter, setFilter }) => {
  const months = window.availableMonths();
  const [showPeriod, setShowPeriod] = React.useState(filter.mode === 'period');
  const [periodFrom, setPeriodFrom] = React.useState(filter.from || '');
  const [periodTo, setPeriodTo] = React.useState(filter.to || '');

  React.useEffect(() => { setShowPeriod(filter.mode === 'period'); }, [filter.mode]);

  return (
    <TiltCard interactive={false} padding={14}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-alt)', padding: 4, borderRadius: 999, border: '1px solid var(--line)' }}>
          <button onClick={() => setFilter({ mode: 'month', month: filter.month || months[months.length - 1] })}
            style={tabBtnStyle(filter.mode === 'month')}>Mês</button>
          <button onClick={() => setFilter({ mode: 'period', from: periodFrom, to: periodTo })}
            style={tabBtnStyle(filter.mode === 'period')}>Período</button>
        </div>

        {filter.mode === 'month' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            <button onClick={() => {
              const i = months.indexOf(filter.month);
              if (i > 0) setFilter({ mode: 'month', month: months[i - 1] });
            }}
              style={navBtn}><Icon name="chevron_left" size={16} stroke={2.4} /></button>
            <select value={filter.month} onChange={(e) => setFilter({ mode: 'month', month: e.target.value })}
              style={selectStyle}>
              {months.map(m => <option key={m} value={m}>{window.monthLabel(m)}</option>)}
            </select>
            <button onClick={() => {
              const i = months.indexOf(filter.month);
              if (i < months.length - 1) setFilter({ mode: 'month', month: months[i + 1] });
            }}
              style={navBtn}><Icon name="chevron_right" size={16} stroke={2.4} /></button>
          </div>
        )}

        {filter.mode === 'period' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600 }}>De</span>
            <input type="date" value={periodFrom} onChange={(e) => { setPeriodFrom(e.target.value); setFilter({ mode: 'period', from: e.target.value, to: periodTo }); }} style={inputStyle} />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600 }}>até</span>
            <input type="date" value={periodTo} onChange={(e) => { setPeriodTo(e.target.value); setFilter({ mode: 'period', from: periodFrom, to: e.target.value }); }} style={inputStyle} />
          </div>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-mute)' }}>
          {filter.mode === 'month'
            ? <>Exibindo <strong style={{ color: 'var(--ink)' }}>{window.monthLabel(filter.month)}</strong></>
            : <>Exibindo <strong style={{ color: 'var(--ink)' }}>{filter.from || '—'} até {filter.to || '—'}</strong></>}
        </div>
      </div>
    </TiltCard>
  );
};
const tabBtnStyle = (active) => ({
  padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
  background: active ? 'var(--surface)' : 'transparent',
  color: active ? 'var(--ink)' : 'var(--ink-mute)',
  boxShadow: active ? 'var(--shadow-sm)' : 'none',
  transition: 'all 0.2s',
});
const navBtn = {
  width: 32, height: 32, borderRadius: 10,
  background: 'var(--bg-alt)', border: '1px solid var(--line)',
  display: 'grid', placeItems: 'center', color: 'var(--ink-soft)',
};
const selectStyle = {
  padding: '8px 14px', borderRadius: 10, border: '1px solid var(--line)',
  background: 'var(--bg-alt)', color: 'var(--ink)', fontSize: 13, fontWeight: 600,
  fontFamily: 'inherit', cursor: 'pointer', minWidth: 130,
};
const inputStyle = {
  padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)',
  background: 'var(--bg-alt)', color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit',
};

// ─── IMPORT EXCEL — abre um diálogo, valida e adiciona a COMPRAS ─────
const ExcelImporter = ({ onImport, target = 'compras' }) => {
  const [state, setState] = React.useState('idle'); // idle | loading | preview | done | error
  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState('');
  const inputRef = React.useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setState('loading');
    try {
      const parsed = target === 'contas' ? await window.parseExcelContas(file) : await window.parseExcel(file);
      if (!parsed.length) throw new Error('Nenhum lançamento válido encontrado.');
      setRows(parsed);
      setState('preview');
    } catch (err) {
      setError(err.message || 'Falha ao importar');
      setState('error');
    }
  };

  const confirm = () => {
    if (target === 'contas') window.addContas(rows);
    else window.addCompras(rows);
    onImport?.(rows.length);
    setState('done');
    setTimeout(() => { setState('idle'); setRows([]); }, 2000);
  };

  return (
    <>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: 'none' }} />
      <Btn variant="secondary" icon="file" onClick={() => inputRef.current?.click()}>Importar Excel</Btn>

      {state === 'loading' && <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Lendo planilha…</div>}

      {state === 'preview' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1500,
          background: 'oklch(0.18 0.02 265 / 0.55)', backdropFilter: 'blur(6px)',
          display: 'grid', placeItems: 'center', padding: 30,
          animation: 'fadeIn 0.2s ease both',
        }}
          onClick={() => setState('idle')}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--surface)', borderRadius: 'var(--r-lg)',
            padding: 28, width: 'min(880px, 100%)', maxHeight: '84vh', overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--line)',
            display: 'flex', flexDirection: 'column', gap: 16,
            animation: 'popIn 0.3s cubic-bezier(.22,1,.36,1) both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Conferir importação</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 4 }}>
                  {rows.length} lançamentos detectados · serão adicionados como {target === 'contas' ? 'CONTAS' : 'COMPRAS'}
                </p>
              </div>
              <button onClick={() => setState('idle')} style={{ ...navBtn, width: 36, height: 36 }}>
                <Icon name="x" size={16} stroke={2.4} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-alt)', zIndex: 1 }}>
                  <tr>
                    {(target === 'contas'
                      ? ['Vencimento','Tipo','Descrição','Categoria','Previsto','Realizado']
                      : ['Data','Tipo','Descrição','Categoria','Valor']
                    ).map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 200).map((r, i) => target === 'contas' ? (
                    <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '9px 14px', color: 'var(--ink-soft)' }} className="mono">{window.fmtDate(r.vencimento)}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <Pill color={r.tipo === 'receber' ? 'var(--c-primary)' : 'var(--c-danger)'} size="sm">{r.tipo === 'receber' ? 'A receber' : 'A pagar'}</Pill>
                      </td>
                      <td style={{ padding: '9px 14px', color: 'var(--ink)', fontWeight: 500 }}>{r.description}</td>
                      <td style={{ padding: '9px 14px', color: 'var(--ink-soft)' }}>{r.category}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: 'var(--ink-soft)', fontWeight: 600 }} className="mono">{window.fmt(r.previsto)}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: r.pago ? (r.tipo === 'receber' ? 'var(--c-primary)' : 'var(--c-danger)') : 'var(--ink-mute)', fontWeight: 700 }} className="mono">
                        {r.pago ? window.fmt(r.realizado) : '—'}
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '9px 14px', color: 'var(--ink-soft)' }} className="mono">{window.fmtDate(r.date)}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <Pill color={r.type === 'entrada' ? 'var(--c-primary)' : 'var(--c-danger)'} size="sm">{r.type}</Pill>
                      </td>
                      <td style={{ padding: '9px 14px', color: 'var(--ink)', fontWeight: 500 }}>{r.description}</td>
                      <td style={{ padding: '9px 14px', color: 'var(--ink-soft)' }}>{r.category}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: r.type === 'entrada' ? 'var(--c-primary)' : 'var(--c-danger)', fontWeight: 700 }} className="mono">
                        {r.type === 'entrada' ? '+' : '−'} {window.fmt(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn variant="secondary" onClick={() => setState('idle')}>Cancelar</Btn>
              <Btn variant="primary" icon="check" onClick={confirm}>Confirmar {rows.length} lançamentos</Btn>
            </div>
          </div>
        </div>
      )}

      {state === 'done' && (
        <div style={toastStyle('var(--c-primary)')}>✓ {rows.length} lançamentos importados</div>
      )}
      {state === 'error' && (
        <div style={toastStyle('var(--c-danger)')}>⚠ {error}
          <button onClick={() => setState('idle')} style={{ marginLeft: 12, color: 'inherit', textDecoration: 'underline' }}>fechar</button>
        </div>
      )}
    </>
  );
};
const toastStyle = (c) => ({
  position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000,
  padding: '12px 20px', borderRadius: 12, background: c, color: '#fff',
  fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-lg)',
  animation: 'slideUp 0.4s cubic-bezier(.22,1,.36,1) both',
});

// ─── MODAL DE EDIÇÃO (Conta ou Compra) ─────────────────────────
const EditModal = ({ kind, record, onClose, onSaved }) => {
  const isConta = kind === 'conta';
  const [form, setForm] = React.useState(() => ({ ...record }));
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true); setErr('');
    try {
      if (isConta) await window.updateContaLocal(record.id, form);
      else await window.updateCompraLocal(record.id, form);
      onSaved?.();
      onClose();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1600,
      background: 'oklch(0.18 0.02 265 / 0.55)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', padding: 30,
      animation: 'fadeIn 0.2s ease both',
    }} onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 28, width: 'min(520px, 100%)',
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', gap: 14,
        animation: 'popIn 0.3s cubic-bezier(.22,1,.36,1) both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Editar {isConta ? 'conta' : 'compra'}</h3>
            <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }} className="mono">#{String(record.id).slice(0, 8)}</p>
          </div>
          <button type="button" onClick={onClose} style={{ ...navBtn, width: 34, height: 34 }}>
            <Icon name="x" size={15} stroke={2.4} />
          </button>
        </div>

        {isConta ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Tipo">
              <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)} style={editInput}>
                <option value="pagar">A pagar (saída)</option>
                <option value="receber">A receber (entrada)</option>
              </select>
            </FormField>
            <FormField label="Vencimento">
              <input type="date" value={form.vencimento || ''} onChange={(e) => set('vencimento', e.target.value)} style={editInput} />
            </FormField>
            <div style={{ gridColumn: 'span 2' }}>
              <FormField label="Descrição">
                <input value={form.description || ''} onChange={(e) => set('description', e.target.value)} style={editInput} required />
              </FormField>
            </div>
            <FormField label="Categoria">
              <input value={form.category || ''} onChange={(e) => set('category', e.target.value)} style={editInput} />
            </FormField>
            <FormField label="Valor previsto">
              <input type="number" step="0.01" value={form.previsto || 0} onChange={(e) => set('previsto', parseFloat(e.target.value))} style={editInput} />
            </FormField>
            <FormField label="Valor realizado">
              <input type="number" step="0.01" value={form.realizado || 0} onChange={(e) => set('realizado', parseFloat(e.target.value))} style={editInput} />
            </FormField>
            <FormField label="Status">
              <select value={form.pago ? 'pago' : 'pendente'} onChange={(e) => set('pago', e.target.value === 'pago')} style={editInput}>
                <option value="pendente">Pendente</option>
                <option value="pago">{form.tipo === 'receber' ? 'Recebido' : 'Pago'}</option>
              </select>
            </FormField>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Tipo">
              <select value={form.type} onChange={(e) => set('type', e.target.value)} style={editInput}>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </FormField>
            <FormField label="Data">
              <input type="date" value={form.date || ''} onChange={(e) => set('date', e.target.value)} style={editInput} />
            </FormField>
            <div style={{ gridColumn: 'span 2' }}>
              <FormField label="Descrição">
                <input value={form.description || ''} onChange={(e) => set('description', e.target.value)} style={editInput} required />
              </FormField>
            </div>
            <FormField label="Categoria / Fornecedor">
              <input value={form.category || ''} onChange={(e) => set('category', e.target.value)} style={editInput} />
            </FormField>
            <FormField label="Valor">
              <input type="number" step="0.01" value={form.amount || 0} onChange={(e) => set('amount', parseFloat(e.target.value))} style={editInput} />
            </FormField>
            <div style={{ gridColumn: 'span 2' }}>
              <FormField label="Método">
                <input value={form.paymentMethod || ''} onChange={(e) => set('paymentMethod', e.target.value)} style={editInput} />
              </FormField>
            </div>
          </div>
        )}

        {err && <div style={{ fontSize: 13, color: 'var(--c-danger)', fontWeight: 500 }}>⚠ {err}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
          <Btn variant="secondary" onClick={onClose} type="button">Cancelar</Btn>
          <Btn variant="primary" icon="check" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</Btn>
        </div>
      </form>
    </div>
  );
};
const editInput = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid var(--line)', background: 'var(--bg-alt)',
  fontSize: 13, color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
};

const RowActions = ({ onEdit, onDelete }) => (
  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
    <button onClick={onEdit} title="Editar" style={rowActionBtn('var(--c-secondary)')}>
      <Icon name="edit" size={14} stroke={2.2} />
    </button>
    <button onClick={onDelete} title="Excluir" style={rowActionBtn('var(--c-danger)')}>
      <Icon name="trash" size={14} stroke={2.2} />
    </button>
  </div>
);
const rowActionBtn = (color) => ({
  width: 30, height: 30, borderRadius: 9,
  background: `color-mix(in oklch, ${color} 10%, transparent)`,
  color, display: 'grid', placeItems: 'center',
  transition: 'all 0.2s',
});

// ─── PÁGINA CONTAS (a pagar / a receber — previsto × realizado) ──────
const ContasPage = ({ filter, setFilter }) => {
  const [editing, setEditing] = React.useState(null);
  const [, tick] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const h = () => tick();
    window.addEventListener('sb-data-hydrated', h);
    return () => window.removeEventListener('sb-data-hydrated', h);
  }, []);
  const [tab, setTab] = React.useState('todos'); // todos | pagar | receber
  const [status, setStatus] = React.useState('all'); // all | pago | pendente
  const [q, setQ] = React.useState('');
  const contas = window.filterContas(filter.mode === 'month' ? { month: filter.month } : { from: filter.from, to: filter.to });
  const filtered = contas.filter(c => {
    if (tab !== 'todos' && c.tipo !== tab) return false;
    if (status === 'pago' && !c.pago) return false;
    if (status === 'pendente' && c.pago) return false;
    if (q && !(c.description.toLowerCase().includes(q.toLowerCase()) || c.category.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  // Entradas e saídas separadas
  const entradas = filtered.filter(c => c.tipo === 'receber');
  const saidas   = filtered.filter(c => c.tipo === 'pagar');
  const tot_prev_in  = entradas.reduce((s, c) => s + c.previsto, 0);
  const tot_prev_out = saidas.reduce((s, c) => s + c.previsto, 0);
  const tot_real_in  = entradas.reduce((s, c) => s + (c.pago ? (c.realizado || c.previsto) : 0), 0);
  const tot_real_out = saidas.reduce((s, c) => s + (c.pago ? (c.realizado || c.previsto) : 0), 0);
  const tot_pend = filtered.filter(c => !c.pago).reduce((s, c) => s + c.previsto, 0);
  // Mantém compat com código abaixo
  const tot_prev = tot_prev_in + tot_prev_out;
  const tot_real = tot_real_in + tot_real_out;

  // Saldo restante do mês anterior — entra como linha na tabela
  const saldo_ant = filter.mode === 'month'
    ? window.saldoAnterior(filter.month)
    : (filter.from ? window.saldoAnterior(filter.from.slice(0, 7)) : 0);
  // Mês anterior para exibir no label
  const mesAntLabel = (() => {
    const ref = filter.mode === 'month' ? filter.month : (filter.from || '').slice(0, 7);
    if (!ref) return 'mês anterior';
    const [y, m] = ref.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    return (window.months || [])[prev.getMonth()] + '/' + String(prev.getFullYear()).slice(2);
  })();

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Contas"
        subtitle="Controle de contas a pagar e a receber — previsto × realizado"
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <ExcelImporter target="contas" />
            <Btn variant="primary" icon="plus">Nova conta</Btn>
          </div>
        } />

      <FilterBar filter={filter} setFilter={setFilter} />

      {/* KPIs: Saldo anterior + Entradas e Saídas separadas + Saldo do período */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        <KPI label="Saldo anterior"  value={saldo_ant}    color="var(--c-secondary)" icon="arrow_right" subtle />
        <KPI label="Prev. Entradas"  value={tot_prev_in}  color="var(--c-primary)" icon="arrow_down" />
        <KPI label="Real. Entradas"  value={tot_real_in + (saldo_ant > 0 ? saldo_ant : 0)} color="var(--c-primary)" icon="check" />
        <KPI label="Prev. Saídas"    value={tot_prev_out} color="var(--c-danger)" icon="arrow_up" />
        <KPI label="Real. Saídas"    value={tot_real_out} color="var(--c-danger)" icon="check" />
        <KPI label="Saldo do período" value={tot_real_in + (saldo_ant > 0 ? saldo_ant : 0) - tot_real_out} color={(tot_real_in + (saldo_ant > 0 ? saldo_ant : 0) - tot_real_out) >= 0 ? 'var(--c-primary)' : 'var(--c-danger)'} icon="wallet" emphasis />
      </div>

      <TiltCard interactive={false} padding={20}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Tab todos / a pagar / a receber */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-alt)', padding: 4, borderRadius: 999, border: '1px solid var(--line)' }}>
            <button onClick={() => setTab('todos')} style={tabBtnStyle(tab === 'todos')}>Todos</button>
            <button onClick={() => setTab('pagar')} style={tabBtnStyle(tab === 'pagar')}>A pagar</button>
            <button onClick={() => setTab('receber')} style={tabBtnStyle(tab === 'receber')}>A receber</button>
          </div>
          {/* Status */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-alt)', padding: 4, borderRadius: 999, border: '1px solid var(--line)' }}>
            {[{k:'all',l:'Todos'},{k:'pago',l:'Pagos'},{k:'pendente',l:'Pendentes'}].map(t => (
              <button key={t.k} onClick={() => setStatus(t.k)} style={tabBtnStyle(status === t.k)}>{t.l}</button>
            ))}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200,
            background: 'var(--bg-alt)', border: '1.5px solid var(--line)', borderRadius: 999, padding: '10px 18px',
          }}>
            <Icon name="search" size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..."
              style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: 14, color: 'var(--ink)', fontFamily: 'inherit' }} />
          </div>
        </div>
      </TiltCard>

      <TiltCard interactive={false} padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ maxHeight: '56vh', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['Vencimento', 'Descrição', 'Categoria', 'Previsto', 'Realizado', 'Status', ''].map((h, i) => (
                  <th key={i + h} style={{
                    textAlign: i === 3 || i === 4 ? 'right' : (i === 6 ? 'right' : 'left'),
                    padding: '14px 20px', fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                    color: 'var(--ink-mute)', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Linha especial: Saldo Anterior */}
              {saldo_ant !== 0 && (tab === 'todos' || tab === 'receber') && (
                <tr style={{ borderBottom: '2px solid var(--c-secondary)', background: 'color-mix(in oklch, var(--c-secondary) 6%, transparent)' }}>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--ink-soft)' }} className="mono">—</td>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: 'var(--c-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'color-mix(in oklch, var(--c-secondary) 18%, transparent)', color: 'var(--c-secondary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Icon name="arrow_right" size={14} stroke={2.4} />
                      </div>
                      Saldo anterior ({mesAntLabel})
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}><Pill color="var(--c-secondary)" size="sm">Saldo</Pill></td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, color: 'var(--ink-mute)' }} className="mono">—</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }} className="mono">
                    <div style={{ fontSize: 14, fontWeight: 700, color: saldo_ant >= 0 ? 'var(--c-primary)' : 'var(--c-danger)' }}>
                      {window.fmt(saldo_ant)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <Pill color="var(--c-secondary)" size="sm">✓ Transitado</Pill>
                  </td>
                  <td></td>
                </tr>
              )}
              {filtered.slice(0, 80).map((c, i) => {
                const color = window.catColor(c.category, tab === 'pagar' ? 'saida' : 'entrada');
                const diff = c.realizado - c.previsto;
                return (
                  <tr key={c.id} style={{
                    borderBottom: '1px solid var(--line)',
                    animation: `fadeIn 0.3s ease ${Math.min(i * 0.02, 0.6)}s both`,
                  }}>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--ink-soft)' }} className="mono">{window.fmtDate(c.vencimento)}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in oklch, ${color} 18%, transparent)`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Icon name={tab === 'receber' ? 'arrow_down' : 'arrow_up'} size={14} stroke={2.4} />
                        </div>
                        {c.description}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}><Pill color={color}>{c.category}</Pill></td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, color: 'var(--ink-soft)' }} className="mono">{window.fmt(c.previsto)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }} className="mono">
                      {c.pago ? (
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: c.tipo === 'pagar' ? 'var(--c-danger)' : 'var(--c-primary)' }}>{window.fmt(c.realizado)}</div>
                          <div style={{ fontSize: 10, color: diff === 0 ? 'var(--ink-mute)' : (tab === 'pagar' ? (diff < 0 ? 'var(--c-primary)' : 'var(--c-danger)') : (diff > 0 ? 'var(--c-primary)' : 'var(--c-danger)')) }}>
                            {diff >= 0 ? '+' : ''}{window.fmtShort(diff)}
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--ink-mute)' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Pill color={c.pago ? 'var(--c-primary)' : 'var(--c-warning)'} size="sm">
                        {c.pago ? '✓ ' + (c.tipo === 'pagar' ? 'Pago' : 'Recebido') : '⏳ Pendente'}
                      </Pill>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <RowActions
                        onEdit={() => setEditing(c)}
                        onDelete={() => { if (confirm(`Excluir "${c.description}"?`)) window.deleteContaLocal(c.id); }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-mute)' }}>Nenhuma conta encontrada para o filtro.</div>
          )}
        </div>
      </TiltCard>
      {editing && <EditModal kind="conta" record={editing} onClose={() => setEditing(null)} onSaved={() => tick()} />}
    </div>
  );
};

// ─── PÁGINA COMPRAS (caixa efetivo — lançamentos) ─────────────────
const ComprasPage = ({ filter, setFilter }) => {
  const [editing, setEditing] = React.useState(null);
  const [filterType, setFilterType] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [, tick] = React.useReducer(x => x + 1, 0); // re-render após import/edit
  React.useEffect(() => {
    const h = () => tick();
    window.addEventListener('sb-data-hydrated', h);
    return () => window.removeEventListener('sb-data-hydrated', h);
  }, []);
  const compras = window.filterCompras(filter.mode === 'month' ? { month: filter.month } : { from: filter.from, to: filter.to });

  const filtered = compras.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (q && !(t.description.toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total_in = compras.filter(c => c.type === 'entrada').reduce((s, c) => s + c.amount, 0);
  const total_out = compras.filter(c => c.type === 'saida').reduce((s, c) => s + c.amount, 0);
  const saldo_ant = filter.mode === 'month' ? window.saldoAnterior(filter.month) : (filter.from ? window.saldoAnterior(filter.from.slice(0, 7)) : 0);
  const saldo = total_in - total_out;

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Compras"
        subtitle="Lançamentos efetivos do caixa — o que entrou e saiu de verdade"
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <ExcelImporter onImport={() => tick()} />
            <Btn variant="primary" icon="plus">Nova compra</Btn>
          </div>
        } />

      <FilterBar filter={filter} setFilter={setFilter} />

      {/* KPI row — saldo anterior + entradas + saídas + saldo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        <KPI label="Saldo anterior" value={saldo_ant} color="var(--c-secondary)" icon="arrow_right" subtle />
        <KPI label="Entradas" value={total_in} color="var(--c-primary)" icon="arrow_down" />
        <KPI label="Saídas" value={total_out} color="var(--c-danger)" icon="arrow_up" />
        <KPI label="Saldo do período" value={saldo} color={saldo >= 0 ? 'var(--c-primary)' : 'var(--c-danger)'} icon="wallet" emphasis />
      </div>

      <TiltCard interactive={false} padding={20}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 240,
            background: 'var(--bg-alt)', border: '1.5px solid var(--line)', borderRadius: 999, padding: '10px 18px',
          }}>
            <Icon name="search" size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por descrição ou categoria..."
              style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: 14, color: 'var(--ink)', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-alt)', padding: 4, borderRadius: 999, border: '1px solid var(--line)' }}>
            {[{k:'all', l:'Todas'}, {k:'entrada', l:'Entradas'}, {k:'saida', l:'Saídas'}].map(t => (
              <button key={t.k} onClick={() => setFilterType(t.k)} style={tabBtnStyle(filterType === t.k)}>{t.l}</button>
            ))}
          </div>
        </div>
      </TiltCard>

      <TiltCard interactive={false} padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ maxHeight: '54vh', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['Data', 'Descrição', 'Categoria', 'Método', 'Valor', ''].map((h, i) => (
                  <th key={i + h} style={{
                    textAlign: i === 4 ? 'right' : (i === 5 ? 'right' : 'left'),
                    padding: '14px 22px', fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                    color: 'var(--ink-mute)', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map((t, i) => (
                <tr key={t.id} style={{
                  borderBottom: '1px solid var(--line)',
                  animation: `fadeIn 0.3s ease ${Math.min(i * 0.02, 0.6)}s both`,
                }}>
                  <td style={{ padding: '14px 22px', fontSize: 13, color: 'var(--ink-soft)' }} className="mono">{window.fmtDate(t.date)}</td>
                  <td style={{ padding: '14px 22px', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in oklch, ${t.color} 18%, transparent)`, color: t.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Icon name={t.type === 'entrada' ? 'arrow_down' : 'arrow_up'} size={14} stroke={2.4} />
                      </div>
                      {t.description}
                    </div>
                  </td>
                  <td style={{ padding: '14px 22px' }}><Pill color={t.color}>{t.category}</Pill></td>
                  <td style={{ padding: '14px 22px', fontSize: 12, color: 'var(--ink-mute)' }}>{t.paymentMethod}</td>
                  <td style={{ padding: '14px 22px', textAlign: 'right' }} className="mono">
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.type === 'entrada' ? 'var(--c-primary)' : 'var(--c-danger)' }}>
                      {t.type === 'entrada' ? '+' : '−'} {window.fmt(t.amount)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <RowActions
                      onEdit={() => setEditing(t)}
                      onDelete={() => { if (confirm(`Excluir "${t.description}"?`)) window.deleteCompraLocal(t.id); }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-mute)' }}>Nenhuma compra encontrada para o filtro.</div>
          )}
        </div>
      </TiltCard>
      {editing && <EditModal kind="compra" record={editing} onClose={() => setEditing(null)} onSaved={() => tick()} />}
    </div>
  );
};

// KPI card reusável
const KPI = ({ label, value, color, icon, subtle, emphasis }) => (
  <TiltCard glowColor={color} padding={20} style={emphasis ? { outline: `2px solid ${color}`, outlineOffset: -2 } : {}}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in oklch, ${color} 16%, transparent)`, color, display: 'grid', placeItems: 'center' }}>
        <Icon name={icon} size={16} stroke={2.2} />
      </div>
    </div>
    <Counter value={value} format={(n) => window.fmt(n)} className="mono"
      style={{ fontSize: subtle ? 22 : 26, fontWeight: 700, color: emphasis ? color : 'var(--ink)', letterSpacing: -0.6 }} />
  </TiltCard>
);

// ─── Pacientes / Agenda / Config (inalteradas) ────────────────────
const PacientesPage = () => {
  const PATIENTS = [
    { id: 1, name: 'Mariana Souza', avatar: 'MS', convenio: 'Unimed', lastVisit: '2026-04-12', nextVisit: '2026-04-26', status: 'ativo' },
    { id: 2, name: 'João Alves', avatar: 'JA', convenio: 'Particular', lastVisit: '2026-04-15', nextVisit: '2026-04-22', status: 'ativo' },
    { id: 3, name: 'Beatriz Ferraz', avatar: 'BF', convenio: 'Bradesco', lastVisit: '2026-03-28', nextVisit: null, status: 'pendente' },
    { id: 4, name: 'Rafael Moreira', avatar: 'RM', convenio: 'SulAmérica', lastVisit: '2026-04-18', nextVisit: '2026-05-02', status: 'ativo' },
    { id: 5, name: 'Camila Tanaka', avatar: 'CT', convenio: 'Particular', lastVisit: '2026-04-10', nextVisit: '2026-04-24', status: 'ativo' },
    { id: 6, name: 'Lucas Prado', avatar: 'LP', convenio: 'Amil', lastVisit: '2026-04-05', nextVisit: null, status: 'inativo' },
  ];
  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Pacientes" subtitle={`${PATIENTS.length} cadastrados`} action={<Btn variant="primary" icon="plus">Novo paciente</Btn>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {PATIENTS.map((p, i) => (
          <TiltCard key={p.id} glowColor="var(--c-secondary)" padding={22} style={{ animation: `popIn 0.5s ease ${i*0.06}s both` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Avatar initials={p.avatar} size={52} color={i % 3 === 0 ? 'var(--c-primary)' : i % 3 === 1 ? 'var(--c-secondary)' : 'var(--c-tertiary)'} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>{p.convenio}</div>
              </div>
              <Pill color={p.status === 'ativo' ? 'var(--c-primary)' : p.status === 'pendente' ? 'var(--c-warning)' : 'var(--c-danger)'} size="sm">{p.status}</Pill>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Última</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginTop: 4 }} className="mono">{window.fmtDate(p.lastVisit)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Próxima</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: p.nextVisit ? 'var(--c-secondary)' : 'var(--ink-mute)', marginTop: 4 }} className="mono">
                  {p.nextVisit ? window.fmtDate(p.nextVisit) : '—'}
                </div>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
};

const AgendaPage = ({ filter, setFilter }) => {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    days.push(d);
  }
  const contas = window.CONTAS.filter(c => !c.pago).slice(0, 20);
  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Agenda" subtitle="Vencimentos dos próximos 7 dias" />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <TiltCard interactive={false} padding={24}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Semana</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {days.map((d, i) => {
              const dayContas = contas.filter(c => new Date(c.vencimento + 'T12:00:00').toDateString() === d.toDateString());
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div key={i} style={{
                  borderRadius: 'var(--r-md)', padding: 14,
                  background: isToday ? 'color-mix(in oklch, var(--c-primary) 10%, transparent)' : 'var(--bg-alt)',
                  border: isToday ? '2px solid var(--c-primary)' : '1px solid var(--line)',
                  minHeight: 140, animation: `popIn 0.4s ease ${i*0.05}s both`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {['dom','seg','ter','qua','qui','sex','sáb'][d.getDay()]}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: isToday ? 'var(--c-primary)' : 'var(--ink)' }} className="mono">{d.getDate()}</div>
                  {dayContas.slice(0, 3).map(c => (
                    <div key={c.id} style={{
                      marginTop: 6, padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                      background: c.tipo === 'receber' ? 'color-mix(in oklch, var(--c-primary) 18%, transparent)' : 'color-mix(in oklch, var(--c-danger) 18%, transparent)',
                      color: c.tipo === 'receber' ? 'var(--c-primary)' : 'var(--c-danger)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }} title={c.description}>{c.description.slice(0, 14)}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </TiltCard>

        <TiltCard interactive={false} padding={24}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Próximos vencimentos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
            {contas.slice(0, 8).map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                borderRadius: 'var(--r-md)', background: 'var(--bg-alt)', border: '1px solid var(--line)',
                animation: `slideUp 0.4s ease ${i*0.07}s both`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: c.tipo === 'receber' ? 'var(--c-primary-soft)' : 'var(--c-danger-soft)',
                  color: c.tipo === 'receber' ? 'var(--c-primary)' : 'var(--c-danger)',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <Icon name={c.tipo === 'receber' ? 'arrow_down' : 'arrow_up'} size={16} stroke={2.4} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-mute)' }} className="mono">{window.fmtDate(c.vencimento)}</div>
                </div>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: c.tipo === 'receber' ? 'var(--c-primary)' : 'var(--c-danger)' }}>
                  {window.fmtShort(c.previsto)}
                </span>
              </div>
            ))}
          </div>
        </TiltCard>
      </div>
    </div>
  );
};

const ConfigPage = () => (
  <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 700 }}>
    <PageHeader title="Configurações" subtitle="Personalize sua experiência" />
    <TiltCard interactive={false} padding={28}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Conta</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { label: 'Nome da clínica', value: 'Infinity Clínica' },
          { label: 'E-mail', value: 'contato@infinity.clinic' },
          { label: 'CNPJ', value: '12.345.678/0001-90' },
          { label: 'Plano atual', value: 'Profissional' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 500 }}>{f.label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{f.value}</span>
          </div>
        ))}
      </div>
    </TiltCard>
  </div>
);

// Page header
const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
    <div>
      <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.2, color: 'var(--ink)' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 14, color: 'var(--ink-mute)', marginTop: 4 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

Object.assign(window, { ContasPage, ComprasPage, PacientesPage, AgendaPage, ConfigPage, PageHeader, FilterBar, ExcelImporter, KPI });
