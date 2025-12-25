// Configuration options for DataViews component
import { Language } from './i18n';

export interface DataViewsConfig {
    defaultView?: 'grid' | 'kanban' | 'gallery' | 'calendar' | 'form';
    language?: Language; // Language code (en, es, zh, ar, hi, fr, pt, ru, de, ja)
}
