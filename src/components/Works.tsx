import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Archive, X, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

const projectImages = [
    "https://placehold.co/600x400/222222/00ffff?text=Gravity+Bumper",
    "https://placehold.co/600x400/1e293b/f8fafc?text=Blind+Labyrinth",
    "https://placehold.co/600x400/e0f2fe/0369a1?text=Elastic+Stickman",
    "https://placehold.co/600x400/dbeafe/2563eb?text=Shatter+Tetra",
    "https://placehold.co/600x400/fdf4ff/ec4899?text=Gravity+Swap+3"
];

const archiveImages = {
    101: "https://placehold.co/600x400/fdf4ff/d946ef?text=Gravity+Swap",
    102: "https://placehold.co/600x400/fdf4ff/8b5cf6?text=Gravity+Swap+2"
};

const Works = () => {
    const { t } = useLanguage();
    const [showArchives, setShowArchives] = useState(false);
    const [selectedGameInstructions, setSelectedGameInstructions] = useState<any>(null);

    return (
        <section id="works" className="py-24 bg-slate-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t.works.title}</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        {t.works.description}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
                    {t.works.items.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="relative overflow-hidden aspect-video">
                                <a
                                    href={project.link}
                                    target={project.link.startsWith('http') || project.link.startsWith('/') ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    className="block w-full h-full cursor-pointer"
                                >
                                    <img
                                        src={projectImages[index]}
                                        alt={project.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <ExternalLink className="text-white w-8 h-8" />
                                    </div>
                                </a>
                                {project.howToPlay && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedGameInstructions(project);
                                        }}
                                        className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-lg transition-all transform hover:scale-110 z-20 flex items-center gap-2 px-3 text-sm font-semibold md:opacity-0 md:group-hover:opacity-100"
                                    >
                                        <HelpCircle size={18} />
                                        <span>{t.works.howToPlayLabel}</span>
                                    </button>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="text-sm font-medium text-blue-600 mb-2">{project.category}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    <a href={project.link} target={project.link.startsWith('/') ? "_blank" : "_self"}>
                                        {project.title}
                                    </a>
                                </h3>
                                <p className="text-slate-600 text-sm flex-1">
                                    {project.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Archives Section */}
                <div className="text-center">
                    <button
                        onClick={() => setShowArchives(!showArchives)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300 transition-colors font-medium mb-8"
                    >
                        {showArchives ? <X size={20} /> : <Archive size={20} />}
                        {showArchives ? t.works.archives.close : t.works.archives.button}
                    </button>

                    <AnimatePresence>
                        {showArchives && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-slate-100 rounded-3xl p-8 md:p-12 border border-slate-200">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center justify-center gap-2">
                                        <Archive className="text-slate-500" />
                                        {t.works.archives.title}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                                        {t.works.archives.items.map((project) => (
                                            <div
                                                key={project.id}
                                                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                                            >
                                                <div className="relative overflow-hidden aspect-video">
                                                    <a
                                                        href={project.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-full h-full text-slate-800"
                                                    >
                                                        <img
                                                            src={archiveImages[project.id as keyof typeof archiveImages]}
                                                            alt={project.title}
                                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                            <ExternalLink className="text-white w-8 h-8" />
                                                        </div>
                                                    </a>
                                                    {project.howToPlay && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setSelectedGameInstructions(project);
                                                            }}
                                                            className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-md transition-all md:opacity-0 md:group-hover:opacity-100"
                                                            title={t.works.howToPlayLabel}
                                                        >
                                                            <HelpCircle size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="p-4 text-left">
                                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{project.category}</div>
                                                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                                                        <a href={project.link} target="_blank">{project.title}</a>
                                                    </h4>
                                                    <p className="text-slate-600 text-sm">{project.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Instructions Modal */}
                <AnimatePresence>
                    {selectedGameInstructions && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedGameInstructions(null)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                            >
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <HelpCircle size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-900">{selectedGameInstructions.title}</h3>
                                                <p className="text-sm font-medium text-slate-500">{t.works.howToPlayLabel}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedGameInstructions(null)}
                                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                        >
                                            <X size={24} className="text-slate-400" />
                                        </button>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {selectedGameInstructions.howToPlay}
                                        </p>
                                    </div>
                                    <div className="mt-8">
                                        <button
                                            onClick={() => setSelectedGameInstructions(null)}
                                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                                        >
                                            {t.works.closeLabel}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default Works;
