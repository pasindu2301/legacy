import { createElement, useEffect, useRef, useState } from 'react'
import './App.css'
import heroImage from './assets/main image.avif'
import approachImage from './assets/section3.avif'
import contactImage from './assets/contact_image.avif'
import section11Image from './assets/section1.1.avif'
import section12Image from './assets/section1.2.avif'
import section13Image from './assets/section1.3.avif'
import section14Image from './assets/section1.4.avif'
import section15Image from './assets/section1.5.avif'
import section21Image from './assets/section2.1.avif'
import section22Image from './assets/section2.2.avif'
import section23Image from './assets/section2.3.avif'

/** Sample imagery — replace with your own assets anytime. */
const IMG = {
  hero: heroImage,
  heroMesh: '/images/hero-mesh.svg',
  approach: approachImage,
  contact: contactImage,
}

const NAV = [
  { id: 'solutions', label: 'Solutions' },
  { id: 'steps', label: 'How it works' },
  { id: 'approach', label: 'Approach' },
  { id: 'contact', label: 'Contact' },
]

const FOCUS_AREAS = [
  {
    title: 'Integrate legacy and modern systems',
    body: 'Connect fragmented platforms, databases, and cloud sources into one governed foundation.',
    image: section11Image,
    alt: 'Server racks representing connected enterprise systems',
  },
  {
    title: 'Automate reporting and dashboards',
    body: 'Replace manual workflows with pipelines that deliver reliable metrics on schedule.',
    image: section12Image,
    alt: 'Analytics dashboard on a laptop screen',
  },
  {
    title: 'AI-enabled analytics',
    body: 'Layer on predictive insights, anomaly detection, and natural-language querying.',
    image: section13Image,
    alt: 'Abstract visualization suggesting AI and data patterns',
  },
  {
    title: 'Workflow automation',
    body: 'Improve operational efficiency with intelligent automation across your teams.',
    image: section14Image,
    alt: 'Team planning workflow at a desk with documents',
  },
  {
    title: 'Scalable data platforms',
    body: 'Build foundations that scale as you adopt more advanced AI capabilities.',
    image: section15Image,
    alt: 'Earth from space suggesting global scale and connectivity',
  },
]

const STEPS = [
  {
    n: 1,
    title: 'Connect & clean',
    body: 'We integrate legacy platforms, spreadsheets, and cloud sources with automated quality checks so your data is trustworthy from day one.',
    image:
      section21Image,
    alt: 'Hands typing on a laptop representing data integration work',
  },
  {
    n: 2,
    title: 'Automate & illuminate',
    body: 'Intelligent pipelines replace manual effort with real-time dashboards, scheduled reports, and clear visibility into what matters.',
    image:
      section22Image,
    alt: 'Charts and graphs illustrating business analytics',
  },
  {
    n: 3,
    title: 'Activate AI & scale',
    body: 'Add predictive analytics and NL querying on a platform designed to grow with your organisation.',
    image:
      section23Image,
    alt: 'Modern workspace with technology and collaboration',
  },
]

const APPROACH = [
  {
    title: 'Assess & strategize',
    subtitle: 'Understand your needs',
    body: 'We align on outcomes, constraints, and the fastest path to value.',
  },
  {
    title: 'Implement & innovate',
    subtitle: 'Build and integrate',
    body: 'We deliver integrations, automation, and governance with minimal disruption.',
  },
  {
    title: 'Optimize & grow',
    subtitle: 'Scale for the future',
    body: 'We iterate with you as adoption expands and requirements evolve.',
  },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function useReveal(delayMs = 0) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            obs.disconnect()
          }
        })
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return {
    ref,
    revealProps: {
      className: `reveal ${visible ? 'reveal--visible' : ''}`.trim(),
      style: { '--reveal-delay': `${delayMs}ms` },
    },
  }
}

function Reveal({ as = 'div', children, className = '', delayMs = 0 }) {
  const { ref, revealProps } = useReveal(delayMs)
  const mergedClass = `${revealProps.className} ${className}`.trim()
  return createElement(as, { ref, ...revealProps, className: mergedClass }, children)
}

function Header() {
  const [open, setOpen] = useState(false)
  const [elevated, setElevated] = useState(false)

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${elevated ? 'site-header--elevated' : ''}`} id="top">
      <div className="site-header__inner">
        <a
          href="#top"
          className="logo"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <span className="logo__mark">LX</span>
          <span className="logo__text">LegacyX</span>
        </a>

        <button
          type="button"
          className={`nav-toggle ${open ? 'nav-toggle--open' : ''}`}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="nav-toggle__bar" aria-hidden />
          <span className="nav-toggle__bar" aria-hidden />
        </button>

        <nav id="site-nav" className={`site-nav ${open ? 'site-nav--open' : ''}`}>
          <ul className="site-nav__list">
            {NAV.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="site-nav__link"
                  onClick={(e) => {
                    e.preventDefault()
                    setOpen(false)
                    scrollToId(id)
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="btn btn--primary site-nav__cta"
            onClick={(e) => {
              e.preventDefault()
              setOpen(false)
              scrollToId('contact')
            }}
          >
            Join waitlist
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__bg" aria-hidden>
        <span className="hero__orb hero__orb--1" />
        <span className="hero__orb hero__orb--2" />
        <span className="hero__orb hero__orb--3" />
      </div>
      <div className="container hero__layout">
        <div className="hero__copy hero-enter">
          <p className="eyebrow hero__eyebrow">Discover solutions</p>
          <h1 id="hero-heading" className="hero__title">
            Future-proof your enterprise
          </h1>
          <p className="hero__lead">
            Accelerate digital transformation with trusted expertise. LegacyX helps organisations
            unlock the value of their data by connecting fragmented systems and automating reporting.
          </p>
          <p className="hero__sub">
            LegacyX is AI enablement for data integration and automated insights — from reactive
            reporting to faster, intelligence-led decisions.
          </p>
          <div className="hero__actions">
            <a
              href="#contact"
              className="btn btn--light"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('contact')
              }}
            >
              Join waitlist
            </a>
            <a
              href="#steps"
              className="btn btn--ghost-light"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('steps')
              }}
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="hero__visual hero-enter hero-enter--delayed" aria-hidden="true">
          <div className="hero__frame">
            <img
              className="hero__photo"
              src={IMG.hero}
              alt=""
              width={960}
              height={640}
              decoding="async"
              fetchPriority="high"
            />
            <img className="hero__mesh" src={IMG.heroMesh} alt="" width={800} height={640} loading="lazy" />
          </div>
          <div className="hero__float-card">
            <span className="hero__float-dot" />
            <span className="hero__float-title">Trusted data layer</span>
            <span className="hero__float-text">Integrate · Automate · Insight</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Solutions() {
  return (
    <section id="solutions" className="section" aria-labelledby="solutions-heading">
      <div className="container">
        <Reveal className="section__head">
          <h2 id="solutions-heading" className="section__title">
            What we focus on
          </h2>
          <p className="section__intro section__intro--flush">
            Many teams still rely on legacy platforms, disconnected databases, and manual reporting.
            LegacyX builds modern data foundations that integrate sources, improve quality, and enable
            automated analytics.
          </p>
        </Reveal>
        <ul className="card-grid">
          {FOCUS_AREAS.map(({ title, body, image, alt }, i) => (
            <Reveal key={title} as="li" className="card card--media" delayMs={i * 75}>
              <div className="card__media">
                <img src={image} alt={alt} width={800} height={520} loading="lazy" decoding="async" />
              </div>
              <div className="card__inner">
                <h3 className="card__title">{title}</h3>
                <p className="card__body">{body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Steps() {
  return (
    <section id="steps" className="section section--alt" aria-labelledby="steps-heading">
      <div className="container">
        <Reveal className="section__head">
          <h2 id="steps-heading" className="section__title">
            Modernise your legacy data in three steps
          </h2>
          <p className="section__intro section__intro--flush">
            Connect fragmented systems, automate reporting, and unlock powerful insights — with
            minimal disruption to how your teams already work.
          </p>
        </Reveal>
        <ol className="steps">
          {STEPS.map(({ n, title, body, image, alt }, i) => (
            <Reveal key={n} as="li" className="steps__item" delayMs={i * 90}>
              <div className="steps__media">
                <img src={image} alt={alt} width={900} height={560} loading="lazy" decoding="async" />
                <span className="steps__media-glow" aria-hidden />
              </div>
              <div className="steps__content">
                <span className="steps__num" aria-hidden>
                  {n}
                </span>
                <div>
                  <h3 className="steps__title">{title}</h3>
                  <p className="steps__body">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Approach() {
  return (
    <section id="approach" className="section" aria-labelledby="approach-heading">
      <div className="container">
        <Reveal className="section__head">
          <h2 id="approach-heading" className="section__title">
            Simplifying complexity
          </h2>
          <p className="section__intro section__intro--flush">
            A clear path from assessment to scale — so stakeholders always know what happens next.
          </p>
        </Reveal>

        <Reveal className="approach-banner" delayMs={40}>
          <img
            src={IMG.approach}
            alt="Bright modern office workspace with large windows"
            width={1400}
            height={560}
            loading="lazy"
            decoding="async"
            className="approach-banner__img"
          />
          <div className="approach-banner__overlay" />
        </Reveal>

        <div className="approach">
          {APPROACH.map((item, i) => (
            <Reveal key={item.title} className="approach__card" delayMs={80 + i * 70}>
              <span className="approach__index">{i + 1}</span>
              <h3 className="approach__title">{item.title}</h3>
              <p className="approach__subtitle">{item.subtitle}</p>
              <p className="approach__body">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactForm() {
  const [status, setStatus] = useState('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function handleSubmit(e) {
    e.preventDefault()
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="form-success form-success--animate" role="status">
        <h3 className="form-success__title">Thank you</h3>
        <p className="form-success__text">
          We have received your details. The LegacyX team will be in touch shortly.
        </p>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            setStatus('idle')
            setForm({ name: '', email: '', message: '' })
          }}
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="full-name">Full name</label>
        <input
          id="full-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Jane Smith"
        />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@company.com"
        />
      </div>
      <div className="field">
        <label htmlFor="help">How can we help?</label>
        <textarea
          id="help"
          name="message"
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Tell us about your data environment and goals."
        />
      </div>
      <button type="submit" className="btn btn--primary btn--block">
        Join waitlist
      </button>
    </form>
  )
}

function Contact() {
  return (
    <section id="contact" className="section section--contact" aria-labelledby="contact-heading">
      <div className="container contact-layout">
        <Reveal className="contact-visual">
          <div className="contact-visual__frame">
            <img
              src={IMG.contact}
              alt="Modern city buildings representing growth and transformation"
              width={900}
              height={1100}
              loading="lazy"
              decoding="async"
              className="contact-visual__img"
            />
          </div>
        </Reveal>
        <div className="contact-copy">
          <h2 id="contact-heading" className="section__title section__title--left">
            Let&apos;s build your legacy
          </h2>
          <p className="contact-lead">
            Have a legacy system challenge or data transformation initiative? Let&apos;s explore how
            LegacyX can help.
          </p>
          <div className="contact-details">
            <p>
              <strong>Phone</strong>
              <br />
              <a href="tel:+61430050480">+61 430 050 480</a>
            </p>
            <p>
              <strong>Email</strong>
              <br />
              <a href="mailto:hello@legacyx.pro">hello@legacyx.pro</a>
            </p>
            <p>
              <strong>Address</strong>
              <br />
              Technology Park
              <br />
              Mawson Lakes, South Australia
              <br />
              Australia
            </p>
          </div>
          <p className="contact-footnote">Serving organisations across Australia and globally.</p>
        </div>
        <Reveal className="contact-panel-wrap" delayMs={60}>
          <div className="contact-panel">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <p className="site-footer__brand">LegacyX</p>
          <p className="site-footer__tagline">Modernising legacy systems for the data-driven era.</p>
        </div>
        <p className="site-footer__copy">© {new Date().getFullYear()} LegacyX. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Solutions />
        <Steps />
        <Approach />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
