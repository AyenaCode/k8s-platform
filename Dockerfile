FROM bitnami/kubectl:latest AS kubectl

FROM node:20-alpine
WORKDIR /app

# bash: the exercise scripts use #!/bin/bash
RUN apk add --no-cache bash

# kubectl: binary copied from the official bitnami image (no curl, no runtime download)
COPY --from=kubectl /opt/bitnami/kubectl/bin/kubectl /usr/local/bin/kubectl

# Server + static frontend
COPY app/server.js .
COPY app/public/ ./public/

# Courses — whole folder, including the en/ and fr/ subfolders (auto-discovered by the server)
COPY courses/ ./courses/

# Exercises — complete (mission.<lang>.md + deploy.sh + reset.sh)
COPY exercices/ ./exercices/

EXPOSE 3000
CMD ["node", "server.js"]
