export type Language = 'en' | 'ja';

export const translations = {
  en: {
    hero: {
      title1: "Designing the Future",
      title2: "With AI & Engineering",
      description: "Bridging the gap between mechanical engineering and software innovation through the power of Generative AI.",
      button: "View My Work"
    },
    about: {
      title: "About Me",
      description1: "With over 10 years of experience in the mechanical design and development industry, I have cultivated a unique blend of engineering and software skills. I initiated and developed internal software solutions to streamline business operations, gaining practical programming expertise along the way.",
      description2: "Currently, I am focused on exploring the potential of Generative AI, aiming to stay at the forefront of this technological revolution. This portfolio showcases projects created through the collaborative power of human creativity and AI assistant."
    },
    works: {
      title: "Selected Works",
      description: "A collection of projects ranging from business automation tools to interactive games, built with modern technology and AI support.",
      items: [
        {
          id: 1,
          title: "Business Efficiency Apps",
          category: "Desktop Application",
          description: "Custom applications designed to automate workflows and optimize internal processes, significantly reducing manual tasks.",
          link: "#"
        },
        {
          id: 2,
          title: "CAD Add-ins & Macros",
          category: "Engineering Tool",
          description: "Plugins and VBA macros developed to extend 2D/3DCAD functionalities, enhancing design engineering productivity.",
          link: "#"
        },
        {
          id: 3,
          title: "Gravity Swap",
          category: "Browser Game",
          description: "An action-puzzle game where you control gravity. Built entirely with the assistance of Generative AI.",
          link: "/games/gravity-swap/index.html"
        },
        {
          id: 4,
          title: "Gravity Swap 2",
          category: "Browser Game",
          description: "The sequel to Gravity Swap with enhanced mechanics and more challenging levels.",
          link: "/games/gravity-swap-2/index.html"
        },
        {
          id: 5,
          title: "Gravity Swap 3",
          category: "Browser Game",
          description: "The latest installment featuring new puzzle elements and advanced gravity manipulation.",
          link: "/games/gravity-swap-3/index.html"
        }
      ]
    },
    contact: {
      title: "Get In Touch",
      description: "Interested in collaboration or have a question? Feel free to reach out."
    }
  },
  ja: {
    hero: {
      title1: "未来を形にする",
      title2: "AIとエンジニアリングの融合",
      description: "機械設計のバックグラウンドと最新の生成AI技術を掛け合わせ、新しい価値を創造します。",
      button: "実績を見る"
    },
    about: {
      title: "私について",
      description1: "約10年にわたり、機械設計・開発企業にてキャリアを積んでまいりました。本業の傍ら、業務効率化を目的とした社内用ソフトウェアの開発を主導し、実務の中でプログラミングスキルを磨いてきました。",
      description2: "現在は、急速に進化する生成AI技術に強い関心を持ち、「AIと共創する開発」をテーマに学習と実践を重ねています。本サイトでは、AIのサポートを最大限に活用しながら制作したプロダクトをご紹介いたします。"
    },
    works: {
      title: "制作実績",
      description: "業務効率化ツールからエンターテインメントまで、技術とAIを活用した多様なプロジェクト。",
      items: [
        {
          id: 1,
          title: "業務効率化アプリ",
          category: "デスクトップアプリ",
          description: "社内業務の自動化・効率化を実現するカスタムアプリケーション。手作業を削減し、業務フローを最適化しました。",
          link: "#"
        },
        {
          id: 2,
          title: "CADアドイン・マクロ",
          category: "設計支援ツール",
          description: "2D/3DCADの機能を拡張するプラグインおよびExcelマクロ。設計開発プロセスの工数短縮に貢献しました。",
          link: "#"
        },
        {
          id: 3,
          title: "Gravity Swap",
          category: "ブラウザゲーム",
          description: "重力を操作して進むアクションパズルゲーム。企画から実装まで、生成AIのサポートを受けて制作しました。",
          link: "/games/gravity-swap/index.html"
        },
        {
          id: 4,
          title: "Gravity Swap 2",
          category: "ブラウザゲーム",
          description: "Gravity Swapの続編。ギミックが強化され、より戦略的な重力操作が求められる新ステージを追加しました。",
          link: "/games/gravity-swap-2/index.html"
        },
        {
          id: 5,
          title: "Gravity Swap 3",
          category: "ブラウザゲーム",
          description: "シリーズ最新作。新しいパズル要素と洗練された操作感で、究極の重力アクション体験を提供します。",
          link: "/games/gravity-swap-3/index.html"
        }
      ]
    },
    contact: {
      title: "お問い合わせ",
      description: "新しいプロジェクトや技術的なご相談など、お気軽にお問い合わせください。"
    }
  }
};
