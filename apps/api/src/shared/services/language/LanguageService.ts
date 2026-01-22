export interface LanguageInfo {
  name: string;
  nativeName: string;
  country: string;
  code: string;
  tag: string;
}

const LANGUAGES_MAPPING = {
  en: {
    name: "English",
    nativeName: "English",
    country: "United States",
    code: "en-US",
    tag: "en"
  },
  es: {
    name: "Spanish",
    nativeName: "Español",
    country: "Spain",
    code: "es-ES",
    tag: "es"
  },
  fr: {
    name: "French",
    nativeName: "Français",
    country: "France",
    code: "fr-FR",
    tag: "fr"
  },
  de: {
    name: "German",
    nativeName: "Deutsch",
    country: "Germany",
    code: "de-DE",
    tag: "de"
  },
  it: {
    name: "Italian",
    nativeName: "Italiano",
    country: "Italy",
    code: "it-IT",
    tag: "it"
  },
  pt: {
    name: "Portuguese",
    nativeName: "Português",
    country: "Portugal",
    code: "pt-PT",
    tag: "pt"
  },
  ru: {
    name: "Russian",
    nativeName: "Русский",
    country: "Russia",
    code: "ru-RU",
    tag: "ru"
  },
  ja: {
    name: "Japanese",
    nativeName: "日本語",
    country: "Japan",
    code: "ja-JP",
    tag: "ja"
  },
  ko: {
    name: "Korean",
    nativeName: "한국어",
    country: "South Korea",
    code: "ko-KR",
    tag: "ko"
  },
  zh: {
    name: "Chinese",
    nativeName: "中文",
    country: "China",
    code: "zh-CN",
    tag: "zh"
  },
  ar: {
    name: "Arabic",
    nativeName: "العربية",
    country: "Saudi Arabia",
    code: "ar-SA",
    tag: "ar"
  },
  hi: {
    name: "Hindi",
    nativeName: "हिन्दी",
    country: "India",
    code: "hi-IN",
    tag: "hi"
  },
  nl: {
    name: "Dutch",
    nativeName: "Nederlands",
    country: "Netherlands",
    code: "nl-NL",
    tag: "nl"
  },
  pl: {
    name: "Polish",
    nativeName: "Polski",
    country: "Poland",
    code: "pl-PL",
    tag: "pl"
  },
  tr: {
    name: "Turkish",
    nativeName: "Türkçe",
    country: "Turkey",
    code: "tr-TR",
    tag: "tr"
  },
  sv: {
    name: "Swedish",
    nativeName: "Svenska",
    country: "Sweden",
    code: "sv-SE",
    tag: "sv"
  },
  da: {
    name: "Danish",
    nativeName: "Dansk",
    country: "Denmark",
    code: "da-DK",
    tag: "da"
  },
  no: {
    name: "Norwegian",
    nativeName: "Norsk",
    country: "Norway",
    code: "no-NO",
    tag: "no"
  },
  fi: {
    name: "Finnish",
    nativeName: "Suomi",
    country: "Finland",
    code: "fi-FI",
    tag: "fi"
  },
  cs: {
    name: "Czech",
    nativeName: "Čeština",
    country: "Czech Republic",
    code: "cs-CZ",
    tag: "cs"
  }
} as const;

export type LanguagesKey = keyof typeof LANGUAGES_MAPPING;
export type LanguagesName = typeof LANGUAGES_MAPPING[keyof typeof LANGUAGES_MAPPING]['nativeName'];
export type LanguagesCountry = typeof LANGUAGES_MAPPING[keyof typeof LANGUAGES_MAPPING]['country'];

export type LanguagesMapping = Record<LanguagesKey, LanguageInfo>;

type LanguageIdentifier = {
  nativeName?: string;
  country?: string;
  code?: string;
  tag?: string;
};

export class LanguageService {
  private readonly LANGUAGES_MAPPING = LANGUAGES_MAPPING;
  private readonly DEFAULT_LANGUAGE: LanguagesKey = 'en';

  /**
   * Get language info by language key
   */
  public getLanguageInfo(language: LanguagesKey): LanguageInfo | undefined {
    return this.LANGUAGES_MAPPING[language] ?? this.LANGUAGES_MAPPING[this.DEFAULT_LANGUAGE];
  }

  /**
   * Get language info by any identifier (nativeName, country, code, or tag)
   */
  public getLanguageBy(identifier: LanguageIdentifier): LanguageInfo | undefined {
    return Object.values(this.LANGUAGES_MAPPING).find((lang) => {
      if (identifier.nativeName && lang.nativeName === identifier.nativeName) return true;
      if (identifier.country && lang.country === identifier.country) return true;
      if (identifier.code && lang.code === identifier.code) return true;
      if (identifier.tag && lang.tag === identifier.tag) return true;
      return false;
    });
  }

  /**
   * Get all supported languages
   */
  public getAllLanguages(): LanguagesMapping {
    return this.LANGUAGES_MAPPING;
  }

  /**
   * Check if language is supported by any identifier (nativeName, country, code, or tag)
   */
  public isLanguageSupported(identifier: LanguageIdentifier): boolean {
    return this.getLanguageBy(identifier) !== undefined;
  }

  /**
   * Check if language is supported by language key
   */
  public isLanguageKeySupported(language: string): boolean {
    return language in this.LANGUAGES_MAPPING;
  }
}
