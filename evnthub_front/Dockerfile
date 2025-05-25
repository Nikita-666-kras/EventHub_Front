FROM nginx:alpine

# Кастомный конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Фронтенд
COPY dist/ /usr/share/nginx/html

EXPOSE 80
