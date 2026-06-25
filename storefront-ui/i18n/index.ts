import i18n, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import it from "./locales/it.json";
import fr from "./locales/fr.json";

export const resources = {
  en: { translation: en },
  it: { translation: it },
  fr: { translation: fr },
} as const;

export const supportedLngs = Object.keys(resources);

export function createI18n(language?: string): I18nInstance {
  const instance = i18n.createInstance();
  instance.use(initReactI18next).init({
    resources,
    lng: language?.toLowerCase(),
    fallbackLng: "en",
    supportedLngs,
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
  });
  return instance;
}
