import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Hero = () => {
    const { t } = useLanguage();

    return (
        <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-slate-50">
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-200 blur-3xl" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-200 blur-3xl" />
            </div>

            <div className="z-10 text-center px-4 max-w-4xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 mb-6"
                >
                    {t.hero.title1} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        {t.hero.title2}
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-light"
                >
                    {t.hero.description}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                    <a href="#about" className="inline-block px-8 py-4 bg-slate-900 text-white rounded-full font-medium transition-transform hover:scale-105 hover:shadow-lg">
                        {t.hero.button}
                    </a>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400"
            >
                <ArrowDown size={32} />
            </motion.div>
        </section>
    );
};

export default Hero;
