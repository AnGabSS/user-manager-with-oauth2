export interface EnvConfig {
  getAppPort(): number
  getNodeEnv(): string | undefined
  getJwtSecret(): string
  getJwtExpiresIn(): number
  getGoogleClientId(): string
  getGoogleClientSecret(): string
  getGoogleCallbackURL(): string
}
