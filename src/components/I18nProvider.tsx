'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Language, TranslationKey, getTranslation, getDirection } from '../lib/i18n';

interface I18nContextType {
    lang: Language;
    t: (key: TranslationKey) => string;
    dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
    lang = 'en',
    children
}: {
    lang?: Language;
    children: ReactNode
}) {
    const t = (key: TranslationKey) => getTranslation(lang, key);
    const dir = getDirection(lang);

    return (
        <I18nContext.Provider value={{ lang, t, dir }}>
            <div dir={dir} className="w-full h-full">
                {children}
            </div>
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        // Fallback to English if provider is missing
        return {
            lang: 'en' as Language,
            t: (key: TranslationKey) => getTranslation('en', key),
            dir: 'ltr' as const
        };
    }
    return context;
}
