# syntax=docker/dockerfile:1.7

FROM node:24.16.0-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm i

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.30.2-alpine3.23 AS runtime

# All filesystem prep must happen while we are still root.
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Drop the server config in as a template so the entrypoint's envsubst step
# substitutes ${BACKEND_ORIGIN} and ${NGINX_RESOLVER} at container start. The
# matching `*.envsh` script auto-detects the resolver from /etc/resolv.conf.
#
# BACKEND_ORIGIN MUST be set by the caller (e.g. compose `environment:`) —
# the image deliberately bakes no default so nothing is environment-specific.
# Example: BACKEND_ORIGIN=http://petrik-navigator-backend:8001
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/15-detect-resolver.envsh /docker-entrypoint.d/15-detect-resolver.envsh

# NGINX_ENVSUBST_FILTER restricts envsubst to ONLY these env vars, otherwise it
# would also expand nginx's own runtime vars ($host, $remote_addr, $uri, …) and
# silently break the config.
ENV NGINX_ENVSUBST_FILTER="^(BACKEND_ORIGIN|NGINX_RESOLVER)$"

COPY --from=builder --chown=nginx:nginx /usr/src/app/dist /usr/share/nginx/html

# Strip write bits from the served assets so a compromised worker can't mutate them.
RUN chmod -R a-w /usr/share/nginx/html

# The base image's entrypoint drops to the `nginx` user for worker processes
# automatically. We don't set USER here because nginx needs to start as root to
# bind privileged sockets / write the pid file, then it forks workers as `nginx`.
# (We've already dropped Linux capabilities at the compose level.)

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]