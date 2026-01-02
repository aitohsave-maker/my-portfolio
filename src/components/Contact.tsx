import { motion } from 'framer-motion';
import { Github, Twitter, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Contact = () => {
    const { t } = useLanguage();

    return (
        <section id="contact" className="py-24 bg-white">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">{t.contact.title}</h2>
                    <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                        {t.contact.description}
                    </p>

                    <div className="flex justify-center gap-8">
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-slate-50 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter size={24} />
                        </a>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-slate-50 rounded-full text-slate-600 hover:bg-gray-100 hover:text-black transition-colors"
                            aria-label="GitHub"
                        >
                            <Github size={24} />
                        </a>
                        <a
                            href="mailto:hello@example.com"
                            className="p-4 bg-slate-50 rounded-full text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                            aria-label="Email"
                        >
                            <Mail size={24} />
                        </a>
                    </div>

                    <div className="mt-20 pt-8 border-t border-slate-100 text-slate-400 text-sm">
                        © {new Date().getFullYear()} Portfolio. All rights reserved.
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
