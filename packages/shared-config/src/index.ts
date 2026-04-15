export const serviceNames = [
  "api-gateway",
  "identity-service",
  "leadgen-service",
  "pipeline-worker",
  "leadstore-service"
] as const;

export type ServiceName = (typeof serviceNames)[number];

