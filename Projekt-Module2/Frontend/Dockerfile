FROM nginx:alpine

COPY html/ /usr/share/nginx/html/

COPY default.conf /etc/nginx/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
