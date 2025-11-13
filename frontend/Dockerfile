# Stage 1: Build React App
FROM node:18-alpine AS builder
WORKDIR /app

# 1. Copia SÓ o package.json para o contêiner
# (O yarn.lock será criado no próximo passo)
COPY package.json ./

# 2. Roda o yarn install
# Isso instala dependências E cria o yarn.lock DENTRO da imagem.
# Esta camada será cacheada pelo Docker.
RUN yarn install

# 3. Agora copia o resto do código-fonte (src, public, tailwind.config.js, etc)
COPY . .

# 4. Roda o build (que usará o código-fonte e o node_modules)
# O script "build" no package.json vai rodar "vite build"
RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# --- CORREÇÃO IMPORTANTE ---
# Copia da pasta 'dist' (do Vite) e não 'build'
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf
# Copia a nossa configuração customizada (com o proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]