export interface EnvConfig {
  getAppPort(): number
  getNodeEnv(): string | undefined
}
