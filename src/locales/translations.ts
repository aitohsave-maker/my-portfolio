export type Language = 'en' | 'ja';

export const translations = {
  en: {
    hero: {
      title1: "Designing the Future",
      title2: "One Pixel at a Time",
      description: "Hi, I'm a Frontend Engineer & Web Designer passionate about creating immersive digital experiences.",
      button: "View My Work"
    },
    about: {
      title: "About Me",
      description1: "I am a dedicated Frontend Engineer with a keen eye for design. With over 5 years of experience in building responsive and accessible web applications, I bridge the gap between engineering and aesthetics. I specialize in React, TypeScript, and modern CSS frameworks like Tailwind.",
      description2: "When I'm not coding, you can find me exploring new design trends, contributing to open source, or brewing the perfect cup of coffee."
    },
    works: {
      title: "Selected Works",
      description: "A small selection of projects that showcase my passion for clean code and user-centric design.",
      items: [
        {
          id: 1,
          title: "E-Commerce Platform",
          category: "Web Application",
          description: "A full-featured online store built with Next.js and Stripe integration."
        },
        {
          id: 2,
          title: "Task Management App",
          category: "Productivity Tool",
          description: "Real-time collaboration tool with drag-and-drop kanban boards."
        },
        {
          id: 3,
          title: "Travel Portfolio",
          category: "Photography Website",
          description: "Immersive gallery showcasing travel photography from around the world."
        }
      ]
    },
    contact: {
      title: "Get In Touch",
      description: "I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions."
    }
  },
  ja: {
    hero: {
      title1: "未来をデザインする",
      title2: "1ピクセルに魂を込めて",
      description: "フロントエンドエンジニア / Webデザイナー。没入感のあるデジタル体験を創造することに情熱を注いでいます。",
      button: "実績を見る"
    },
    about: {
      title: "私について",
      description1: "デザインへのこだわりを持つフロントエンドエンジニアです。5年以上のWebアプリケーション開発経験を持ち、エンジニアリングとデザインの架け橋となることを目指しています。React, TypeScript, Tailwind CSS等のモダンな技術を得意としています。",
      description2: "コーディング以外では、新しいデザイントレンドの探求、オープンソースへの貢献、そして完璧なコーヒーを淹れることに時間を費やしています。"
    },
    works: {
      title: "制作実績",
      description: "クリーンなコードとユーザー中心のデザインへのこだわりを体現したいくつかのプロジェクトをご紹介します。",
      items: [
        {
          id: 1,
          title: "Eコマースプラットフォーム",
          category: "Webアプリケーション",
          description: "Next.jsとStripe決済を統合した多機能オンラインストア。"
        },
        {
          id: 2,
          title: "タスク管理アプリ",
          category: "生産性向上ツール",
          description: "ドラッグ＆ドロップで操作可能なカンバンボードを備えたリアルタイムコラボレーションツール。"
        },
        {
          id: 3,
          title: "トラベルポートフォリオ",
          category: "写真ギャラリー",
          description: "世界中の旅行写真を展示する、没入感のあるギャラリーサイト。"
        }
      ]
    },
    contact: {
      title: "お問い合わせ",
      description: "新しいプロジェクト、創造的なアイデア、ビジネスの機会について、いつでもお気軽にご相談ください。"
    }
  }
};
