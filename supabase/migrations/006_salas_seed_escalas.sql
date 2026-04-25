-- ═══════════════════════════════════════════════════════════════════════════
-- Infinity — Migration 006
-- Seed das escalas reais a partir do mapa de salas (PROFISSIONAIS_POR_SALA)
--
-- 223 escalas para 33 profissionais
-- 4 fechamentos parciais (Karolina qua/sex)
--
-- IMPORTANTE: este script PRESSUPÕE que a migration 005_salas_module.sql
-- já foi aplicada (cria unidades, categorias e salas físicas).
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  v_company_id uuid := '7b8a5efa-c15f-4ff0-a223-75acd6003f15';
  v_user_id uuid;
  -- IDs auxiliares
  v_prof_francisca uuid;
  v_prof_jessica uuid;
  v_prof_kenia uuid;
  v_prof_lais uuid;
  v_prof_mara uuid;
  v_prof_michelle uuid;
  v_prof_rosana uuid;
  v_prof_silvia uuid;
  v_prof_andre uuid;
  v_prof_bruno uuid;
  v_prof_eduardo uuid;
  v_prof_luan uuid;
  v_prof_lucas uuid;
  v_prof_paulo uuid;
  v_prof_priscila uuid;
  v_prof_emilly uuid;
  v_prof_karolina uuid;
  v_prof_mariana uuid;
  v_prof_pamela uuid;
  v_prof_tais uuid;
  v_prof_vitoria uuid;
  v_prof_wessilon uuid;
  v_prof_mayumi uuid;
  v_prof_aline uuid;
  v_prof_hugo uuid;
  v_prof_lara uuid;
  v_prof_ana_maria uuid;
  v_prof_daiane uuid;
  v_prof_sandra uuid;
  v_prof_mona uuid;
  v_prof_marcus uuid;
  v_prof_vitor uuid;
  v_prof_welligton uuid;
  v_sala_eq1_s01_1p uuid;
  v_sala_eq1_s01_2p uuid;
  v_sala_eq1_s01_3p uuid;
  v_sala_eq1_s02_1p uuid;
  v_sala_eq1_s02_2p uuid;
  v_sala_eq1_s02_3p uuid;
  v_sala_eq1_s03_2p uuid;
  v_sala_eq1_s03_3p uuid;
  v_sala_eq1_s04_1p uuid;
  v_sala_eq1_s04_2p uuid;
  v_sala_eq1_s05_1p uuid;
  v_sala_eq1_s06_2p uuid;
  v_sala_eq1_s07_1p uuid;
  v_sala_eq1_s07_2p uuid;
  v_sala_eq2_s01_tr uuid;
  v_sala_eq2_s04_tr uuid;
  v_sala_eq2_s05_2p uuid;
  v_sala_eq2_s06_2p uuid;
  v_sala_eq2_s08_1p uuid;
  v_sala_eq2_s09_1p uuid;
  v_sala_eq2_s10_1p uuid;
  v_sala_eq2_s11_1p uuid;
  v_sala_eq2_s12_1p uuid;
  v_sala_eq2_s13_1p uuid;
  v_cat_eq1_psico uuid;
  v_cat_eq1_psiq uuid;
  v_cat_eq1_neuro uuid;
  v_cat_eq2_aba uuid;
  v_cat_eq2_fono uuid;
  v_cat_eq2_to uuid;
  v_cat_eq2_psp uuid;
  v_cat_eq2_music uuid;
  v_cat_eq2_psm uuid;
  v_cat_eq2_psiq uuid;
begin
  -- Pega qualquer admin da empresa para ser o created_by
  select id into v_user_id from profiles where company_id = v_company_id and role = 'admin' limit 1;
  if v_user_id is null then
    raise notice 'Nenhum admin encontrado — created_by ficará null';
  end if;

  -- ── Resolver IDs de profissionais ──
  select id into v_prof_francisca from colaboradores where company_id = v_company_id and upper(nome) like upper('FRANCISCA%') limit 1;
  select id into v_prof_jessica from colaboradores where company_id = v_company_id and upper(nome) like upper('JESSICA%') limit 1;
  select id into v_prof_kenia from colaboradores where company_id = v_company_id and upper(nome) like upper('KENIA%') limit 1;
  select id into v_prof_lais from colaboradores where company_id = v_company_id and upper(nome) like upper('LAIS%') limit 1;
  select id into v_prof_mara from colaboradores where company_id = v_company_id and upper(nome) like upper('MARA%') limit 1;
  select id into v_prof_michelle from colaboradores where company_id = v_company_id and upper(nome) like upper('MICHELLE%') limit 1;
  select id into v_prof_rosana from colaboradores where company_id = v_company_id and upper(nome) like upper('ROSANA%') limit 1;
  select id into v_prof_silvia from colaboradores where company_id = v_company_id and upper(nome) like upper('SILVIA%') limit 1;
  select id into v_prof_andre from colaboradores where company_id = v_company_id and upper(nome) like upper('ANDRE%') limit 1;
  select id into v_prof_bruno from colaboradores where company_id = v_company_id and upper(nome) like upper('BRUNO%') limit 1;
  select id into v_prof_eduardo from colaboradores where company_id = v_company_id and upper(nome) like upper('EDUARDO%') limit 1;
  select id into v_prof_luan from colaboradores where company_id = v_company_id and upper(nome) like upper('LUAN%') limit 1;
  select id into v_prof_lucas from colaboradores where company_id = v_company_id and upper(nome) like upper('LUCAS%') limit 1;
  select id into v_prof_paulo from colaboradores where company_id = v_company_id and upper(nome) like upper('PAULO%') limit 1;
  select id into v_prof_priscila from colaboradores where company_id = v_company_id and upper(nome) like upper('PRISCILA%') limit 1;
  select id into v_prof_emilly from colaboradores where company_id = v_company_id and upper(nome) like upper('EMILLY%') limit 1;
  select id into v_prof_karolina from colaboradores where company_id = v_company_id and upper(nome) like upper('KAROLINA%') limit 1;
  select id into v_prof_mariana from colaboradores where company_id = v_company_id and upper(nome) like upper('MARIANA%') limit 1;
  select id into v_prof_pamela from colaboradores where company_id = v_company_id and upper(nome) like upper('PAMELA%') limit 1;
  select id into v_prof_tais from colaboradores where company_id = v_company_id and upper(nome) like upper('TAIS%') limit 1;
  select id into v_prof_vitoria from colaboradores where company_id = v_company_id and upper(nome) like upper('VITORIA%') limit 1;
  select id into v_prof_wessilon from colaboradores where company_id = v_company_id and upper(nome) like upper('WESSILON%') limit 1;
  select id into v_prof_mayumi from colaboradores where company_id = v_company_id and upper(nome) like upper('MAYUMI%') limit 1;
  select id into v_prof_aline from colaboradores where company_id = v_company_id and upper(nome) like upper('ALINE%') limit 1;
  select id into v_prof_hugo from colaboradores where company_id = v_company_id and upper(nome) like upper('HUGO%') limit 1;
  select id into v_prof_lara from colaboradores where company_id = v_company_id and upper(nome) like upper('LARA%') limit 1;
  select id into v_prof_ana_maria from colaboradores where company_id = v_company_id and upper(nome) like upper('ANA%') limit 1;
  select id into v_prof_daiane from colaboradores where company_id = v_company_id and upper(nome) like upper('DAIANE%') limit 1;
  select id into v_prof_sandra from colaboradores where company_id = v_company_id and upper(nome) like upper('SANDRA%') limit 1;
  select id into v_prof_mona from colaboradores where company_id = v_company_id and upper(nome) like upper('MONA%') limit 1;
  select id into v_prof_marcus from colaboradores where company_id = v_company_id and upper(nome) like upper('MARCUS%') limit 1;
  select id into v_prof_vitor from colaboradores where company_id = v_company_id and upper(nome) like upper('VITOR%') limit 1;
  select id into v_prof_welligton from colaboradores where company_id = v_company_id and upper(nome) like upper('WELLIGTON%') limit 1;

  -- ── Resolver IDs de salas físicas ──
  select sf.id into v_sala_eq1_s01_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '01' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq1_s01_2p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '01' and sf.andar = '2ºPISO';
  select sf.id into v_sala_eq1_s01_3p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '01' and sf.andar = '3ºPISO';
  select sf.id into v_sala_eq1_s02_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '02' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq1_s02_2p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '02' and sf.andar = '2ºPISO';
  select sf.id into v_sala_eq1_s02_3p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '02' and sf.andar = '3ºPISO';
  select sf.id into v_sala_eq1_s03_2p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '03' and sf.andar = '2ºPISO';
  select sf.id into v_sala_eq1_s03_3p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '03' and sf.andar = '3ºPISO';
  select sf.id into v_sala_eq1_s04_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '04' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq1_s04_2p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '04' and sf.andar = '2ºPISO';
  select sf.id into v_sala_eq1_s05_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '05' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq1_s06_2p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '06' and sf.andar = '2ºPISO';
  select sf.id into v_sala_eq1_s07_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '07' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq1_s07_2p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sf.numero = '07' and sf.andar = '2ºPISO';
  select sf.id into v_sala_eq2_s01_tr from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '01' and sf.andar = 'TÉRREO';
  select sf.id into v_sala_eq2_s04_tr from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '04' and sf.andar = 'TÉRREO';
  select sf.id into v_sala_eq2_s05_2p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '05' and sf.andar = '2ºPISO';
  select sf.id into v_sala_eq2_s06_2p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '06' and sf.andar = '2ºPISO';
  select sf.id into v_sala_eq2_s08_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '08' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq2_s09_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '09' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq2_s10_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '10' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq2_s11_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '11' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq2_s12_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '12' and sf.andar = '1ºPISO';
  select sf.id into v_sala_eq2_s13_1p from salas_fisicas sf join salas_unidades su on su.id = sf.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sf.numero = '13' and sf.andar = '1ºPISO';

  -- ── Resolver IDs de categorias ──
  select sc.id into v_cat_eq1_psico from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sc.codigo = 'PSICO';
  select sc.id into v_cat_eq1_psiq from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sc.codigo = 'PSIQ';
  select sc.id into v_cat_eq1_neuro from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ1' and sc.codigo = 'NEURO';
  select sc.id into v_cat_eq2_aba from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sc.codigo = 'ABA';
  select sc.id into v_cat_eq2_fono from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sc.codigo = 'FONO';
  select sc.id into v_cat_eq2_to from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sc.codigo = 'TO';
  select sc.id into v_cat_eq2_psp from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sc.codigo = 'PSP';
  select sc.id into v_cat_eq2_music from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sc.codigo = 'MUSIC';
  select sc.id into v_cat_eq2_psm from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sc.codigo = 'PSM';
  select sc.id into v_cat_eq2_psiq from salas_categorias sc join salas_unidades su on su.id = sc.unidade_id where su.company_id = v_company_id and su.codigo = 'EQ2' and sc.codigo = 'PSIQ';

  -- ── INSERT escalas ──
  -- Limpa escalas anteriores desta empresa (idempotência)
  delete from salas_escalas where company_id = v_company_id;

  insert into salas_escalas (company_id, colaborador_id, categoria_id, sala_id, dia_semana, turno, hora_inicio, hora_fim, status, observacao, created_by, updated_by) values
    (v_company_id, v_prof_francisca, v_cat_eq1_psico, v_sala_eq1_s03_3p, 1, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_francisca, v_cat_eq1_psico, v_sala_eq1_s03_3p, 2, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_francisca, v_cat_eq1_psico, v_sala_eq1_s03_3p, 3, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_francisca, v_cat_eq1_psico, v_sala_eq1_s03_3p, 4, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_francisca, v_cat_eq1_psico, v_sala_eq1_s03_3p, 5, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 1, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 1, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 2, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 2, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 3, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 3, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 4, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 4, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 5, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 5, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_jessica, v_cat_eq1_psico, v_sala_eq1_s02_3p, 6, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 1, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 1, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 2, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 2, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 3, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 3, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 4, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 4, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 5, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 5, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_kenia, v_cat_eq1_psico, v_sala_eq1_s03_3p, 6, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 1, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 1, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 1, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 2, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 2, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 2, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 3, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 3, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 3, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 4, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 4, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 4, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 5, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 5, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lais, v_cat_eq1_psico, v_sala_eq1_s04_1p, 5, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mara, v_cat_eq1_psico, v_sala_eq1_s02_3p, 1, 'tarde', '13:00', '18:00', 'itinerante', 'Itinerante: S02-3P (seg), S06-2P (ter), S07-2P (qua/sex), S01-3P (qui)', v_user_id, v_user_id),
    (v_company_id, v_prof_mara, v_cat_eq1_psico, v_sala_eq1_s06_2p, 2, 'tarde', '13:00', '18:00', 'itinerante', 'Itinerante: S02-3P (seg), S06-2P (ter), S07-2P (qua/sex), S01-3P (qui)', v_user_id, v_user_id),
    (v_company_id, v_prof_mara, v_cat_eq1_psico, v_sala_eq1_s07_2p, 3, 'manha', '08:00', '13:00', 'itinerante', 'Itinerante: S02-3P (seg), S06-2P (ter), S07-2P (qua/sex), S01-3P (qui)', v_user_id, v_user_id),
    (v_company_id, v_prof_mara, v_cat_eq1_psico, v_sala_eq1_s01_3p, 4, 'tarde', '13:00', '18:00', 'itinerante', 'Itinerante: S02-3P (seg), S06-2P (ter), S07-2P (qua/sex), S01-3P (qui)', v_user_id, v_user_id),
    (v_company_id, v_prof_mara, v_cat_eq1_psico, v_sala_eq1_s07_2p, 5, 'manha', '08:00', '13:00', 'itinerante', 'Itinerante: S02-3P (seg), S06-2P (ter), S07-2P (qua/sex), S01-3P (qui)', v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 1, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 1, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 2, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 2, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 3, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 3, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 4, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 4, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 5, 'tarde', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 5, 'noite', '13:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_michelle, v_cat_eq1_psico, v_sala_eq1_s05_1p, 6, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_rosana, v_cat_eq1_psico, v_sala_eq1_s02_1p, 1, 'manha', '08:30', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_rosana, v_cat_eq1_psico, v_sala_eq1_s02_1p, 1, 'tarde', '13:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_rosana, v_cat_eq1_psico, v_sala_eq1_s02_1p, 2, 'manha', '08:30', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_rosana, v_cat_eq1_psico, v_sala_eq1_s02_1p, 2, 'tarde', '13:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_rosana, v_cat_eq1_psico, v_sala_eq1_s02_1p, 3, 'manha', '08:30', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_rosana, v_cat_eq1_psico, v_sala_eq1_s02_1p, 3, 'tarde', '13:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_rosana, v_cat_eq1_psico, v_sala_eq1_s02_1p, 4, 'manha', '08:30', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_rosana, v_cat_eq1_psico, v_sala_eq1_s02_1p, 4, 'tarde', '13:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_silvia, v_cat_eq1_psico, v_sala_eq1_s01_3p, 1, 'tarde', '16:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_silvia, v_cat_eq1_psico, v_sala_eq1_s01_3p, 1, 'noite', '16:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_silvia, v_cat_eq1_psico, v_sala_eq1_s01_3p, 2, 'tarde', '16:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_silvia, v_cat_eq1_psico, v_sala_eq1_s01_3p, 2, 'noite', '16:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_silvia, v_cat_eq1_psico, v_sala_eq1_s01_3p, 4, 'tarde', '16:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_silvia, v_cat_eq1_psico, v_sala_eq1_s01_3p, 4, 'noite', '16:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_andre, v_cat_eq1_psiq, v_sala_eq1_s06_2p, 5, 'tarde', '13:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_andre, v_cat_eq1_psiq, v_sala_eq1_s06_2p, 5, 'noite', '13:00', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_bruno, v_cat_eq1_psiq, v_sala_eq1_s01_3p, 1, 'manha', '08:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_bruno, v_cat_eq1_psiq, v_sala_eq1_s01_3p, 2, 'manha', '08:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_bruno, v_cat_eq1_psiq, v_sala_eq1_s01_3p, 3, 'manha', '08:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_bruno, v_cat_eq1_psiq, v_sala_eq1_s01_3p, 4, 'manha', '08:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_bruno, v_cat_eq1_psiq, v_sala_eq1_s01_3p, 5, 'manha', '08:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_eduardo, v_cat_eq1_psiq, v_sala_eq1_s06_2p, 1, 'manha', '08:00', '12:00', 'sob_demanda', 'Atende sob demanda', v_user_id, v_user_id),
    (v_company_id, v_prof_luan, v_cat_eq1_psiq, v_sala_eq1_s07_2p, 1, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_luan, v_cat_eq1_psiq, v_sala_eq1_s07_2p, 1, 'tarde', '14:30', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_luan, v_cat_eq1_psiq, v_sala_eq1_s07_2p, 2, 'tarde', '14:30', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_luan, v_cat_eq1_psiq, v_sala_eq1_s07_2p, 3, 'tarde', '14:30', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_luan, v_cat_eq1_psiq, v_sala_eq1_s07_2p, 4, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_luan, v_cat_eq1_psiq, v_sala_eq1_s07_2p, 4, 'tarde', '14:30', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lucas, v_cat_eq1_psiq, v_sala_eq1_s02_3p, 4, 'tarde', '16:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lucas, v_cat_eq1_psiq, v_sala_eq1_s02_3p, 4, 'noite', '16:00', '19:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_paulo, v_cat_eq1_psiq, v_sala_eq1_s02_3p, 1, 'tarde', '16:45', '20:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_priscila, v_cat_eq1_psiq, v_sala_eq1_s07_2p, 2, 'manha', '07:00', '11:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_priscila, v_cat_eq1_psiq, v_sala_eq1_s07_2p, 6, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 1, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 1, 'tarde', '13:00', '17:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 2, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 2, 'tarde', '13:00', '17:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 3, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 3, 'tarde', '13:00', '17:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 4, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 4, 'tarde', '13:00', '17:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 5, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_emilly, v_cat_eq1_neuro, v_sala_eq1_s03_2p, 5, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 1, 'manha', '08:00', '12:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 1, 'tarde', '13:00', '17:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 2, 'manha', '08:00', '12:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 2, 'tarde', '13:00', '17:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 3, 'manha', '07:00', '12:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 3, 'tarde', '13:00', '16:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 4, 'manha', '08:00', '12:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 4, 'tarde', '13:00', '17:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 5, 'manha', '07:00', '12:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_karolina, v_cat_eq1_neuro, v_sala_eq1_s01_2p, 5, 'tarde', '13:00', '16:00', 'ativa', 'Agenda fechada quarta e sexta-feira', v_user_id, v_user_id),
    (v_company_id, v_prof_mariana, v_cat_eq1_neuro, v_sala_eq1_s07_1p, 1, 'manha', '07:30', '13:30', 'ativa', 'Entra 07:30 — corrigir registro 08:00', v_user_id, v_user_id),
    (v_company_id, v_prof_mariana, v_cat_eq1_neuro, v_sala_eq1_s07_1p, 2, 'manha', '07:30', '13:30', 'ativa', 'Entra 07:30 — corrigir registro 08:00', v_user_id, v_user_id),
    (v_company_id, v_prof_mariana, v_cat_eq1_neuro, v_sala_eq1_s07_1p, 3, 'manha', '07:30', '13:30', 'ativa', 'Entra 07:30 — corrigir registro 08:00', v_user_id, v_user_id),
    (v_company_id, v_prof_mariana, v_cat_eq1_neuro, v_sala_eq1_s07_1p, 4, 'manha', '07:30', '13:30', 'ativa', 'Entra 07:30 — corrigir registro 08:00', v_user_id, v_user_id),
    (v_company_id, v_prof_mariana, v_cat_eq1_neuro, v_sala_eq1_s07_1p, 5, 'manha', '07:30', '13:30', 'ativa', 'Entra 07:30 — corrigir registro 08:00', v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 1, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 1, 'tarde', '13:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 2, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 2, 'tarde', '13:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 3, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 3, 'tarde', '13:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 4, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 4, 'tarde', '13:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 5, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_pamela, v_cat_eq1_neuro, v_sala_eq1_s04_2p, 5, 'tarde', '13:00', '17:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 1, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 1, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 2, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 2, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 3, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 3, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 4, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 4, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 5, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_tais, v_cat_eq1_neuro, v_sala_eq1_s02_2p, 5, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 1, 'manha', '07:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 1, 'tarde', '13:00', '18:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 2, 'manha', '07:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 2, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 3, 'manha', '07:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 3, 'tarde', '13:00', '18:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 4, 'manha', '07:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 4, 'tarde', '13:00', '16:45', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 5, 'manha', '07:00', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitoria, v_cat_eq1_neuro, v_sala_eq1_s01_1p, 5, 'tarde', '13:00', '14:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_wessilon, v_cat_eq1_neuro, v_sala_eq1_s03_3p, 1, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_wessilon, v_cat_eq1_neuro, v_sala_eq1_s03_3p, 1, 'tarde', '13:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_wessilon, v_cat_eq1_neuro, v_sala_eq1_s03_3p, 2, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_wessilon, v_cat_eq1_neuro, v_sala_eq1_s03_3p, 2, 'tarde', '13:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_wessilon, v_cat_eq1_neuro, v_sala_eq1_s03_3p, 3, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_wessilon, v_cat_eq1_neuro, v_sala_eq1_s03_3p, 3, 'tarde', '13:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_wessilon, v_cat_eq1_neuro, v_sala_eq1_s03_3p, 4, 'manha', '07:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_wessilon, v_cat_eq1_neuro, v_sala_eq1_s03_3p, 4, 'tarde', '13:00', '15:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_wessilon, v_cat_eq1_neuro, v_sala_eq1_s03_3p, 5, 'manha', '07:00', '10:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 1, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 1, 'tarde', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 1, 'noite', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 2, 'manha', '07:00', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 2, 'tarde', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 2, 'noite', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 3, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 3, 'tarde', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 3, 'noite', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 4, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 4, 'tarde', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 4, 'noite', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 5, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 5, 'tarde', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mayumi, v_cat_eq2_aba, v_sala_eq2_s13_1p, 5, 'noite', '13:45', '19:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 1, 'manha', '08:30', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 1, 'tarde', '13:00', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 2, 'manha', '08:30', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 2, 'tarde', '13:00', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 3, 'manha', '08:30', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 3, 'tarde', '13:00', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 4, 'manha', '08:30', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 4, 'tarde', '13:00', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 5, 'manha', '08:30', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_aline, v_cat_eq2_fono, v_sala_eq2_s11_1p, 5, 'tarde', '13:00', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 1, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 1, 'tarde', '13:00', '18:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 2, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 2, 'tarde', '13:00', '18:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 3, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 3, 'tarde', '13:00', '18:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 4, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 4, 'tarde', '13:00', '18:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 5, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_hugo, v_cat_eq2_fono, v_sala_eq2_s10_1p, 5, 'tarde', '13:00', '18:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lara, v_cat_eq2_fono, v_sala_eq2_s12_1p, 1, 'manha', '07:45', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lara, v_cat_eq2_fono, v_sala_eq2_s12_1p, 1, 'tarde', '12:15', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lara, v_cat_eq2_fono, v_sala_eq2_s12_1p, 3, 'tarde', '13:45', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_lara, v_cat_eq2_fono, v_sala_eq2_s12_1p, 5, 'manha', '07:45', '11:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 1, 'manha', '07:00', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 1, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 2, 'manha', '07:00', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 2, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 3, 'manha', '07:00', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 3, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 4, 'manha', '07:00', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 4, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 5, 'manha', '07:00', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_ana_maria, v_cat_eq2_psp, v_sala_eq2_s08_1p, 5, 'tarde', '13:00', '16:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_daiane, v_cat_eq2_psp, v_sala_eq2_s09_1p, 1, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_daiane, v_cat_eq2_psp, v_sala_eq2_s09_1p, 2, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_daiane, v_cat_eq2_psp, v_sala_eq2_s09_1p, 3, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_daiane, v_cat_eq2_psp, v_sala_eq2_s09_1p, 4, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_daiane, v_cat_eq2_psp, v_sala_eq2_s09_1p, 5, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_sandra, v_cat_eq2_music, v_sala_eq2_s04_tr, 2, 'tarde', '13:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mona, v_cat_eq2_psm, v_sala_eq2_s01_tr, 1, 'manha', '08:30', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mona, v_cat_eq2_psm, v_sala_eq2_s01_tr, 1, 'tarde', '13:00', '17:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mona, v_cat_eq2_psm, v_sala_eq2_s01_tr, 2, 'manha', '07:45', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mona, v_cat_eq2_psm, v_sala_eq2_s01_tr, 2, 'tarde', '13:45', '18:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mona, v_cat_eq2_psm, v_sala_eq2_s01_tr, 3, 'manha', '07:45', '12:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mona, v_cat_eq2_psm, v_sala_eq2_s01_tr, 3, 'tarde', '13:45', '18:15', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_mona, v_cat_eq2_psm, v_sala_eq2_s01_tr, 5, 'manha', '07:00', '13:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_marcus, v_cat_eq2_psiq, v_sala_eq2_s05_2p, 4, 'tarde', '13:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitor, v_cat_eq2_psiq, v_sala_eq2_s05_2p, 2, 'manha', '07:00', '12:30', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_vitor, v_cat_eq2_psiq, v_sala_eq2_s05_2p, 5, 'manha', '08:00', '12:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_welligton, v_cat_eq2_psiq, v_sala_eq2_s06_2p, 1, 'tarde', '14:00', '20:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_welligton, v_cat_eq2_psiq, v_sala_eq2_s06_2p, 3, 'tarde', '14:00', '18:00', 'ativa', null, v_user_id, v_user_id),
    (v_company_id, v_prof_welligton, v_cat_eq2_psiq, v_sala_eq2_s06_2p, 5, 'tarde', '14:00', '20:00', 'ativa', null, v_user_id, v_user_id);

  -- ── INSERT fechamentos parciais ──
  insert into salas_fechamentos (escala_id, dia_semana, turno, motivo, created_by)
  select e.id, 3, 'manha', 'Agenda fechada às quartas (manhã)', v_user_id
    from salas_escalas e where e.colaborador_id = v_prof_karolina and e.dia_semana = 3 and e.turno = 'manha'
  union all select e.id, 3, 'tarde', 'Agenda fechada às quartas (tarde)', v_user_id from salas_escalas e where e.colaborador_id = v_prof_karolina and e.dia_semana = 3 and e.turno = 'tarde'
  union all select e.id, 5, 'manha', 'Agenda fechada às sextas (manhã)', v_user_id from salas_escalas e where e.colaborador_id = v_prof_karolina and e.dia_semana = 5 and e.turno = 'manha'
  union all select e.id, 5, 'tarde', 'Agenda fechada às sextas (tarde)', v_user_id from salas_escalas e where e.colaborador_id = v_prof_karolina and e.dia_semana = 5 and e.turno = 'tarde'
  ;

  raise notice 'Seed concluído: 223 escalas, 4 fechamentos.';
end $$;

-- ── Verificação rápida ──
-- select count(*) as total_escalas from salas_escalas where company_id = '7b8a5efa-c15f-4ff0-a223-75acd6003f15';
-- select count(*) as total_fechamentos from salas_fechamentos f join salas_escalas e on e.id = f.escala_id where e.company_id = '7b8a5efa-c15f-4ff0-a223-75acd6003f15';