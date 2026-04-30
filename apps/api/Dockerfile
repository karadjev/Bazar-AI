FROM golang:1.25.5-alpine3.22 AS build

WORKDIR /src
RUN apk add --no-cache ca-certificates git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/bazar-api ./cmd/api

FROM alpine:3.22 AS runtime

RUN apk add --no-cache ca-certificates tzdata && addgroup -S bazar && adduser -S -G bazar bazar
WORKDIR /app
COPY --from=build /out/bazar-api /app/bazar-api
RUN mkdir -p /app/uploads && chown -R bazar:bazar /app
USER bazar
EXPOSE 8080
ENV API_ADDR=:8080
STOPSIGNAL SIGTERM
CMD ["/app/bazar-api"]
