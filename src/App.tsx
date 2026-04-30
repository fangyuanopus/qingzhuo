import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';

const asset = (name: string) => `/assets/qingzhuo/${name}`;
const logoUrl = asset('logo-transparent.png');

const videoUrl =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4';

const navItems = [
  { label: '品牌', target: 'brand' },
  { label: '标志', target: 'logo' },
  { label: '产品', target: 'products' },
  { label: '科技', target: 'formula' },
  { label: '场景', target: 'scenes' },
  { label: '定价', target: 'plans' },
  { label: '团队', target: 'team' },
];

const proofItems = ['深层洁净', '茶皂素灵感', '浓缩配方', '护色护纤', '低泡易漂', '持久留香'];

const products = [
  { name: '深层洁净洗衣液', imageDark: asset('product-front-transparent.png'), imageLight: asset('product-front-with-bg.png'), meta: '2kg / 家庭常备', text: '黑瓶主款，深层去渍、护色护纤、持久留香。' },
  { name: '茶叶标签竖版', imageDark: asset('product-botanical-transparent.png'), imageLight: asset('product-botanical-with-bg.png'), meta: '植物灵感版本', text: '茶皂素复配灵感，植物清新与科技感并存。' },
  { name: '自然白标展示', imageDark: asset('product-white-transparent.png'), imageLight: asset('product-white-with-bg.png'), meta: '清爽家居版本', text: '柔和浅色表达，适合家庭洗护场景。' },
];

const benefitCards = [
  { title: '深层去渍', image: asset('promo-deep-clean.png'), text: '水流冲击，洁净看得见。' },
  { title: '浓缩省量', image: asset('promo-concentrated.png'), text: '2kg 大容量，家庭常备。' },
  { title: '护色护纤', image: asset('promo-color-care.png'), text: '柔顺不伤衣，色彩鲜亮。' },
  { title: '持久留香', image: asset('promo-fragrance.png'), text: '清新怡人，持久芬芳。' },
];

const formulaItems = [
  { name: '主表活体系', desc: 'AES / AEO-9 等表面活性剂复配。' },
  { name: '温和复配', desc: 'CAB / BS / 6501 辅助体系。' },
  { name: '茶皂素灵感', desc: '天然茶皂素，植物洁净力。' },
  { name: '洗护测试', desc: '去渍、泡沫、漂洗、手感验证。' },
];

const sceneCards = [
  { title: '洗衣机旁', image: asset('scene-laundry-room.png'), text: '家庭洗衣动线。' },
  { title: '倒入量杯', image: asset('scene-pouring-cap.png'), text: '浓缩配方，用量精准。' },
  { title: '床品毛巾', image: asset('scene-bedroom-linen.png'), text: '舒适洁净，柔软呵护。' },
  { title: '浅色织物', image: asset('scene-folded-green.png'), text: '清浅色调，自然清新。' },
];

const planCards = [
  { name: '日常家庭装', price: '2kg', text: '日常衣物、床品、毛巾。' },
  { name: '双瓶囤货装', price: '2kg × 2', text: '家庭周期采购。' },
  { name: '课程展示装', price: '待定', text: '实验汇报与团队答辩。' },
];

const teamMembers = {
  leadership: [
    { name: '苏俊朋', role: '厂长' },
    { name: '黄鑫涛', role: '秘书' },
  ],
  departments: [
    { dept: '研发部门', members: ['李雅凡', '温碧连'] },
    { dept: '技术部门', members: ['李丕栾', '饶江颖', '盛建慧'] },
    { dept: '质量控制(QC)', members: ['林劲松', '李绍谦'] },
    { dept: '质量分析(QA)', members: ['陈芝瀚', '何文杰'] },
    { dept: '投料工人', members: ['陈芷垚', '林堃'] },
    { dept: '广宣部门', members: ['陈筱攸', '蓝宇婧'] },
    { dept: '宣传部门', members: ['林烨', '许伊雯'] },
    { dept: '策划部门', members: ['郑毅鑫', '蒋晨曦'] },
    { dept: '法务部门', members: ['阮江云', '张雪蕊'] },
    { dept: '财务部门', members: ['文缘', '曾鑫杰'] },
    { dept: '采购部门', members: ['宋昊城', '吴鸿林'] },
    { dept: '仓库管理', members: ['苏心莹', '赵雯静'] },
  ],
  advisor: { name: '卢玉栋', title: '外部专家' },
};

const imageMarquee = [
  asset('banner-fabric-product.png'),
  asset('promo-family-value.png'),
  asset('formula-lab-product.png'),
  asset('macro-fabric-dropper.png'),
  asset('scene-folded-close.png'),
  asset('promo-powerful-black.png'),
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Hooks ──────────────────────────────────────────────────────────

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('qingzhuo-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggle = useCallback(() => setDark((d) => !d), []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('qingzhuo-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle };
}

function useFadingVideo(maxOpacity = 0.42) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const fadeSeconds = 0.5;
    let animationFrame = 0;
    let restartTimer: number | undefined;

    const tick = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration > 0) {
        const fadeIn = Math.min(maxOpacity, video.currentTime / fadeSeconds);
        const fadeOut = Math.min(maxOpacity, Math.max(0, (duration - video.currentTime) / fadeSeconds));
        video.style.opacity = String(Math.min(fadeIn, fadeOut));
      }
      animationFrame = window.requestAnimationFrame(tick);
    };

    const restart = () => {
      video.style.opacity = '0';
      restartTimer = window.setTimeout(() => {
        video.currentTime = 0;
        void video.play().catch(() => undefined);
      }, 100);
    };

    const play = () => void video.play().catch(() => undefined);
    video.addEventListener('ended', restart);
    video.addEventListener('loadeddata', play, { once: true });
    animationFrame = window.requestAnimationFrame(tick);
    play();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (restartTimer) window.clearTimeout(restartTimer);
      video.removeEventListener('ended', restart);
      video.removeEventListener('loadeddata', play);
    };
  }, [maxOpacity]);

  return videoRef;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

function useScrollSpy(sectionIds: string[]) {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: '-40% 0px -55% 0px' },
      );
      observer.observe(el);
      observers.push(observer);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  return active;
}

function useScrollProgress() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrolled, progress };
}

// ─── 共享组件 ────────────────────────────────────────────────────────

function AnimateIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useInView(0.1);
  const delayClass = delay > 0 && delay <= 6 ? `stagger-${delay}` : '';
  return (
    <div ref={ref} className={`animate-in ${delayClass} ${className}`}>
      {children}
    </div>
  );
}

// ─── 页面组件 ────────────────────────────────────────────────────────

function Navbar({ dark, toggle, activeSection, scrolled }: { dark: boolean; toggle: () => void; activeSection: string; scrolled: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (target: string) => {
    scrollToSection(target);
    setMobileOpen(false);
  };

  return (
    <header className={`fixed left-0 right-0 top-0 z-20 transition-all duration-400 ${scrolled ? 'nav-glass' : ''}`}>
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5 sm:px-10" aria-label="清濯主导航">
        <button
          aria-label="回到清濯首页"
          className="inline-flex shrink-0 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          type="button"
        >
          <img className="h-8 w-auto max-w-[11rem] object-contain" src={dark ? logoUrl : asset('logo-with-bg.png')} alt="清濯 QINGZHUO" />
        </button>

        {/* 桌面导航 */}
        <div className="hidden items-center justify-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              className={`inline-flex items-center gap-1.5 font-body text-step--1 tracking-wide transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                activeSection === item.target ? 'text-foreground' : 'text-foreground/45 hover:text-foreground/80'
              }`}
              key={item.label}
              onClick={() => scrollToSection(item.target)}
              type="button"
            >
              {item.label}
              {activeSection === item.target && (
                <span className="block h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            aria-label={dark ? '切换为日间模式' : '切换为夜间模式'}
            className="inline-flex size-10 items-center justify-center rounded-full text-foreground/60 transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={toggle}
            type="button"
          >
            {dark ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
          </button>

          <button
            aria-label={mobileOpen ? '关闭导航菜单' : '打开导航菜单'}
            className="inline-flex size-10 items-center justify-center rounded-full text-foreground/60 transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            type="button"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <Button className="hidden h-auto shrink-0 rounded-full px-6 py-2.5 text-step--1 tracking-wider font-body md:inline-flex" onClick={() => scrollToSection('team')} size="sm" type="button" variant="heroSecondary">
            联系合作
          </Button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-30 border-b border-foreground/10 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-0 px-6 py-5">
            {navItems.map((item) => (
              <button
                className={`flex items-center gap-3 py-3 text-left font-body text-step-0 transition-colors duration-300 ${
                  activeSection === item.target
                    ? 'text-foreground'
                    : 'text-foreground/50 hover:text-foreground/80'
                }`}
                key={item.label}
                onClick={() => handleNav(item.target)}
                type="button"
              >
                {activeSection === item.target && <span className="block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />}
                {item.label}
              </button>
            ))}
            <Button className="mt-3 h-auto rounded-full px-6 py-2.5 text-step--1 tracking-wider font-body" onClick={() => handleNav('team')} type="button" variant="heroSecondary">
              联系合作
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection({ dark, toggle, activeSection, scrolled }: { dark: boolean; toggle: () => void; activeSection: string; scrolled: boolean }) {
  const videoRef = useFadingVideo(0.72);
  const heroStats = ['2kg 家庭装', '茶皂素复配', '低泡易漂洗'];

  return (
    <section className="hero-canvas relative min-h-dvh overflow-hidden bg-background" id="brand">
      <video
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
        ref={videoRef}
        src={videoUrl}
        style={{ opacity: dark ? undefined : 0, display: dark ? undefined : 'none' }}
        tabIndex={-1}
      />
      <div className={`absolute inset-0 ${dark ? 'bg-[radial-gradient(circle_at_50%_34%,rgba(63,126,211,0.15),transparent_34rem),linear-gradient(180deg,rgba(7,1,14,0.35),rgba(7,1,14,0.55)_66%,rgba(7,1,14,0.88))]' : 'opacity-0'}`} />
      {!dark && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(120,180,160,0.1),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(100,160,140,0.08),transparent_50%),linear-gradient(180deg,hsl(150_8%_97%),hsl(150_7%_95%)_50%,hsl(150_6%_93%))]" />
      )}
      <Navbar dark={dark} toggle={toggle} activeSection={activeSection} scrolled={scrolled} />

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-86px)] w-full max-w-7xl items-center gap-12 px-6 pb-24 pt-28 md:grid-cols-[0.95fr_1.05fr] md:px-10 lg:gap-16">
        <div className="hero-copy text-left">
          <p className="hero-enter eyebrow-pill">
            <span className="mr-2.5 inline-block size-1.5 rounded-full bg-accent" aria-hidden="true" />
            茶皂素复配深层洁净洗衣液
          </p>

          <h1 className="hero-enter mt-10 max-w-4xl text-balance font-display text-step-6 font-normal text-gradient-green">
            清洁有度，
            <br />
            衣物如新。
          </h1>

          <p className="hero-enter mt-7 max-w-xl font-body text-step-0 leading-8 text-foreground/60">
            从植物茶皂素汲取灵感，以实验室配方平衡洁净力、柔和触感与留香表现，让日常洗护更轻盈。
          </p>

          <div className="hero-enter mt-11 flex w-full flex-col gap-4 sm:max-w-md sm:flex-row">
            <Button className="btn-glow h-auto rounded-full px-8 py-4" onClick={() => scrollToSection('products')} type="button" variant="hero">
              探索产品
              <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Button>
            <Button className="btn-glow h-auto rounded-full px-8 py-4" onClick={() => scrollToSection('formula')} type="button" variant="heroSecondary">
              查看配方
            </Button>
          </div>
        </div>

        <div className="hero-enter hero-product-stage" aria-label="清濯洗衣液主视觉">
          <div className="hero-product-backdrop" aria-hidden="true" />
          <div className="hero-product-card">
            <span className="product-edition">QINGZHUO / DAILY CARE</span>
            <img
              alt="清濯茶皂素复配深层洁净洗衣液"
              className="hero-product-bottle"
              src={dark ? asset('product-front-transparent.png') : asset('product-front-with-bg.png')}
            />
          </div>
          <div className="hero-side-note">
            <span>BOTANICAL FORMULA</span>
            <strong>洁净力与轻柔感并重</strong>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-foreground/8 bg-background/60 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl md:grid-cols-3">
          {heroStats.map((value, i) => (
            <div className={`px-8 py-9 text-center ${i < 2 ? 'border-foreground/8 md:border-r' : ''}`} key={value}>
              <strong className="block font-display text-step-4 font-normal text-foreground/80">{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function ProofMarquee() {
  return (
    <section className="relative w-full overflow-hidden border-y border-foreground/8 bg-background py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 md:flex-row md:gap-14">
        <p className="shrink-0 whitespace-nowrap text-center text-step--1 leading-7 text-foreground/50 md:text-left">
          清濯的展示重点
          <br />
          洁净、配方、场景
        </p>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-16">
            {[...proofItems, ...proofItems].map((item, index) => (
              <div className="flex shrink-0 items-center gap-3" key={`${item}-${index}`}>
                <span className="font-body text-step-0 font-medium text-foreground/60">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoSection({ dark }: { dark: boolean }) {
  const logoElements = [
    { kicker: '01', title: '水滴主体', desc: '水的力量，品牌识别基底。' },
    { kicker: '02', title: '原子轨道', desc: '化学学术背景，配方科学显性化。' },
    { kicker: '03', title: '中央星光', desc: '深层洁净、亮泽护色的记忆点。' },
    { kicker: '04', title: '水流弧线', desc: '洗护动作的延展感。' },
  ];

  const colorTokens = [
    { name: '深海军蓝', hex: '#1B2A55', desc: '专业、信任，品牌主调。', sample: 'bg-[#1B2A55]' },
    { name: '银白渐变', hex: 'F4F6FA → C7CDD8', desc: '科技洁净，金属层次。', sample: 'bg-gradient-to-br from-[#F4F6FA] to-[#C7CDD8]' },
    { name: '靛影', hex: '#0B1230', desc: '深度阴影，品牌重量。', sample: 'bg-[#0B1230]' },
  ];

  return (
    <section className="section-breath relative bg-background px-6 md:px-10" id="logo">
      <div className="glow-orb left-[-10%] top-[10%] h-[400px] w-[400px] bg-emerald-300" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-14 grid gap-6 md:grid-cols-[0.85fr_1fr] md:items-end">
            <div>
              <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Brand Identity</p>
              <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">
                一颗水滴，承载洁净科学。
              </h2>
            </div>
            <p className="font-body text-pretty text-step-0 leading-8 text-muted-foreground">
              水滴、原子轨道、星光与水流弧线，把"洁净"与"科学"凝结进一个图形。
            </p>
          </div>
        </AnimateIn>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
          <AnimateIn>
            <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl p-10 ${dark ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-black' : 'bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30'}`}>
              <img alt="清濯品牌主标志" className="w-full max-w-md object-contain" src={dark ? asset('logo-transparent.png') : asset('logo-with-bg.png')} />
              <span className="absolute left-6 top-6 font-body text-step--2 font-medium tracking-widest text-foreground/30 uppercase">Primary Mark</span>
            </div>
          </AnimateIn>

          <div className="grid gap-4 sm:grid-cols-2">
            {logoElements.map((el, i) => (
              <AnimateIn key={el.kicker} delay={i + 1}>
                <article className="liquid-glass flex h-full flex-col rounded-2xl p-6">
                  <span className="font-body text-step--2 font-medium tracking-widest text-accent">{el.kicker}</span>
                  <h3 className="font-display mt-3 text-step-1 font-normal text-foreground">{el.title}</h3>
                  <p className="font-body mt-3 text-step-0 leading-7 text-muted-foreground">{el.desc}</p>
                </article>
              </AnimateIn>
            ))}
          </div>
        </div>

        <AnimateIn>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {colorTokens.map((c) => (
              <div className="liquid-glass rounded-2xl p-6" key={c.name}>
                <p className="font-body text-step--2 font-medium tracking-widest text-accent uppercase">Palette</p>
                <div className="mt-4 flex items-center gap-4">
                  <span aria-hidden="true" className={`block size-12 rounded-xl ${c.sample}`} />
                  <div>
                    <strong className="font-body block text-step-0 font-medium text-foreground">{c.name}</strong>
                    <code className="font-body text-step--2 text-muted-foreground">{c.hex}</code>
                  </div>
                </div>
                <p className="font-body mt-4 text-step-0 leading-7 text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </AnimateIn>

        <AnimateIn>
          <div className="mt-10 grid gap-4 md:grid-cols-[1fr_1.4fr]">
            <div className="liquid-glass rounded-2xl p-7">
              <p className="font-body text-step--2 font-medium tracking-widest text-accent uppercase">Wordmark</p>
              <strong className="font-display mt-4 block text-step-5 font-normal text-foreground">清濯</strong>
              <p className="font-body mt-4 text-step-0 leading-7 text-muted-foreground">
                取意"清水濯洗"。"清"承自《诗经》，"濯"出自《孟子》。宋体改造，洁净感与科研稳重并存。
              </p>
            </div>
            <div className="rounded-2xl border border-foreground/8 p-7">
              <p className="font-body text-step--2 font-medium tracking-widest text-accent uppercase">Endorsement</p>
              <p className="font-display mt-4 text-step-2 font-normal leading-relaxed text-foreground">
                福建师范大学
                <br />
                化学与材料学院 · 应用化学专业
              </p>
              <p className="font-body mt-4 text-step-0 leading-7 text-muted-foreground">
                配方研发 → 产品命名 → 专业背书，三层信任结构。
              </p>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function ProductSection({ dark }: { dark: boolean }) {
  const [featuredProduct, ...supportProducts] = products;

  return (
    <section className="section-breath relative section-alt px-6 md:px-10" id="products">
      <div className="glow-orb right-[-5%] top-[20%] h-[350px] w-[350px] bg-teal-300" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Our Product</p>
              <h2 className="font-display mt-3 max-w-3xl text-balance text-step-4 font-normal text-foreground">
                一支主推款，撑起清洁与洗护的日常仪式。
              </h2>
              <p className="mt-5 max-w-2xl font-body text-step-0 leading-8 text-muted-foreground">
                产品区改为主次分明的陈列，让包装、容量和配方卖点先被看见，再展开不同视觉版本。
              </p>
            </div>
            <Button className="h-auto self-start rounded-full px-5 py-2.5 md:self-auto" onClick={() => scrollToSection('scenes')} type="button" variant="heroSecondary">
              看使用场景
            </Button>
          </div>
        </AnimateIn>

        {featuredProduct && (
          <AnimateIn>
            <article className="product-hero-card">
              <div className={`product-hero-visual ${dark ? 'product-hero-visual-dark' : ''}`}>
                <img
                  alt={`清濯${featuredProduct.name}`}
                  className="product-hero-image"
                  loading="lazy"
                  src={dark ? featuredProduct.imageDark : featuredProduct.imageLight}
                />
              </div>
              <div className="product-hero-copy">
                <p className="font-body text-step--1 font-medium tracking-wider text-accent uppercase">Signature Bottle</p>
                <h3 className="mt-4 font-display text-step-3 font-normal text-foreground">{featuredProduct.name}</h3>
                <p className="mt-4 font-body text-step-0 leading-8 text-muted-foreground">{featuredProduct.text}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {['深层洁净', '护色护纤', '持久留香'].map((item) => (
                    <span className="product-proof-chip" key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </article>
          </AnimateIn>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {supportProducts.map((product, i) => (
            <AnimateIn key={product.name} delay={i + 1}>
              <article className="product-support-card group text-card-foreground">
                <div className={`img-zoom product-support-visual ${dark ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-black' : 'bg-gradient-to-br from-emerald-50/50 to-teal-50/30'}`}>
                  <img
                    alt={`清濯${product.name}`}
                    className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                    loading="lazy"
                    src={dark ? product.imageDark : product.imageLight}
                  />
                </div>
                <div className="p-6">
                  <p className="font-body text-step--1 font-medium text-accent tracking-wide">{product.meta}</p>
                  <h3 className="font-display mt-2 text-step-1 font-normal text-foreground">{product.name}</h3>
                  <p className="font-body mt-3 text-step-0 leading-7 text-muted-foreground">{product.text}</p>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
function ImageMarquee() {
  return (
    <section className="overflow-hidden bg-background py-8" aria-label="清濯产品素材图带">
      <div className="flex w-max animate-marquee items-center gap-4">
        {[...imageMarquee, ...imageMarquee].map((image, index) => (
          <div
            aria-hidden="true"
            className="aspect-[4/3] h-56 shrink-0 overflow-hidden rounded-2xl md:h-64"
            key={`${image}-${index}`}
          >
            <img alt="" className="h-full w-full object-cover" loading="lazy" src={image} />
          </div>
        ))}
      </div>
    </section>
  );
}

function BenefitsSection({ dark }: { dark: boolean }) {
  const benefitProofs = ['洁净力可视化', '低泡好漂洗', '织物触感柔和', '留香克制清新'];

  return (
    <section className="section-breath relative bg-background px-6 md:px-10" id="benefits">
      <div className="glow-orb left-[5%] top-[30%] h-[300px] w-[300px] bg-emerald-200" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-12 grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Core Benefits</p>
              <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">把卖点变成可感知的洗护证据。</h2>
            </div>
            <p className="font-body text-step-0 leading-8 text-muted-foreground">
              不再平均堆叠海报，而是用画册式留白和证据标签，把“洁净、柔护、留香”串成一套更可信的品牌叙事。
            </p>
          </div>
        </AnimateIn>
        <div className="benefit-proof-bar">
          {benefitProofs.map((proof) => (
            <span key={proof}>{proof}</span>
          ))}
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-2">
          {benefitCards.map((card, i) => (
            <AnimateIn key={card.title} delay={i + 1}>
              <article className={`benefit-card group ${i === 0 ? 'md:row-span-2' : ''}`}>
                <div className={`benefit-image-wrap ${dark ? 'bg-slate-950' : 'bg-gray-50/50'}`}>
                  <img
                    alt={`清濯${card.title}卖点海报`}
                    className="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                    loading="lazy"
                    src={card.image}
                  />
                </div>
                <div className="border-t border-foreground/6 p-6">
                  <h3 className="font-display text-step-1 font-normal text-foreground">{card.title}</h3>
                  <p className="font-body mt-2 text-step-0 leading-7 text-muted-foreground">{card.text}</p>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
function FormulaSection() {
  return (
    <section className="section-breath relative section-alt px-6 md:px-10" id="formula">
      <div className="glow-orb right-[-8%] bottom-[10%] h-[350px] w-[350px] bg-cyan-300" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <AnimateIn>
          <div className="self-center">
            <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Formula</p>
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">
              科学配方，自然灵感。
            </h2>
            <p className="font-body mt-5 max-w-xl text-pretty text-step-0 leading-8 text-muted-foreground">
              茶皂素复配，温和洁净。
            </p>
            <div className="mt-8 grid gap-3">
              {formulaItems.map((item) => (
                <div className="liquid-glass rounded-2xl p-5" key={item.name}>
                  <p className="font-body font-medium text-foreground">{item.name}</p>
                  <p className="font-body mt-2 text-step-0 leading-7 text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
        <div className="grid gap-4 sm:grid-cols-2">
          {[asset('formula-lab-product.png'), asset('formula-test-bench.png'), asset('macro-fabric-dropper.png'), asset('macro-tea-saponin-dish.png')].map((image, index) => (
            <AnimateIn key={image} delay={index + 1}>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  alt={`清濯配方与微距素材 ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  src={image}
                />
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScenesSection() {
  return (
    <section className="section-breath relative bg-background px-6 md:px-10" id="scenes">
      <div className="glow-orb left-[-5%] bottom-[20%] h-[300px] w-[300px] bg-emerald-300" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-12">
            <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Daily Use</p>
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">真实使用场景。</h2>
          </div>
        </AnimateIn>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {sceneCards.map((scene, i) => (
            <AnimateIn key={scene.title} delay={i + 1}>
              <article className="card-premium group">
                <div className="img-zoom aspect-[4/3]">
                  <img alt={`清濯${scene.title}使用场景`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" src={scene.image} />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-step-0 font-normal text-foreground">{scene.title}</h3>
                  <p className="font-body mt-2 text-step-0 leading-7 text-muted-foreground">{scene.text}</p>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlansSection() {
  return (
    <section className="section-breath relative section-alt px-6 md:px-10" id="plans">
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Plans</p>
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">产品规格。</h2>
          </div>
        </AnimateIn>
        <div className="grid gap-5 md:grid-cols-3">
          {planCards.map((plan, i) => (
            <AnimateIn key={plan.name} delay={i + 1}>
              <article className="card-premium p-8">
                <p className="font-body text-step--1 font-medium tracking-wide text-accent">{plan.name}</p>
                <strong className="font-display mt-6 block text-step-5 font-normal text-foreground">{plan.price}</strong>
                <p className="font-body mt-6 text-step-0 leading-7 text-muted-foreground">{plan.text}</p>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="section-breath relative bg-background px-6 md:px-10" id="team">
      <div className="glow-orb right-[10%] top-[15%] h-[250px] w-[250px] bg-teal-200" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-12">
            <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Team</p>
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">清濯团队。</h2>
          </div>
        </AnimateIn>

        <AnimateIn>
          <div className="mb-10 flex flex-wrap gap-4">
            {teamMembers.leadership.map((m) => (
              <div className="liquid-glass rounded-2xl px-7 py-5" key={m.name}>
                <p className="font-body text-step--2 font-medium tracking-widest text-accent uppercase">{m.role}</p>
                <p className="font-display mt-2 text-step-1 font-normal text-foreground">{m.name}</p>
              </div>
            ))}
            <div className="liquid-glass rounded-2xl px-7 py-5">
              <p className="font-body text-step--2 font-medium tracking-widest text-accent uppercase">{teamMembers.advisor.title}</p>
              <p className="font-display mt-2 text-step-1 font-normal text-foreground">{teamMembers.advisor.name} 老师</p>
            </div>
          </div>
        </AnimateIn>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.departments.map((d, i) => (
            <AnimateIn key={d.dept} delay={(i % 3) + 1}>
              <article className="rounded-2xl border border-foreground/8 p-6">
                <p className="font-body text-step--2 font-medium tracking-widest text-accent uppercase">{d.dept}</p>
                <p className="font-body mt-3 text-step-0 font-medium text-foreground/70">{d.members.join('、')}</p>
              </article>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn>
          <div className="mt-14 rounded-2xl border border-foreground/8 p-10 text-center">
            <p className="font-body text-step--1 text-muted-foreground/70 tracking-wide">福建师范大学 · 化学与材料学院 · 应用化学专业</p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-foreground/8 bg-card/30 px-6 py-14 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <img className="mb-5 h-8 w-auto object-contain" src={asset('logo-with-bg.png')} alt="清濯" />
          <p className="font-body text-step--1 leading-8 text-muted-foreground">
            茶皂素复配深层洁净洗衣液
            <br />
            福建师范大学 · 化学与材料学院
          </p>
        </div>
        <div>
          <p className="font-body text-step--1 font-medium text-foreground">导航</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {navItems.map((item) => (
              <button
                className="font-body text-step--1 text-left text-muted-foreground transition-colors duration-300 hover:text-foreground"
                key={item.label}
                onClick={() => scrollToSection(item.target)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-body text-step--1 font-medium text-foreground">关于</p>
          <p className="font-body mt-4 text-step--1 leading-8 text-muted-foreground">
            本项目为福建师范大学应用化学专业精细平化学实验课程作品，展示茶皂素复配洗衣液的品牌设计、配方研发与产品落地。
          </p>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-foreground/8 pt-8 text-center">
        <p className="font-body text-step--2 text-muted-foreground/50 tracking-wide">
          &copy; 2026 清濯 QINGZHUO &middot; 福建师范大学化学与材料学院
        </p>
      </div>
    </footer>
  );
}

// ─── 根组件 ──────────────────────────────────────────────────────────

const sectionIds = ['brand', 'logo', 'products', 'formula', 'scenes', 'plans', 'team'];

function App() {
  const { dark, toggle } = useDarkMode();
  const activeSection = useScrollSpy(sectionIds);
  const { scrolled, progress } = useScrollProgress();

  return (
    <main>
      <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <HeroSection dark={dark} toggle={toggle} activeSection={activeSection} scrolled={scrolled} />
      <ProofMarquee />
      <LogoSection dark={dark} />
      <ProductSection dark={dark} />
      <ImageMarquee />
      <BenefitsSection dark={dark} />
      <FormulaSection />
      <ScenesSection />
      <PlansSection />
      <TeamSection />
      <Footer />
    </main>
  );
}

export default App;
