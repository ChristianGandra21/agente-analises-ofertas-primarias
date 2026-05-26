# Agente de Análise de Ofertas Primárias - BTG

Este projeto é uma plataforma avançada de análise de investimentos em **Renda Fixa Brasileira**, focada em ofertas primárias. Ele combina automação de coleta de dados (scraper), análise macroeconômica e inteligência artificial (LLMs) para fornecer recomendações e insights acionáveis.

---

## 🛠️ Stack Tecnológica

### Backend
- **Linguagem:** Python 3.11+
- **API Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/)
- **Processamento de Dados:** Pandas & Pydantic
- **Coleta de Dados:** Playwright (Web Scraping) & Requests
- **Agendamento:** APScheduler

### Inteligência Artificial (Agentic AI)
- **Orquestração:** [LangGraph](https://www.langchain.com/langgraph) & LangChain
- **LLM:** Llama 3.3 70B (via Groq Cloud)
- **Busca Semântica:** Tavily Search API
- **Padrão de Design:** Orquestrador-Analista (Orchestrator Pattern)

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS & Shadcn/UI
- **Gráficos:** Recharts
- **Animações:** Framer Motion
- **Consumo de API:** SWR

### Infraestrutura & DevOps
- **Containerização:** Docker & Docker Compose
- **Banco de Dados:** SQLite (persistido em volume)
- **Logs:** Loguru

---

## 🏗️ Arquitetura do Sistema

O sistema é dividido em três camadas principais, garantindo modularidade e escalabilidade:

### 1. Ingestion Pipeline (Ingestão)
Scripts especializados coletam dados de fontes oficiais e de mercado:
- **CVM:** Ofertas em registro (CRA, CRI, Debêntures).
- **BCB:** Indicadores macroeconômicos (Selic, IPCA).
- **Meelion:** Captura de detalhes de taxas e ativos.
- **Tavily:** Contextualização de notícias recentes.

### 2. Intelligent Core (Agentes)
A lógica de decisão é orquestrada por dois agentes especialistas:
- **Analista de Ofertas:** Foca no banco de dados, comparando taxas (spread vs benchmark).
- **Agente de Contexto:** Analisa o cenário macro e notícias para validar o timing da oferta.
- **Orquestrador:** Sintetiza as respostas em uma recomendação final coesa.

### 3. API & Web Dashboard
Uma interface moderna que permite ao usuário:
- Visualizar tabelas de ofertas em tempo real.
- Comparar ativos de renda fixa.
- Interagir via chat com o Agente de Investimentos para tirar dúvidas sobre o mercado.

---

## 📁 Estrutura de Pastas

```text
├── data/               # Banco de dados SQLite e cache CVM
├── src/
│   ├── agents/         # Lógica dos agentes LangChain/LangGraph
│   ├── api/            # Rotas FastAPI e Schemas
│   ├── ingestion/      # Scrapers e coletores de dados
│   ├── processing/     # Limpeza e transformação de dados
│   └── database.py     # Configuração SQLAlchemy
├── web/                # Frontend Next.js
│   ├── src/app         # Páginas e Rotas
│   └── src/components  # Componentes UI/Gráficos
├── docker-compose.yml  # Orquestração de serviços
└── requirements.txt    # Dependências Python
```

---

## 🚀 Como Executar

Certifique-se de ter o **Docker** instalado.

1. Clone o repositório:
   ```bash
   git clone https://github.com/inteli/agentes-ofertas-primarias-btg.git
   cd agentes-ofertas-primarias-btg
   ```

2. Configure as variáveis de ambiente (arquivo `.env` na raiz):
   ```env
   GROQ_API_KEY=sua_chave_aqui
   TAVILY_API_KEY=sua_chave_aqui
   ```

3. Suba os containers:
   ```bash
   docker-compose up --build
   ```

4. Acesse:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração tecnológica.
