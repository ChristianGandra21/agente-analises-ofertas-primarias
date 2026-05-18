FROM python:3.12-slim

# Dependências do sistema para o Playwright/Firefox
RUN apt-get update && apt-get install -y \
    wget curl gnupg \
    libgtk-3-0 libdbus-glib-1-2 \
    libx11-xcb1 libxt6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instala Firefox do Playwright
RUN playwright install firefox
RUN playwright install-deps firefox

# Copia o projeto
COPY . .

# Cria diretórios de dados
RUN mkdir -p data/cvm data/meelion data/db

EXPOSE 8501

CMD ["streamlit", "run", "src/dashboard/app.py", "--server.address=0.0.0.0"]
