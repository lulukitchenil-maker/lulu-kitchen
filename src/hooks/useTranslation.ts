export const useTranslation = () => {
  const t = (he: string, en?: string) => {
    const lang = localStorage.getItem('lang') || 'he';
    return lang === 'he' ? he : en || he;
  };
  return { t };
};
