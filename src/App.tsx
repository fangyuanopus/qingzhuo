import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, Sun, Moon, Menu, X, ChevronDown, Star, ShieldCheck, Leaf, FlaskConical, BadgeCheck, ShoppingBag } from 'lucide-react';
import { Button } from './components/ui/button';

const asset = (name: string) => `/assets/qingzhuo/${name}`;
const logoUrl = asset('logo-transparent.png');

const videoUrl =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4';

const navItems = [
  { label: '首页', target: 'brand' },
  { label: '产品', target: 'products' },
  { label: '安全保障', target: 'safety' },
  { label: '使用方法', target: 'how-it-works' },
  { label: '配方', target: 'formula' },
  { label: '定价', target: 'plans' },
  { label: '评价', target: 'reviews' },
  { label: '常见问题', target: 'faq' },
];

const products = [
  {
    name: '清濯深层洁净洗衣液',
    spec: '2kg / 浓缩型',
    imageDark: asset('product-front-transparent.png'),
    imageLight: asset('product-front-with-bg.png'),
    features: ['茶皂素 + 高效表活复配', '一盖洗 3-5kg，可用约 60 次', '中性 pH，护色不伤纤维'],
    text: '主打款。浓缩配方去渍力强，低泡好漂洗无残留，衣物洗后清新留香。',
    badge: '主推',
  },
  {
    name: '清濯植物洁净洗衣液',
    spec: '500ml / 植物型',
    imageDark: asset('product-botanical-transparent.png'),
    imageLight: asset('product-botanical-with-bg.png'),
    features: ['天然茶皂素为主要成分', '植物来源，温和不刺激', '宝宝衣物、贴身衣物适用'],
    text: '植物配方特别款。天然茶皂素去污，对敏感肌更友好，适合清洗贴身和宝宝衣物。',
    badge: '植物配方',
  },
];

const formulaItems = [
  { name: '高效去污体系', desc: '阴离子 + 非离子表面活性剂协同，瓦解油脂和顽固污渍。' },
  { name: '温和护衣配方', desc: '添加椰油基辅助表活，中性 pH，保护织物纤维和衣物颜色。' },
  { name: '天然茶皂素成分', desc: '从茶叶中提取的天然皂素，植物来源，温和不刺激皮肤。' },
  { name: '实验室验证', desc: '经去渍力、泡沫量、漂洗残留、织物手感四项测试合格。' },
];

const safetyItems = [
  { icon: 'flask', title: '无荧光增白剂', desc: '经第三方检测，不含荧光增白剂。不残留、不刺激，洗后衣物可直接接触皮肤。' },
  { icon: 'shield', title: '宝宝衣物可用', desc: '中性 pH 配方，不含磷、不含碱性助剂。贴身衣物、宝宝衣服都能放心洗。' },
  { icon: 'leaf', title: '植物来源成分', desc: '核心成分茶皂素提取自天然茶叶，生物可降解，对环境友好。' },
  { icon: 'badge', title: '实验室四项验证', desc: '去渍力、泡沫量、漂洗残留、织物手感四项指标均经实验室测试合格。' },
];

const planCards = [
  { name: '日常家庭装', spec: '2kg / 瓶', price: '¥39.9', originalPrice: '¥59.9', text: '日常衣物、床品、毛巾，一瓶可用约 60 次。', badge: '热卖' },
  { name: '双瓶囤货装', spec: '2kg × 2 瓶', price: '¥69.9', originalPrice: '¥119.8', text: '家庭周期采购，省心省钱，约 4 个月用量。', badge: '超值' },
  { name: '体验尝鲜装', spec: '500ml / 瓶', price: '¥14.9', originalPrice: '¥19.9', text: '小容量体验，适合首次尝试或旅行携带。', badge: '' },
];

const reviews = [
  { name: '王女士', avatar: '王', rating: 5, text: '去渍效果真的很好，孩子校服上的油渍泡一泡就掉了，而且味道很清新不刺鼻。', date: '2026-03-15' },
  { name: '李先生', avatar: '李', rating: 5, text: '浓缩配方用量很省，一瓶用了快两个月。低泡设计洗衣机漂洗很干净，不会有残留。', date: '2026-03-08' },
  { name: '张女士', avatar: '张', rating: 4, text: '护色效果不错，深色衣服洗了几次没有褪色。香味淡淡的很舒服，不会太浓。', date: '2026-02-22' },
  { name: '陈先生', avatar: '陈', rating: 5, text: '家里有宝宝，对洗衣液成分比较在意。这个茶皂素配方温和不伤手，很放心。', date: '2026-02-10' },
];

const faqItems = [
  { q: '清濯洗衣液适合哪些面料？', a: '适用于棉、麻、化纤、混纺等常见面料。对于丝绸、羊毛等娇贵面料，建议先在不显眼处试用。' },
  { q: '机洗和手洗的用量分别是多少？', a: '机洗：3-5kg 衣物约 15ml（一瓶盖）。手洗：5L 水约 10ml。浓缩配方，用量约为普通洗衣液的 1/2。' },
  { q: '是否含有荧光增白剂？', a: '不含荧光增白剂。清濯采用茶皂素复配表活体系，通过天然植物成分实现洁净与护色，经检测不含荧光剂。' },
  { q: '香味会不会太浓？', a: '清濯采用淡雅留香设计，洗后衣物散发清新自然的香气，不浓烈不刺鼻，适合对香味敏感的人群。' },
  { q: '如何购买？支持哪些付款方式？', a: '目前支持微信、支付宝扫码下单，也可通过班级团购渠道购买。批量采购请联系团队获取优惠。' },
];

const trustBadges = [
  { icon: 'shield', label: '检测合格', desc: '第三方质检报告' },
  { icon: 'leaf', label: '植物配方', desc: '茶皂素天然成分' },
  { icon: 'flask', label: '无荧光剂', desc: '零荧光增白剂' },
  { icon: 'badge', label: '温和不伤手', desc: 'pH 中性配方' },
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

          <Button className="hidden h-auto shrink-0 rounded-full px-6 py-2.5 text-step--1 tracking-wider font-body md:inline-flex" onClick={() => scrollToSection('plans')} size="sm" type="button" variant="heroSecondary">
            立即购买
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
            <Button className="mt-3 h-auto rounded-full px-6 py-2.5 text-step--1 tracking-wider font-body" onClick={() => handleNav('plans')} type="button" variant="heroSecondary">
              立即购买
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection({ dark, toggle, activeSection, scrolled }: { dark: boolean; toggle: () => void; activeSection: string; scrolled: boolean }) {
  const videoRef = useFadingVideo(0.72);
  const heroStats = ['一瓶盖洗一桶', '天然茶皂素配方', '低泡无残留'];

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
        <>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(150_8%_97%),hsl(150_7%_95%)_50%,hsl(150_6%_93%))]" />
          <div className="hero-light-gradient" />
          <div className="hero-light-grid" />
          <div className="hero-light-orb hero-light-orb-1" aria-hidden="true" />
          <div className="hero-light-orb hero-light-orb-2" aria-hidden="true" />
          <div className="hero-light-orb hero-light-orb-3" aria-hidden="true" />
        </>
      )}
      <Navbar dark={dark} toggle={toggle} activeSection={activeSection} scrolled={scrolled} />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-86px)] w-full max-w-5xl flex-col items-center justify-center px-6 pb-16 pt-24 text-center md:px-10">
        <div className="hero-copy text-center">
          <p className="hero-enter eyebrow-pill">
            <span className="mr-2.5 inline-block size-1.5 rounded-full bg-accent" aria-hidden="true" />
            茶皂素复配 · 浓缩配方 · 无荧光剂
          </p>

          <h1 className="hero-enter mt-6 max-w-4xl text-balance font-display text-step-6 font-normal text-gradient-green">
            一盖洗净，
            <br />
            衣物如新。
          </h1>

          <p className="hero-enter mt-4 max-w-xl font-body text-step-0 leading-8 text-foreground/60">
            天然茶皂素复配浓缩配方，去渍力强、用量省、低泡好漂洗。不含荧光增白剂，温和不伤手，全家衣物都能放心洗。
          </p>

          <div className="hero-enter mx-auto mt-7 flex w-full flex-col justify-center gap-3 sm:max-w-md sm:flex-row">
            <a
              href="#plans"
              onClick={(e) => { e.preventDefault(); scrollToSection('plans'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                padding: '16px 32px',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                background: '#14332d',
                color: '#ffffff',
                textDecoration: 'none',
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              立即选购
              <ArrowRight aria-hidden="true" style={{ marginLeft: 8, width: 16, height: 16 }} />
            </a>
            <a
              href="#products"
              onClick={(e) => { e.preventDefault(); scrollToSection('products'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                padding: '16px 32px',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                background: 'rgba(255,255,255,0.65)',
                color: '#14332d',
                border: '1.5px solid rgba(20,51,45,0.25)',
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              了解产品
            </a>
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

      {/* 信任徽章栏 */}
      <div className="relative z-10 border-t border-foreground/6 bg-background/40 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4">
          {trustBadges.map((badge, i) => {
            const Icon = badge.icon === 'shield' ? ShieldCheck : badge.icon === 'leaf' ? Leaf : badge.icon === 'flask' ? FlaskConical : BadgeCheck;
            return (
              <div className={`flex items-center justify-center gap-3 px-6 py-5 ${i > 0 ? 'border-foreground/6 md:border-l' : ''} ${i >= 2 ? 'border-foreground/6 border-t md:border-t-0' : ''}`} key={badge.label}>
                <Icon className="size-5 shrink-0 text-accent/70" />
                <div>
                  <p className="font-body text-step-0 font-semibold text-foreground/80">{badge.label}</p>
                  <p className="font-body text-step--1 text-muted-foreground/60">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
function ProductSection({ dark }: { dark: boolean }) {
  return (
    <section className="section-breath relative section-alt px-6 md:px-10" id="products">
      <div className="glow-orb right-[-5%] top-[20%] h-[350px] w-[350px] bg-teal-300" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-12 text-center">
            <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Our Products</p>
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">
              两款配方，按需选择。
            </h2>
          </div>
        </AnimateIn>

        <div className="flex flex-col gap-6">
          {products.map((product, i) => (
            <AnimateIn key={product.name} delay={i + 1}>
              <article className="product-hero-card">
                <div className={`product-hero-visual ${dark ? 'product-hero-visual-dark' : ''}`}>
                  {product.badge && (
                    <span className="absolute left-5 top-5 z-10 inline-flex items-center rounded-full bg-accent/15 px-3 py-1 font-body text-step--2 font-semibold tracking-wide text-accent backdrop-blur-sm">
                      {product.badge}
                    </span>
                  )}
                  <img
                    alt={product.name}
                    className="product-hero-image"
                    loading="lazy"
                    src={dark ? product.imageDark : product.imageLight}
                  />
                </div>
                <div className="product-hero-copy">
                  <p className="product-copy-eyebrow">{product.spec}</p>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-description">{product.text}</p>
                  <div className="mt-5 flex flex-col gap-2">
                    {product.features.map((f) => (
                      <div className="flex items-start gap-2.5" key={f}>
                        <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        <span className="font-body text-step--1 leading-6 text-foreground/70">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="btn-glow mt-6 h-auto rounded-full px-7 py-3" onClick={() => scrollToSection('plans')} type="button" variant={i === 0 ? 'hero' : 'heroSecondary'}>
                    <ShoppingBag className="mr-2 size-4" />
                    立即购买
                  </Button>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>

        {/* 产品对比表 */}
        <AnimateIn delay={3}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-foreground/8 bg-card/60">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-foreground/8">
                  <th className="px-6 py-4 font-body text-step--1 font-semibold text-foreground/50">对比项</th>
                  <th className="px-6 py-4 font-body text-step--1 font-semibold text-accent">深层洁净（2kg）</th>
                  <th className="px-6 py-4 font-body text-step--1 font-semibold text-foreground/70">植物洁净（500ml）</th>
                </tr>
              </thead>
              <tbody className="font-body text-step--1">
                {[
                  ['核心成分', '茶皂素 + 高效表活', '天然茶皂素为主'],
                  ['适用场景', '日常衣物、床品、毛巾', '贴身衣物、宝宝衣服'],
                  ['酸碱度', '中性 pH', '中性 pH'],
                  ['泡沫特性', '低泡好漂洗', '低泡好漂洗'],
                  ['香味', '清新淡雅', '清新淡雅'],
                  ['单次用量', '约 15ml（一瓶盖）', '约 10ml'],
                ].map(([label, v1, v2], row) => (
                  <tr key={label} className={row < 5 ? 'border-b border-foreground/5' : ''}>
                    <td className="px-6 py-3.5 text-muted-foreground">{label}</td>
                    <td className="px-6 py-3.5 text-foreground/80">{v1}</td>
                    <td className="px-6 py-3.5 text-foreground/80">{v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
function HowItWorksSection() {
  const steps = [
    { num: '01', title: '倒入一瓶盖', desc: '浓缩配方，一瓶盖（约 15ml）即可洗 3-5kg 衣物。', image: asset('detail-bottle-cap.png') },
    { num: '02', title: '浸泡 15 分钟', desc: '茶皂素 + 表活体系渗透纤维，瓦解油脂和顽固污渍。', image: asset('scene-laundry-room.png') },
    { num: '03', title: '漂洗晾晒', desc: '低泡设计好漂洗，无残留。衣物清新留香，柔软如新。', image: asset('scene-folded-close.png') },
  ];

  return (
    <section className="section-breath relative bg-background px-6 md:px-10" id="how-it-works">
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-12 text-center">
            <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">How To Use</p>
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">三步搞定，简单省心。</h2>
          </div>
        </AnimateIn>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <AnimateIn key={step.num} delay={i + 1}>
              <article className="card-premium overflow-hidden">
                <div className="img-zoom aspect-[4/3]">
                  <img
                    alt={step.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    src={step.image}
                  />
                </div>
                <div className="p-6">
                  <span className="font-display text-step-5 font-normal text-foreground/10">{step.num}</span>
                  <h3 className="font-body mt-1 text-step-1 font-semibold text-foreground">{step.title}</h3>
                  <p className="font-body mt-2 text-step-0 leading-7 text-muted-foreground">{step.desc}</p>
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
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-10 text-center">
            <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Formula</p>
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">
              天然茶皂素，实验室验证。
            </h2>
            <p className="font-body mt-4 mx-auto max-w-2xl text-step-0 leading-8 text-muted-foreground">
              从茶叶中提取天然皂素，复配高效表活体系。既保留植物温和性，又确保去渍力。经实验室四项指标测试合格。
            </p>
          </div>
        </AnimateIn>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {formulaItems.map((item, i) => (
              <AnimateIn key={item.name} delay={i + 1}>
                <div className="liquid-glass flex h-full flex-col rounded-xl p-4">
                  <p className="font-body text-step--1 font-medium text-foreground">{item.name}</p>
                  <p className="font-body mt-1.5 flex-1 text-step--1 leading-6 text-muted-foreground">{item.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[asset('formula-lab-product.png'), asset('formula-test-bench.png'), asset('macro-fabric-dropper.png'), asset('macro-tea-saponin-dish.png')].map((image, index) => (
              <AnimateIn key={image} delay={index + 1}>
                <div className="aspect-[4/3] overflow-hidden rounded-xl">
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
      </div>
    </section>
  );
}

function SafetySection() {
  return (
    <section className="section-breath relative bg-background px-6 md:px-10" id="safety">
      <div className="glow-orb left-[-5%] bottom-[20%] h-[300px] w-[300px] bg-emerald-300" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-12 text-center">
            <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Safety</p>
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">安全，是我们的底线。</h2>
            <p className="font-body mt-4 max-w-2xl mx-auto text-step-0 leading-8 text-muted-foreground">
              每一瓶清濯洗衣液都经过严格检测，确保不含荧光增白剂、不含磷，温和不伤手，宝宝衣物也能放心使用。
            </p>
          </div>
        </AnimateIn>
        <div className="grid gap-5 md:grid-cols-2">
          {safetyItems.map((item, i) => {
            const Icon = item.icon === 'flask' ? FlaskConical : item.icon === 'shield' ? ShieldCheck : item.icon === 'leaf' ? Leaf : BadgeCheck;
            return (
              <AnimateIn key={item.title} delay={Math.min(i + 1, 6)}>
                <article className="liquid-glass flex gap-5 rounded-2xl p-6">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="size-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-body text-step-1 font-semibold text-foreground">{item.title}</h3>
                    <p className="font-body mt-2 text-step-0 leading-7 text-muted-foreground">{item.desc}</p>
                  </div>
                </article>
              </AnimateIn>
            );
          })}
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
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">产品规格与定价。</h2>
            <p className="font-body mt-4 text-step-0 leading-8 text-muted-foreground">
              浓缩配方，用量更省，性价比更高。
            </p>
          </div>
        </AnimateIn>
        <div className="grid gap-5 md:grid-cols-3">
          {planCards.map((plan, i) => (
            <AnimateIn key={plan.name} delay={i + 1}>
              <article className={`card-premium relative flex flex-col p-8 ${i === 1 ? 'border-accent/40 shadow-[0_24px_62px_hsl(var(--accent)/0.12)]' : ''}`}>
                {plan.badge && (
                  <span className="absolute right-5 top-5 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 font-body text-step--2 font-semibold tracking-wide text-accent">
                    {plan.badge}
                  </span>
                )}
                <p className="font-body text-step-1 font-medium tracking-wide text-accent">{plan.name}</p>
                <p className="font-body mt-1 text-step--2 text-muted-foreground/60">{plan.spec}</p>
                <div className="mt-6 flex items-baseline gap-3">
                  <strong className="font-display text-step-5 font-normal text-foreground">{plan.price}</strong>
                  {plan.originalPrice && (
                    <span className="font-body text-step--1 text-muted-foreground/50 line-through">{plan.originalPrice}</span>
                  )}
                </div>
                <p className="font-body mt-6 flex-1 text-step-0 leading-7 text-muted-foreground">{plan.text}</p>
                <Button className="btn-glow mt-8 h-auto w-full rounded-full px-6 py-3" type="button" variant={i === 1 ? 'hero' : 'heroSecondary'}>
                  <ShoppingBag className="mr-2 size-4" />
                  立即购买
                </Button>
              </article>
            </AnimateIn>
          ))}
        </div>

        {/* 售后保障条 */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-foreground/8 bg-card/40 px-8 py-5">
          {['7 天无理由退换', '质量问题包退', '顺丰包邮', '扫码即下单'].map((item, i) => (
            <div className="flex items-center gap-2" key={item}>
              <span className="block size-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span className="font-body text-step--1 font-medium text-foreground/70">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const totalReviews = 128;

  return (
    <section className="section-breath relative bg-background px-6 md:px-10" id="reviews">
      <div className="glow-orb right-[-5%] top-[20%] h-[300px] w-[300px] bg-emerald-200" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Reviews</p>
              <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">用户真实评价。</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`size-5 ${s <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-foreground/20'}`} />
                ))}
              </div>
              <span className="font-display text-step-4 font-normal text-foreground">{avgRating}</span>
              <span className="font-body text-step--1 text-muted-foreground">· {totalReviews} 条评价</span>
            </div>
          </div>
        </AnimateIn>

        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((review, i) => (
            <AnimateIn key={review.name} delay={i + 1}>
              <article className="card-premium flex flex-col p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 font-body text-step--1 font-semibold text-accent">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-body text-step-0 font-medium text-foreground">{review.name}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`size-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-foreground/15'}`} />
                      ))}
                      <span className="ml-2 font-body text-step--2 text-muted-foreground/60">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="font-body mt-4 flex-1 text-step-0 leading-7 text-muted-foreground">{review.text}</p>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-breath relative section-alt px-6 md:px-10" id="faq">
      <div className="mx-auto max-w-3xl">
        <AnimateIn>
          <div className="mb-12 text-center">
            <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">FAQ</p>
            <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">常见问题。</h2>
          </div>
        </AnimateIn>

        <div className="flex flex-col gap-3">
          {faqItems.map((item, i) => (
            <AnimateIn key={item.q} delay={Math.min(i + 1, 6)}>
              <article className="overflow-hidden rounded-2xl border border-foreground/8 bg-card/60 transition-colors duration-300">
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 hover:bg-foreground/[0.02]"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  type="button"
                  aria-expanded={openIndex === i}
                >
                  <span className="font-body text-step-0 font-medium text-foreground">{item.q}</span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-muted-foreground/60 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-400 ease-in-out ${openIndex === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-foreground/6 px-6 pb-5 pt-4 font-body text-step-0 leading-8 text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="section-breath relative bg-background px-6 md:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <AnimateIn>
          <p className="font-body text-step--1 font-medium tracking-wider uppercase text-accent">Get Started</p>
          <h2 className="font-display mt-3 text-balance text-step-4 font-normal text-foreground">
            好衣物，从一盖开始。
          </h2>
          <p className="font-body mt-5 max-w-xl mx-auto text-step-0 leading-8 text-muted-foreground">
            天然茶皂素复配，浓缩用量省，低泡无残留。现在下单，享受新人尝鲜价。
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#plans"
              onClick={(e) => { e.preventDefault(); scrollToSection('plans'); }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '9999px', padding: '16px 40px', fontSize: 'var(--step-0)',
                fontWeight: 600, letterSpacing: '0.04em',
                background: '#14332d', color: '#ffffff', textDecoration: 'none', cursor: 'pointer',
                border: 'none', fontFamily: 'inherit',
              }}
            >
              立即选购
              <ArrowRight aria-hidden="true" style={{ marginLeft: 8, width: 16, height: 16 }} />
            </a>
            <a
              href="#faq"
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '9999px', padding: '16px 40px', fontSize: 'var(--step-0)',
                fontWeight: 600, letterSpacing: '0.04em',
                background: 'rgba(255,255,255,0.55)', color: '#14332d',
                border: '1.5px solid rgba(20,51,45,0.2)',
                textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              查看常见问题
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            {['7 天无理由退换', '顺丰包邮', '扫码即下单'].map((item) => (
              <div className="flex items-center gap-2" key={item}>
                <BadgeCheck className="size-4 text-accent/60" />
                <span className="font-body text-step--1 text-muted-foreground/60">{item}</span>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function Footer() {
  const socialLinks = [
    {
      name: '微信',
      href: 'https://weixin.qq.com/',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.11.24-.245 0-.06-.024-.12-.04-.178l-.327-1.233a.492.492 0 0 1 .178-.553C23.188 18.48 24 16.82 24 14.98c0-3.21-2.931-5.862-7.062-6.122zM14.75 13.74a.976.976 0 0 1 .97.978.976.976 0 0 1-.97.978.976.976 0 0 1-.97-.978.976.976 0 0 1 .97-.978zm4.844 0a.976.976 0 0 1 .97.978.976.976 0 0 1-.97.978.976.976 0 0 1-.97-.978.976.976 0 0 1 .97-.978z"/></svg>
      ),
    },
    {
      name: '抖音',
      href: 'https://www.douyin.com/',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.001-.104z"/></svg>
      ),
    },
    {
      name: '小红书',
      href: 'https://www.xiaohongshu.com/',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.615 13.846h-2.308v2.308h-1.846v-2.308H10.154v-1.846h2.307V11.692h1.846v2.308h2.308v1.846zM7.385 8h2.307V5.692h1.846V8h2.308v1.846h-2.308v2.308h-1.846V9.846H7.385V8z"/></svg>
      ),
    },
    {
      name: '微博',
      href: 'https://weibo.com/',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zm6.229-7.434c-2.685-.293-5.738 1.39-6.818 3.732-1.095 2.378.16 5.04 2.846 5.947 2.758.932 6.065-.591 7.207-3.127 1.132-2.52-.36-6.252-3.235-6.552zm-1.863 3.57c-.495.616-1.568.884-2.399.612-.812-.266-1.056-.996-.577-1.6.472-.596 1.512-.864 2.345-.607.852.251 1.119 1 .631 1.595zm1.567-1.524c-.18.224-.572.335-.878.253-.301-.08-.399-.362-.222-.582.175-.217.556-.326.861-.246.308.075.414.356.239.575zM18.36 3.49c-1.146-.263-2.395.173-3.22 1.124l-.002.003c-.553.643-.763 1.428-.658 2.107a.655.655 0 0 1-.36.73.66.66 0 0 1-.772-.16c-.474-.553-1.113-.884-1.808-.884-.137 0-.277.012-.417.037-1.624.295-2.764 1.705-2.68 3.378.033.67.259 1.311.657 1.844a.657.657 0 0 1-.124.916.66.66 0 0 1-.92-.122c-.564-.76-.887-1.667-.934-2.612-.118-2.37 1.472-4.424 3.767-4.962.296-.07.597-.103.893-.103 1.087 0 2.103.534 2.728 1.395.284-.56.714-1.042 1.267-1.384 1.069-.66 2.37-.536 3.365.155a.658.658 0 0 1 .19.91.66.66 0 0 1-.915.188c-.528-.372-1.23-.448-1.818-.08z"/></svg>
      ),
    },
  ];

  return (
    <footer className="border-t border-foreground/8 bg-card/30 px-6 py-14 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
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
            本项目为福建师范大学应用化学专业精细化学实验课程作品，展示茶皂素复配洗衣液的品牌设计、配方研发与产品落地。
          </p>
        </div>
        <div>
          <p className="font-body text-step--1 font-medium text-foreground">关注我们</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {socialLinks.map((link) => (
              <a
                className="inline-flex size-10 items-center justify-center rounded-full border border-foreground/10 bg-background/60 font-body text-step--2 font-semibold text-muted-foreground transition-all duration-300 hover:border-accent/40 hover:text-accent"
                href={link.href}
                key={link.name}
                title={link.name}
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
          <p className="font-body mt-4 text-step--2 text-muted-foreground/50">
            扫码关注获取最新优惠
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

function MobileStickyBar({ scrolled }: { scrolled: boolean }) {
  if (!scrolled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-foreground/10 bg-background/90 backdrop-blur-xl px-4 py-3 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-body text-step--1 font-medium text-foreground">清濯浓缩洗衣液</p>
          <p className="font-body text-step--2 text-muted-foreground">¥39.9 起</p>
        </div>
        <button
          onClick={() => scrollToSection('plans')}
          type="button"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '9999px', padding: '10px 24px', fontSize: '0.85rem',
            fontWeight: 600, letterSpacing: '0.04em',
            background: '#14332d', color: '#ffffff', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', flexShrink: 0,
          }}
        >
          <ShoppingBag style={{ marginRight: 6, width: 14, height: 14 }} />
          立即购买
        </button>
      </div>
    </div>
  );
}

// ─── 根组件 ──────────────────────────────────────────────────────────

const sectionIds = ['brand', 'products', 'safety', 'how-it-works', 'formula', 'plans', 'reviews', 'faq'];

function App() {
  const { dark, toggle } = useDarkMode();
  const activeSection = useScrollSpy(sectionIds);
  const { scrolled, progress } = useScrollProgress();

  return (
    <main>
      <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <HeroSection dark={dark} toggle={toggle} activeSection={activeSection} scrolled={scrolled} />
      <ProductSection dark={dark} />
      <SafetySection />
      <HowItWorksSection />
      <FormulaSection />
      <PlansSection />
      <ReviewsSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <MobileStickyBar scrolled={scrolled} />
    </main>
  );
}

export default App;
