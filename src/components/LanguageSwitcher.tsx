import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-6 right-6 z-50 bg-white/80 backdrop-blur-md p-1 rounded-full shadow-lg border border-slate-100"
        >
            <div className="flex relative">
                <div
                    className={`absolute top-0 bottom-0 w-1/2 bg-slate-900 rounded-full transition-all duration-300 ${language === 'en' ? 'left-0' : 'left-1/2'}`}
                />
                <button
                    onClick={() => setLanguage('en')}
                    className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors ${language === 'en' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    EN
                </button>
                <button
                    onClick={() => setLanguage('ja')}
                    className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors ${language === 'ja' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    JP
                </button>
            </div>
        </motion.div>
    );
};

export default LanguageSwitcher;
