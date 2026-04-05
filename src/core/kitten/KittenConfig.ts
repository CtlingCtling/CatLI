export interface KittenConfig {
  baseUrl: string;
  model: string;
  apiKeyEnv: string;
}

class KittenConfigManagerImpl {
  private static instance: KittenConfigManagerImpl | null = null;
  config: KittenConfig = {
    baseUrl: process.env.KITTEN_BASE_URL || "https://api.deepseek.com",
    model: process.env.KITTEN_MODEL || "deepseek-chat",
    apiKeyEnv: process.env.KITTEN_API_KEY_ENV || "DEEPSEEK_API_KEY",
  };

  private constructor() {}

  static getInstance(): KittenConfigManagerImpl {
    if (!KittenConfigManagerImpl.instance) {
      KittenConfigManagerImpl.instance = new KittenConfigManagerImpl();
    }
    return KittenConfigManagerImpl.instance;
  }

  getConfig(): KittenConfig {
    return { ...this.config };
  }

  setConfig(partial: Partial<KittenConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  getApiKey(): string | undefined {
    return process.env[this.config.apiKeyEnv];
  }
}

export const KittenConfigManager = KittenConfigManagerImpl;
