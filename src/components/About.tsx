import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { User, ChevronDown, ChevronUp } from 'lucide-react';

const About = () => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    // Placeholder images for the new items
    const otherWorksImages = {
        1: "https://placehold.co/600x400/eef2ff/4f46e5?text=Business+App",
        2: "https://placehold.co/600x400/f0f9ff/0ea5e9?text=CAD+Add-in"
    };

    return (
        <section id="about" className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-5xl text-center">

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
                >
                    <User className="w-5 h-5" />
                    {isOpen ? t.about.close : t.about.button}
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-16 pb-8 text-left">
                                {/* Profile Section */}
                                <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
                                    <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 relative mx-auto md:mx-0">
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
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-slate-200 mb-16"></div>

                                {/* Other Works Section */}
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center md:text-left">
                                        {t.about.items ? (t === t ? "Other Professional Works" : "その他の実績") : ""}
                                        {/* Note: In a real app I'd add a title key for this section, using implicit fallback for now or the items title */}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {t.about.items && t.about.items.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="group bg-slate-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100"
                                            >
                                                <div className="relative overflow-hidden aspect-video">
                                                    <img
                                                        src={otherWorksImages[item.id as keyof typeof otherWorksImages]}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="p-6">
                                                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">{item.category}</div>
                                                    <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                                                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default About;
