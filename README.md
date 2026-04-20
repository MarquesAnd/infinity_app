# Infinity — Sistema financeiro para clínicas

Aplicação single-page em React (via Babel in-browser) + Supabase.

## Publicar no GitHub Pages

1. Faça commit de todos os arquivos deste projeto no seu repo `infinity_app`:
   ```
   index.html
   src/
     app.jsx
     auth.jsx
     charts.jsx
     data.jsx
     pages.jsx
     supabase.jsx
     ui.jsx
     widgets.jsx
   ```
2. Em **Settings → Pages**, defina a fonte como `main` branch, pasta `/ (root)`.
3. Acesse https://marquesand.github.io/infinity_app/ — a página carrega `index.html` direto.

## Nota sobre Supabase Auth

Como a aplicação usa **Supabase Auth**, o domínio `https://marquesand.github.io` precisa estar autorizado:

- No painel do Supabase: **Authentication → URL Configuration**
  - `Site URL`: `https://marquesand.github.io/infinity_app/`
  - `Redirect URLs`: adicione `https://marquesand.github.io/infinity_app/**`

## Desenvolvimento local

Basta abrir `index.html` direto no navegador, ou rodar um servidor simples:
```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Estrutura

- `src/supabase.jsx` — cliente e wrappers CRUD
- `src/data.jsx` — lógica de dados + fallback mock
- `src/auth.jsx` — tela de login, Perfil, Equipe
- `src/pages.jsx` — Contas, Compras, Agenda, etc
- `src/widgets.jsx` — cards do dashboard
- `src/charts.jsx` — gráficos
- `src/ui.jsx` — primitivos (botões, ícones, cards)
- `src/app.jsx` — shell (sidebar, topbar, router)
