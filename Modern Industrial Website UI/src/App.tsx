import { FormEvent, ReactNode, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Box, Check, ChevronDown, Menu, MessageCircle, Search, ShieldCheck, X, Zap } from 'lucide-react'
import gsap from 'gsap'

const SwitchgearModel = lazy(() => import('./SwitchgearModel'))

type Route =
  | { page: 'home' }
  | { page: 'products' }
  | { page: 'product'; slug: string }
  | { page: 'blog' }
  | { page: 'article'; slug: string }
  | { page: 'contact' }
  | { page: 'login' }
  | { page: 'register' }

type Product = {
  slug: string
  code: string
  name: string
  short: string
  description: string
  rating: string
  image: string
  specs: [string, string][]
}

const products: Product[] = [
  {
    slug: 'lv-power-control-centre',
    code: 'PCC–8000',
    name: 'LV Power Control Centre',
    short: 'Intelligent low-voltage distribution for high-demand industrial plants.',
    description: 'A modular, arc-safe power control centre engineered for continuous process environments. Every enclosure is fabricated, wired and FAT-tested at STEELHAUS.',
    rating: 'IP54 / IP65',
    image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=1200&q=80',
    specs: [['Rated voltage', '415–690V'], ['Busbar', 'Up to 8000A'], ['Fault level', '100kA / 1 sec'], ['Standard', 'IEC 61439-2']],
  },
  {
    slug: 'motor-control-centre',
    code: 'MCC–X',
    name: 'Motor Control Centre',
    short: 'Withdrawable and fixed-format motor management for process industries.',
    description: 'A service-friendly MCC platform with intelligent protection, thermal monitoring and plant-wide communications.',
    rating: 'Form 4B',
    image: 'https://images.unsplash.com/photo-1563770660941-10a63607692e?auto=format&fit=crop&w=1200&q=80',
    specs: [['Starter type', 'DOL / VFD / Soft'], ['Busbar', 'Up to 6300A'], ['Separation', 'Form 3B / 4B'], ['Network', 'Modbus / Profibus']],
  },
  {
    slug: 'automatic-power-factor',
    code: 'APFC–12',
    name: 'APFC Panel',
    short: 'Dynamic reactive-power correction with harmonic-safe capacitor banks.',
    description: 'Microprocessor-controlled power-factor correction built for unstable industrial loads and measurable energy savings.',
    rating: '12 Step',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    specs: [['Capacity', '50–1200 kVAr'], ['Steps', '6 / 8 / 12 / 16'], ['Reactor', '7% / 14% detuned'], ['Target PF', '≥ 0.99']],
  },
  {
    slug: 'plc-automation-panel',
    code: 'PLC–FLEX',
    name: 'PLC Automation Panel',
    short: 'Integrated control architecture from sensor layer to cloud analytics.',
    description: 'Purpose-built automation panels with PLC, HMI, managed switching and remote diagnostics in one documented package.',
    rating: 'IIoT Ready',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    specs: [['PLC', 'Siemens / AB / ABB'], ['I/O', 'Up to 2048 points'], ['Protocol', 'OPC UA / MQTT'], ['Supply', '24V DC redundant']],
  },
  {
    slug: 'bus-duct-system',
    code: 'BUS–6000',
    name: 'Bus Duct System',
    short: 'Compact high-current transmission for plants and critical facilities.',
    description: 'Copper and aluminium sandwich busways engineered around the route, load profile and future expansion plan.',
    rating: '6000A',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    specs: [['Current', '400–6000A'], ['Conductor', 'Cu / Al'], ['Protection', 'IP55 / IP65'], ['Standard', 'IEC 61439-6']],
  },
  {
    slug: 'outdoor-feeder-pillar',
    code: 'OFP–65',
    name: 'Outdoor Feeder Pillar',
    short: 'Weatherproof distribution built for utilities and infrastructure.',
    description: 'Rugged outdoor assemblies with double-door construction, anti-condensation control and configurable outgoing ways.',
    rating: 'IP65',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    specs: [['Ingress', 'IP55 / IP65'], ['Material', 'CRCA / SS316'], ['Finish', 'C5-M powder coat'], ['Ambient', '-20°C to +55°C']],
  },
]

const posts = [
  {
    slug: 'iec-61439-panel-design',
    tag: 'Engineering',
    date: '14 Mar 2026',
    read: '8 min',
    title: 'IEC 61439: What Plant Engineers Need to Know',
    excerpt: 'A practical guide to design verification, temperature rise and short-circuit withstand in low-voltage assemblies.',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'smart-mcc-predictive-maintenance',
    tag: 'Automation',
    date: '27 Feb 2026',
    read: '6 min',
    title: 'How Smart MCCs Make Maintenance Predictive',
    excerpt: 'Motor-current signatures and thermal data are changing how reliability teams schedule shutdowns.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'arc-flash-risk',
    tag: 'Safety',
    date: '05 Feb 2026',
    read: '5 min',
    title: 'Reducing Arc-Flash Risk at the Panel',
    excerpt: 'Six design decisions that help protect operators without compromising access or maintainability.',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80',
  },
]

function parseRoute(): Route {
  const path = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (!path.length) return { page: 'home' }
  if (path[0] === 'products' && path[1]) return { page: 'product', slug: path[1] }
  if (path[0] === 'products') return { page: 'products' }
  if (path[0] === 'blog' && path[1]) return { page: 'article', slug: path[1] }
  if (path[0] === 'blog') return { page: 'blog' }
  if (['contact', 'login', 'register'].includes(path[0])) return { page: path[0] as 'contact' | 'login' | 'register' }
  return { page: 'home' }
}

function Link({ to, children, className = '', onClick }: { to: string; children: ReactNode; className?: string; onClick?: () => void }) {
  return <a href={to === '/' ? '#/' : `#${to}`} className={className} onClick={onClick}>{children}</a>
}

function SectionTag({ children }: { children: ReactNode }) {
  return <div className="section-tag"><span />{children}</div>
}

function Header({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  const links = [
    { label: 'Products', to: '/products' },
    { label: 'Capabilities', to: '/', section: 'capabilities' },
    { label: '3D Lab', to: '/', section: 'digital-twin' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
  ]
  const navigate = (section?: string) => {
    setOpen(false)
    if (section) window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }
  return (
    <header className="site-header">
      <Link to="/" className="brand" onClick={() => setOpen(false)}>
        <span className="brand-mark"><span /></span>
        <span>STEELHAUS<small>POWER SYSTEMS</small></span>
      </Link>
      <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Primary navigation">
        {links.map(({ label, to, section }) => <Link key={label} to={to} onClick={() => navigate(section)}>{label}</Link>)}
        <Link to="/login" className={route.page === 'login' ? 'active' : ''} onClick={() => setOpen(false)}>Client portal</Link>
        <Link to="/contact" className="nav-cta" onClick={() => setOpen(false)}>Request quote <ArrowRight size={15} /></Link>
      </nav>
      <button className="menu-button" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </header>
  )
}

function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <div>
          <div className="brand footer-brand"><span className="brand-mark"><span /></span><span>STEELHAUS<small>POWER SYSTEMS</small></span></div>
          <p>Built for current.<br />Engineered for consequence.</p>
        </div>
        <div><b>Navigate</b><Link to="/products">Products</Link><Link to="/blog">Insights</Link><Link to="/contact">Contact</Link></div>
        <div><b>Systems</b><Link to="/products/lv-power-control-centre">Power control</Link><Link to="/products/motor-control-centre">Motor control</Link><Link to="/products/plc-automation-panel">Automation</Link></div>
        <div><b>Connect</b><a href="tel:+911204801800">+91 120 480 1800</a><a href="mailto:projects@steelhaus.in">projects@steelhaus.in</a><span>Greater Noida, India</span></div>
      </div>
      <div className="footer-base"><span>© 2026 STEELHAUS POWER SYSTEMS</span><span>ISO 9001:2015 · IEC 61439</span></div>
    </footer>
  )
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <Link to={`/products/${product.slug}`} className="product-card reveal">
      <div className="product-image"><img src={product.image} alt={product.name} loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span></div>
      <div className="product-copy">
        <div className="meta"><span>{product.code}</span><span>{product.rating}</span></div>
        <h3>{product.name}</h3><p>{product.short}</p>
        <div className="text-link">View system <ArrowRight size={16} /></div>
      </div>
    </Link>
  )
}

function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-kicker, .hero h1 span, .hero-summary, .hero-actions', { y: 45, opacity: 0, duration: .85, stagger: .1, ease: 'power3.out' })
      gsap.from('.hero-specs', { x: 35, opacity: 0, delay: .55, duration: .8 })
    }, heroRef)
    return () => ctx.revert()
  }, [])
  return (
    <main>
      <section className="hero grid-texture" ref={heroRef}>
        <div className="hero-main">
          <div className="hero-kicker"><span>Est. 1978</span><span>Industrial power systems</span></div>
          <h1><span>POWER.</span><span>CONTROL.</span><span className="accent">BUILT.</span></h1>
          <p className="hero-summary">Low-voltage switchboards and automation systems engineered, fabricated and tested for industry that cannot stop.</p>
          <div className="hero-actions"><Link to="/products" className="button primary">Explore systems <ArrowRight size={18} /></Link><Link to="/contact" className="button ghost">Engineer a solution</Link></div>
        </div>
        <aside className="hero-specs">
          <div className="live-label"><i /> Manufacturing live</div>
          <div><strong>8,000A</strong><span>BUS CURRENT</span></div>
          <div><strong>100kA</strong><span>FAULT WITHSTAND</span></div>
          <div><strong>47+</strong><span>YEARS ENGINEERING</span></div>
        </aside>
        <div className="scroll-note">SCROLL TO INSPECT <ChevronDown size={16} /></div>
      </section>

      <section className="intro" id="capabilities">
        <SectionTag>What we engineer</SectionTag>
        <div><h2>THE POWER BEHIND<br />SERIOUS INDUSTRY.</h2><p>From incoming power to the last field device, STEELHAUS builds integrated electrical infrastructure around your process—not a catalogue.</p></div>
      </section>

      <section className="product-preview">
        <div className="section-head"><SectionTag>Core systems / 01–06</SectionTag><Link to="/products" className="text-link">All products <ArrowRight size={16} /></Link></div>
        <div className="product-grid">{products.slice(0, 4).map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}</div>
      </section>

      <section className="model-section" id="digital-twin">
        <div className="model-copy">
          <SectionTag>Digital twin / PCC–8000</SectionTag>
          <h2>INSPECT THE<br /><span>ARCHITECTURE.</span></h2>
          <p>Drag to rotate. Scroll to zoom. Our digital workflow resolves clearances, heat paths and service access before metal reaches the shop floor.</p>
          <ul><li><Check size={16} /> Parametric enclosure design</li><li><Check size={16} /> Thermal & fault simulation</li><li><Check size={16} /> As-built digital documentation</li></ul>
          <Link to="/products/lv-power-control-centre" className="button ghost">View PCC–8000 <ArrowRight size={17} /></Link>
        </div>
        <div className="model-stage">
          <Suspense fallback={<div className="model-loader">LOADING DIGITAL TWIN…</div>}><SwitchgearModel /></Suspense>
          <div className="model-ui top">MODEL / LIVE_01</div><div className="model-ui bottom">DRAG TO ROTATE · SCROLL TO ZOOM</div>
        </div>
      </section>

      <section className="numbers">
        {[['47', 'YEARS OF PRACTICE'], ['2,800+', 'PANELS DELIVERED'], ['18', 'COUNTRIES SERVED'], ['99.2%', 'ON-TIME FAT']].map(([n, label]) => <div key={label}><strong>{n}</strong><span>{label}</span></div>)}
      </section>

      <section className="insights">
        <div className="section-head"><div><SectionTag>Field notes</SectionTag><h2>ENGINEERING<br />INTELLIGENCE.</h2></div><Link to="/blog" className="text-link">All insights <ArrowRight size={16} /></Link></div>
        <div className="post-grid">{posts.map(post => <ArticleCard key={post.slug} post={post} />)}</div>
      </section>
      <ContactBand />
    </main>
  )
}

function ProductsPage() {
  return (
    <main className="page">
      <PageHero eyebrow="Product systems / 01–06" title={<>POWER, CONTROL<br />AND AUTOMATION.</>} text="Verified low-voltage assemblies, built around your single-line diagram and operating environment." />
      <section className="catalog-toolbar"><span>06 CONFIGURABLE SYSTEMS</span><div><Search size={16} /> SELECTED FOR INDUSTRIAL DUTY</div></section>
      <section className="product-grid catalog">{products.map((p, i) => <ProductCard product={p} index={i} key={p.slug} />)}</section>
      <ContactBand />
    </main>
  )
}

function ProductDetail({ slug }: { slug: string }) {
  const product = products.find(p => p.slug === slug) || products[0]
  return (
    <main className="page detail-page">
      <section className="detail-hero">
        <div className="detail-copy"><Link to="/products" className="back"><ArrowLeft size={16} /> All systems</Link><SectionTag>{product.code} / {product.rating}</SectionTag><h1>{product.name}</h1><p>{product.description}</p><div className="hero-actions"><Link to="/contact" className="button primary">Configure this panel <ArrowRight size={18} /></Link><button className="button ghost" onClick={() => document.getElementById('specifications')?.scrollIntoView({ behavior: 'smooth' })}>Technical data</button></div></div>
        <div className="detail-image"><img src={product.image} alt={product.name} /><span>ENGINEERED TO ORDER</span></div>
      </section>
      <section className="spec-section" id="specifications">
        <div><SectionTag>Technical envelope</SectionTag><h2>DESIGNED AROUND<br />THE LOAD.</h2></div>
        <div className="spec-list">{product.specs.map(([label, value], i) => <div key={label}><span>0{i + 1} / {label}</span><strong>{value}</strong></div>)}</div>
      </section>
      <section className="feature-strip"><div><ShieldCheck /><h3>Type verified</h3><p>Design verification and routine tests documented to applicable IEC standards.</p></div><div><Box /><h3>Modular platform</h3><p>Future feeder additions planned into the enclosure and bus architecture.</p></div><div><Zap /><h3>Arc-aware design</h3><p>Segregation, interlocking and pressure management protect people and uptime.</p></div></section>
      <ContactBand title={`LET'S CONFIGURE YOUR ${product.code}.`} />
    </main>
  )
}

function ArticleCard({ post }: { post: typeof posts[number] }) {
  return <Link to={`/blog/${post.slug}`} className="article-card"><div className="article-image"><img src={post.image} alt="" loading="lazy" /><span>{post.tag}</span></div><div className="meta"><span>{post.date}</span><span>{post.read} READ</span></div><h3>{post.title}</h3><p>{post.excerpt}</p><div className="text-link">Read field note <ArrowRight size={16} /></div></Link>
}

function BlogPage() {
  return <main className="page"><PageHero eyebrow="Field notes / 2026" title={<>ENGINEERING<br />INTELLIGENCE.</>} text="Practical thinking on switchgear, automation, electrical safety and plant reliability—from the people who build it." /><section className="post-grid blog-grid">{posts.map(p => <ArticleCard post={p} key={p.slug} />)}</section><ContactBand /></main>
}

function ArticlePage({ slug }: { slug: string }) {
  const post = posts.find(p => p.slug === slug) || posts[0]
  return <main className="page article-page"><article><Link to="/blog" className="back"><ArrowLeft size={16} /> All field notes</Link><div className="article-heading"><SectionTag>{post.tag} / {post.date}</SectionTag><h1>{post.title}</h1><p>{post.excerpt}</p><span>{post.read} READ · STEELHAUS ENGINEERING DESK</span></div><img className="article-lead" src={post.image} alt="" /><div className="article-body"><p className="lead">Industrial switchgear is not simply a collection of components inside a steel enclosure. It is a verified system whose performance depends on the way every conductor, barrier and heat path works together.</p><h2>Start with the operating context</h2><p>Rated current is only the first input. Ambient temperature, altitude, load diversity, harmonics, cable entry and maintenance access all influence a safe design. Capturing these conditions early prevents expensive correction during commissioning.</p><blockquote>Verification is not paperwork after the design. It is the discipline that shapes the design.</blockquote><h2>Design for the full lifecycle</h2><p>A panel may operate for twenty years or more. Clear identification, accessible termination zones and allowance for future feeders make that lifecycle safer. Good engineering keeps the initial build compact without closing off tomorrow's options.</p><p>At STEELHAUS, these decisions are reviewed at the single-line, general arrangement and manufacturing stages, then validated through routine testing before dispatch.</p></div></article><ContactBand /></main>
}

function PageHero({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text: string }) {
  return <section className="page-hero grid-texture"><SectionTag>{eyebrow}</SectionTag><h1>{title}</h1><p>{text}</p></section>
}

function ContactPage() {
  const [sent, setSent] = useState(false)
  const submit = (e: FormEvent) => { e.preventDefault(); setSent(true) }
  return <main className="page contact-page"><PageHero eyebrow="Start a project" title={<>BRING US THE<br />HARD PROBLEM.</>} text="Send your single-line diagram, specification or just the operating challenge. An applications engineer will respond within one business day." /><section className="contact-layout"><div className="contact-details"><SectionTag>Direct line</SectionTag><a href="tel:+911204801800">+91 120 480 1800</a><a href="mailto:projects@steelhaus.in">projects@steelhaus.in</a><p>Plot 18, Ecotech III<br />Greater Noida 201306<br />India</p><a className="whatsapp-inline" href="https://wa.me/911204801800" target="_blank" rel="noreferrer"><MessageCircle size={18} /> Discuss on WhatsApp</a></div><form onSubmit={submit}>{sent ? <div className="success"><Check /><h2>BRIEF RECEIVED.</h2><p>Our applications team will respond within one business day.</p></div> : <><div className="form-row"><Field label="Name" name="name" /><Field label="Work email" name="email" type="email" /></div><div className="form-row"><Field label="Company" name="company" /><Field label="Phone" name="phone" type="tel" /></div><label>System required<select name="system" defaultValue=""><option value="" disabled>Select product family</option>{products.map(p => <option key={p.slug}>{p.name}</option>)}</select></label><label>Project brief<textarea name="brief" rows={5} placeholder="Loads, environment, timeline and standards…" /></label><button className="button primary" type="submit">Send project brief <ArrowRight size={18} /></button></>}</form></section></main>
}

function Field({ label, name, type = 'text' }: { label: string; name: string; type?: string }) {
  return <label>{label}<input name={name} type={type} required /></label>
}

function AuthPage({ register = false }: { register?: boolean }) {
  return <main className="auth-page"><div className="auth-aside grid-texture"><SectionTag>STEELHAUS / Client portal</SectionTag><h1>PROJECT DATA.<br /><span>UNDER CONTROL.</span></h1><p>Access drawings, FAT reports, manuals and delivery status from one secure workspace.</p></div><div className="auth-form"><div><SectionTag>{register ? 'Create account' : 'Authorised access'}</SectionTag><h2>{register ? 'REGISTER.' : 'WELCOME BACK.'}</h2><p>{register ? 'Request access to your organisation’s project workspace.' : 'Enter your client credentials to continue.'}</p><form onSubmit={e => e.preventDefault()}>{register && <Field label="Full name" name="name" />}<Field label="Work email" name="email" type="email" /><Field label="Password" name="password" type="password" />{register && <Field label="Company" name="company" />}<button type="submit" className="button primary">{register ? 'Request access' : 'Sign in'} <ArrowRight size={17} /></button></form><p className="auth-switch">{register ? 'Already registered?' : 'New project client?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Request account'}</Link></p></div></div></main>
}

function ContactBand({ title = 'HAVE A LOAD TO CONTROL?' }: { title?: string }) {
  return <section className="contact-band"><div><SectionTag>Applications desk / Open</SectionTag><h2>{title}</h2></div><p>Send us your SLD or project brief. We'll return with the right architecture, not just a price.</p><Link to="/contact" className="button light">Start a project <ArrowRight size={18} /></Link></section>
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseRoute)
  useEffect(() => {
    const update = () => { setRoute(parseRoute()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    document.title = route.page === 'home' ? 'STEELHAUS — Industrial Power Systems' : `${route.page === 'product' ? products.find(p => p.slug === route.slug)?.name : route.page.charAt(0).toUpperCase() + route.page.slice(1)} | STEELHAUS`
  }, [route])
  let content: ReactNode
  if (route.page === 'products') content = <ProductsPage />
  else if (route.page === 'product') content = <ProductDetail slug={route.slug} />
  else if (route.page === 'blog') content = <BlogPage />
  else if (route.page === 'article') content = <ArticlePage slug={route.slug} />
  else if (route.page === 'contact') content = <ContactPage />
  else if (route.page === 'login') content = <AuthPage />
  else if (route.page === 'register') content = <AuthPage register />
  else content = <Home />
  return <div className="app"><Header route={route} />{content}<Footer /><a className="whatsapp-float" href="https://wa.me/911204801800" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><MessageCircle size={22} /></a></div>
}
