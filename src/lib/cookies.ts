/**
 * Interface para preferências de cookies
 */
interface CookiePreferences {
  analytics: boolean;
  functional: boolean;
  lastUpdated: number;
}

/**
 * Interface para preferências do usuário
 */
interface UserPreferences {
  darkMode?: boolean;
  [key: string]: any;
}

/**
 * Gerencia cookies e consentimento LGPD
 */
class CookieService {
  private readonly PREFERENCES_KEY = 'cookie_preferences';
  private readonly USER_PREFS_KEY = 'user_preferences';

  /**
   * Obtém as preferências de cookies salvas
   */
  getPreferences(): CookiePreferences {
    try {
      const stored = document.cookie
        .split('; ')
        .find((row) => row.startsWith(this.PREFERENCES_KEY));

      if (stored) {
        const [, value] = stored.split('=');
        const preferences = JSON.parse(decodeURIComponent(value));
        return preferences;
      }
    } catch (error) {
      console.error('🍪 Erro ao ler preferências:', error);
    }

    return {
      analytics: false,
      functional: false,
      lastUpdated: 0,
    };
  }

  /**
   * Salva as preferências de cookies
   */
  savePreferences(preferences: Partial<CookiePreferences>): boolean {
    try {
      const current = this.getPreferences();
      const updated = {
        ...current,
        ...preferences,
        lastUpdated: Date.now(),
      };

      // Expira em 6 meses
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 6);

      document.cookie = `${this.PREFERENCES_KEY}=${encodeURIComponent(
        JSON.stringify(updated)
      )}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;

      // Se cookies funcionais estiverem desativados, limpa preferências do usuário
      if (!updated.functional) {
        this.clearUserPreferences();
      }

      // Verifica se o cookie foi realmente salvo
      const savedPreferences = this.getPreferences();
      const success =
        savedPreferences.analytics === updated.analytics &&
        savedPreferences.functional === updated.functional;

      console.info('🍪 Status dos Cookies:', {
        salvos: success,
        analytics: savedPreferences.analytics,
        functional: savedPreferences.functional,
        expira: expires.toLocaleDateString(),
      });

      return success;
    } catch (error) {
      console.error('🍪 Erro ao salvar preferências:', error);
      return false;
    }
  }

  /**
   * Obtém preferências do usuário
   */
  getUserPreferences(): UserPreferences {
    try {
      // Para o tema, primeiro tenta o localStorage
      if (typeof window !== 'undefined') {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode !== null) {
          return { darkMode: darkMode === 'true' };
        }
      }

      // Fallback para cookies
      const prefs = document.cookie
        .split('; ')
        .find((row) => row.startsWith(this.USER_PREFS_KEY));

      if (prefs) {
        const [, value] = prefs.split('=');
        return JSON.parse(decodeURIComponent(value));
      }
    } catch (error) {
      console.error('🍪 Erro ao ler preferências do usuário:', error);
    }

    return {};
  }

  /**
   * Salva uma preferência do usuário
   */
  saveUserPreference(key: string, value: any): boolean {
    const { functional } = this.getPreferences();
    if (!functional) {
      console.warn('🍪 Cookies funcionais desativados. Preferência não salva.');
      return false;
    }

    try {
      // Salva o tema no localStorage para acesso rápido
      if (key === 'darkMode') {
        localStorage.setItem('darkMode', value);
      }

      // Continua salvando nos cookies para persistência
      const prefs = this.getUserPreferences();
      const newPrefs = { ...prefs, [key]: value };

      const expires = new Date();
      expires.setMonth(expires.getMonth() + 6);

      document.cookie = `${this.USER_PREFS_KEY}=${encodeURIComponent(
        JSON.stringify(newPrefs)
      )}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;

      return true;
    } catch (error) {
      console.error('🍪 Erro ao salvar preferência:', error);
      return false;
    }
  }

  /**
   * Limpa preferências do usuário
   */
  private clearUserPreferences(): void {
    document.cookie = `${this.USER_PREFS_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }

  /**
   * Verifica se o usuário já deu consentimento
   */
  hasConsent(): boolean {
    const { lastUpdated } = this.getPreferences();
    return lastUpdated > 0;
  }

  /**
   * Remove todas as preferências
   */
  clearPreferences(): void {
    this.clearUserPreferences();
    document.cookie = `${this.PREFERENCES_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }

  /**
   * Verifica o estado atual dos cookies
   */
  checkStatus(): {
    active: boolean;
    preferences: CookiePreferences;
    cookieExists: boolean;
    userPreferences: UserPreferences;
  } {
    const preferences = this.getPreferences();
    const cookieExists = document.cookie.includes(this.PREFERENCES_KEY);
    const userPreferences = this.getUserPreferences();

    return {
      active: this.hasConsent(),
      preferences,
      cookieExists,
      userPreferences,
    };
  }
}

export const cookieService = new CookieService();
