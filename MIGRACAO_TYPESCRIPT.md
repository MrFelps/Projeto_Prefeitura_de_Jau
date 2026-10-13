# 🚀 Totemize — Guia de Deploy Vercel e Migração para TypeScript

Este documento reúne todas as orientações para publicação do Totemize na **Vercel** e o roteiro de migração progressiva do front-end para **TypeScript**.

---

## 🌐 1. Deploy Instantâneo na Vercel

O projeto foi configurado com [`vercel.json`](./vercel.json) e opera nativamente como aplicação estática web moderna.

### Como publicar na Vercel:
1. Acesse o painel da [Vercel](https://vercel.com).
2. Clique em **"Add New..."** ➔ **"Project"**.
3. Importe o repositório GitHub: `MrFelps/Projeto_Prefeitura_de_Jau`.
4. Em **Framework Preset**, deixe selecionado **"Other"** (ou deixe a Vercel detectar automaticamente).
5. Em **Root Directory**, mantenha `./`.
6. Em **Build and Output Settings**:
   - **Build Command**: deixe em branco (desativado).
   - **Output Directory**: deixe em branco.
7. Clique em **Deploy**.

> 💡 **Rotas Prontas configuradas no `vercel.json`:**
> - `/` ➔ [`index.html`](./index.html) (Totem Interativo e Simulador 3D)
> - `/estrutura` ➔ [`estrutura.html`](./estrutura.html) (Planta Técnica & Esquema Estrutural)
> - `/pitch_guia` ➔ [`pitch_guia.html`](./pitch_guia.html) (Roteiro de Pitch e Apresentação)
> - `/Orcamentos_Fornecedores_Totem_Jau` ➔ Orçamentos e Peças
> - `/Contrato_Autorizacoes_Prefeitura_Jau_Totemize` ➔ Minuta Jurídica e Contrato

---

## 🛠️ 2. Estrutura TypeScript Configurada

O repositório já está preparado com toda a infraestrutura e tipagem estrita para TypeScript:

```
├── types/
│   ├── totem.d.ts             # Tipos do domínio: CityData, ReferencePoint, TotemState, etc.
│   └── global.d.ts            # Tipagens globais: window.THREE, window.QRCode, funções de navegação
├── src/
│   ├── types/index.ts         # Exportação central de tipos
│   ├── data/cities.ts         # Base tipada das 3 cidades (Jaú, Itapuí, Bauru) 100% offline
│   ├── services/totemState.ts # Gerenciador de estado tipado e reativo do totem
│   └── main.ts                # Ponto de entrada modular TypeScript
├── package.json               # Dependências (@types/three, @types/qrcode, typescript, vite)
├── tsconfig.json              # Configuração ES2022 / Bundler com allowJs: true
└── vercel.json                # Configuração de rotas limpas e cabeçalhos de segurança
```

---

## 💻 3. Comandos de Desenvolvimento

No seu terminal ou VS Code:

```bash
# 1. Instalar dependências de tipagem e ferramentas
npm install

# 2. Executar checagem de tipos estrita (TypeScript)
npm run typecheck

# 3. Rodar servidor de desenvolvimento rápido (Vite)
npm run dev
```

---

## 🗺️ 4. Roteiro Passo a Passo de Migração (JS ➔ TS)

O projeto adota a estratégia de **Migração Não Disruptiva (Zero Downtime)**, permitindo que a versão atual continue rodando 100% funcional enquanto os módulos são convertidos gradualmente:

| Etapa | Arquivo Alvo | Ação | Status |
|---|---|---|---|
| **Fase 1** | Infraestrutura | `package.json`, `tsconfig.json`, `vercel.json`, `types/` | ✅ **Concluída** |
| **Fase 2** | Modelagem de Dados | `src/data/cities.ts` e `src/services/totemState.ts` | ✅ **Concluída** |
| **Fase 3** | Lógica de Interface | Migrar funções de `app.js` para `src/ui/` (navegação, modais, acessibilidade) | ⏳ Próximo passo |
| **Fase 4** | Engine 3D Three.js | Modularizar `totem3d.js` em `src/three/` (cenário, materiais, animação da porta) | ⏳ Próximo passo |
| **Fase 5** | Bundling Completo | Habilitar build único via Vite (`npm run build`) | ⏳ Finalização |
