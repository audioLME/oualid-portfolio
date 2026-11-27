// Site translations (EN / FR / AR) and the language switch.
// Any element with data-i18n="key" gets its text from the dictionary below.
// Project texts live in data/projects.json, not here.
(function () {
  'use strict';

  const LANGS = ['en', 'fr', 'ar'];
  const LABELS = { en: 'EN', fr: 'FR', ar: 'ع' };
  const LOCALES = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' };

  const STRINGS = {
    en: {
      'nav.resume': 'RESUME',
      'nav.portfolio': 'PORTFOLIO',
      'nav.contact': 'CONTACT',
      'nav.label': 'Main navigation',
      'lang.label': 'Language',
      'time.place': 'Algeria',
      'hero.words': ['OUALID', 'ARCHITECT', 'DESIGNER', '3D ARTIST'],
      'hero.quote': 'I wander through ideas until one refuses to let me go, when curiosity becomes obsession, depth follows — and so does my best work.',
      'hero.continue': 'CONTINUE',
      'hero.continueLabel': 'Continue to profile',

      'profile.title': 'Profile',
      'profile.lead': 'Architect, designer and 3D artist. I design interiors, workplaces and outdoor spaces, and I visualise them before they are built.',
      'profile.bio': 'Every project starts with the people who will use the space: how they move, where the light falls, what they need to feel at home or focused. From the first sketch to the final render, I keep the drawing and the experience in the same hand.',
      'profile.disciplines': 'Disciplines',
      'profile.d1': 'Interior architecture',
      'profile.d2': 'Workplace design',
      'profile.d3': 'Landscape design',
      'profile.d4': '3D visualisation',
      'profile.tools': 'Tools',
      'profile.cv': 'CV coming soon',
      'profile.seeWork': 'See the work',

      'portfolio.title': 'Selected work',
      'portfolio.intro': 'Interiors, workplaces and landscapes. Each project starts from how people will actually live in the space.',
      'portfolio.view': 'View project',
      'portfolio.count': 'projects',

      'project.back': 'All projects',
      'project.about': 'About the project',
      'project.type': 'Type',
      'project.year': 'Year',
      'project.area': 'Area',
      'project.status': 'Status',
      'project.next': 'Next project',
      'project.notFound': 'This project does not exist (yet).',
      'project.credit': 'Placeholder photos from Unsplash.',
      'project.close': 'Close',
      'project.prev': 'Previous image',
      'project.nextImg': 'Next image',

      'contact.title': "Let's talk",
      'contact.intro': 'A project, a collaboration or a simple question: write to me and I will get back to you.',
      'contact.email': 'Email',
      'contact.copy': 'Copy',
      'contact.copied': 'Copied',
      'contact.write': 'Write to me',
      'contact.follow': 'Elsewhere',

      'footer.rights': 'All rights reserved.'
    },

    fr: {
      'nav.resume': 'CV',
      'nav.portfolio': 'PORTFOLIO',
      'nav.contact': 'CONTACT',
      'nav.label': 'Navigation principale',
      'lang.label': 'Langue',
      'time.place': 'Algérie',
      'hero.words': ['OUALID', 'ARCHITECTE', 'DESIGNER', 'ARTISTE 3D'],
      'hero.quote': "J'erre parmi les idées jusqu'à ce que l'une refuse de me lâcher ; quand la curiosité devient obsession, la profondeur suit — et mon meilleur travail aussi.",
      'hero.continue': 'CONTINUER',
      'hero.continueLabel': 'Continuer vers le profil',

      'profile.title': 'Profil',
      'profile.lead': "Architecte, designer et artiste 3D. Je conçois des intérieurs, des espaces de travail et des extérieurs, et je les visualise avant qu'ils ne soient construits.",
      'profile.bio': "Chaque projet commence par les personnes qui vont vivre l'espace : comment elles s'y déplacent, où tombe la lumière, ce dont elles ont besoin pour se sentir chez elles ou concentrées. Du premier croquis au rendu final, le dessin et l'expérience restent dans la même main.",
      'profile.disciplines': 'Disciplines',
      'profile.d1': "Architecture d'intérieur",
      'profile.d2': 'Aménagement de bureaux',
      'profile.d3': 'Architecture paysagère',
      'profile.d4': 'Visualisation 3D',
      'profile.tools': 'Outils',
      'profile.cv': 'CV bientôt disponible',
      'profile.seeWork': 'Voir les projets',

      'portfolio.title': 'Projets choisis',
      'portfolio.intro': "Intérieurs, bureaux et paysages. Chaque projet part de la façon dont on vivra réellement l'espace.",
      'portfolio.view': 'Voir le projet',
      'portfolio.count': 'projets',

      'project.back': 'Tous les projets',
      'project.about': 'Le projet',
      'project.type': 'Type',
      'project.year': 'Année',
      'project.area': 'Surface',
      'project.status': 'Statut',
      'project.next': 'Projet suivant',
      'project.notFound': "Ce projet n'existe pas (encore).",
      'project.credit': 'Photos provisoires : Unsplash.',
      'project.close': 'Fermer',
      'project.prev': 'Image précédente',
      'project.nextImg': 'Image suivante',

      'contact.title': 'Parlons-en',
      'contact.intro': 'Un projet, une collaboration ou une simple question : écrivez-moi, je vous répondrai rapidement.',
      'contact.email': 'E-mail',
      'contact.copy': 'Copier',
      'contact.copied': 'Copié',
      'contact.write': "M'écrire",
      'contact.follow': 'Ailleurs',

      'footer.rights': 'Tous droits réservés.'
    },

    ar: {
      'nav.resume': 'السيرة',
      'nav.portfolio': 'الأعمال',
      'nav.contact': 'تواصل',
      'nav.label': 'التنقل الرئيسي',
      'lang.label': 'اللغة',
      'time.place': 'الجزائر',
      // The big animated name stays in Latin letters: Arabic letters cannot be
      // split one by one without breaking how they join.
      'hero.words': ['OUALID', 'ARCHITECT', 'DESIGNER', '3D ARTIST'],
      'hero.quote': 'أتجوّل بين الأفكار حتى تأبى إحداها أن تتركني؛ وحين يصير الفضول شغفًا، يأتي العمق، ومعه أفضل أعمالي.',
      'hero.continue': 'متابعة',
      'hero.continueLabel': 'المتابعة إلى الملف الشخصي',

      'profile.title': 'نبذة',
      'profile.lead': 'مهندس معماري ومصمم وفنان ثلاثي الأبعاد. أصمم الفضاءات الداخلية وأماكن العمل والمساحات الخارجية، وأجسّدها بصريًا قبل أن تُبنى.',
      'profile.bio': 'يبدأ كل مشروع بالأشخاص الذين سيعيشون فيه: كيف يتنقلون، وأين يسقط الضوء، وما الذي يحتاجونه ليشعروا بالراحة أو التركيز. من الرسم الأول إلى الصورة النهائية، يبقى التصميم والتجربة في يد واحدة.',
      'profile.disciplines': 'التخصصات',
      'profile.d1': 'العمارة الداخلية',
      'profile.d2': 'تصميم أماكن العمل',
      'profile.d3': 'تنسيق المساحات الخارجية',
      'profile.d4': 'التصوير ثلاثي الأبعاد',
      'profile.tools': 'الأدوات',
      'profile.cv': 'السيرة الذاتية قريبًا',
      'profile.seeWork': 'شاهد الأعمال',

      'portfolio.title': 'أعمال مختارة',
      'portfolio.intro': 'فضاءات داخلية ومكاتب ومساحات خضراء. ينطلق كل مشروع من الطريقة التي سيعيش بها الناس المكان فعلًا.',
      'portfolio.view': 'عرض المشروع',
      'portfolio.count': 'مشاريع',

      'project.back': 'كل المشاريع',
      'project.about': 'عن المشروع',
      'project.type': 'النوع',
      'project.year': 'السنة',
      'project.area': 'المساحة',
      'project.status': 'الحالة',
      'project.next': 'المشروع التالي',
      'project.notFound': 'هذا المشروع غير موجود (بعد).',
      'project.credit': 'صور مؤقتة من Unsplash.',
      'project.close': 'إغلاق',
      'project.prev': 'الصورة السابقة',
      'project.nextImg': 'الصورة التالية',

      'contact.title': 'لنتحدث',
      'contact.intro': 'مشروع، تعاون أو مجرد سؤال: راسلني وسأرد عليك في أقرب وقت.',
      'contact.email': 'البريد الإلكتروني',
      'contact.copy': 'نسخ',
      'contact.copied': 'تم النسخ',
      'contact.write': 'راسلني',
      'contact.follow': 'تابعني',

      'footer.rights': 'جميع الحقوق محفوظة.'
    }
  };

  function detect() {
    try {
      const saved = localStorage.getItem('lang');
      if (LANGS.includes(saved)) return saved;
    } catch (e) { /* storage blocked */ }
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.includes(nav) ? nav : 'en';
  }

  const I18N = {
    langs: LANGS,
    lang: detect(),
    get locale() { return LOCALES[this.lang]; },
    t(key) {
      const v = STRINGS[this.lang][key];
      return v !== undefined ? v : STRINGS.en[key];
    },
    // Pick the right language from a { en, fr, ar } object (project data)
    pick(obj) {
      if (obj == null || typeof obj !== 'object') return obj == null ? '' : obj;
      return obj[this.lang] || obj.en || '';
    },
    apply(root) {
      const html = document.documentElement;
      html.lang = this.lang;
      html.dir = this.lang === 'ar' ? 'rtl' : 'ltr';
      (root || document).querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = this.t(el.dataset.i18n);
      });
      (root || document).querySelectorAll('[data-i18n-label]').forEach(el => {
        el.setAttribute('aria-label', this.t(el.dataset.i18nLabel));
      });
      document.querySelectorAll('.lang-switch button').forEach(b => {
        b.setAttribute('aria-pressed', String(b.dataset.lang === this.lang));
      });
    },
    set(lang) {
      if (!LANGS.includes(lang) || lang === this.lang) return;
      this.lang = lang;
      try { localStorage.setItem('lang', lang); } catch (e) { /* ignore */ }
      this.apply();
      window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    }
  };

  function buildSwitch() {
    const header = document.querySelector('.site-header');
    if (!header || header.querySelector('.lang-switch')) return;
    const wrap = document.createElement('div');
    wrap.className = 'lang-switch';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('data-i18n-label', 'lang.label');
    LANGS.forEach(l => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.lang = l;
      b.textContent = LABELS[l];
      b.lang = l;
      b.addEventListener('click', e => { e.stopPropagation(); I18N.set(l); });
      wrap.appendChild(b);
    });
    // Sits next to the clock, in the right-hand group of the header
    const meta = header.querySelector('.meta');
    let group = header.querySelector('.header-end');
    if (!group) {
      group = document.createElement('div');
      group.className = 'header-end';
      header.insertBefore(group, meta);
      group.appendChild(meta);
    }
    group.appendChild(wrap);
  }

  // Set lang/dir as early as possible to avoid a flash of the wrong direction
  document.documentElement.lang = I18N.lang;
  document.documentElement.dir = I18N.lang === 'ar' ? 'rtl' : 'ltr';

  window.I18N = I18N;

  function init() { buildSwitch(); I18N.apply(); }
  // Loaded at the end of <body>, so the header already exists: build now so
  // page scripts that run right after (entry animations) can see the switch.
  if (document.querySelector('.site-header')) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
