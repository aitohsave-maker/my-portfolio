import { LanguageProvider } from './contexts/LanguageContext';
import Hero from './components/Hero';
import About from './components/About';
import Works from './components/Works';
import Contact from './components/Contact';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  return (
    <LanguageProvider>
      <main className="min-h-screen bg-white relative">
        <LanguageSwitcher />
        <Hero />
        <Works />
        <About />
        <Contact />
      </main>
    </LanguageProvider>
  );
}

export default App;
