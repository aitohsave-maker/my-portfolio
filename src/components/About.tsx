import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const About = () => {
    const { t } = useLanguage();

    return (
        <section id="about" className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row items-center gap-12"
                >
                    <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 blur-lg opacity-50 transform translate-x-2 translate-y-2"></div>
                        <img
                            src="https://placehold.co/400x400/e2e8f0/1e293b?text=Me"
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl relative z-10"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{t.about.title}</h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            {t.about.description1}
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {t.about.description2}
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
