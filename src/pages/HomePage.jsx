import { useState } from "react";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { getErrorMessage } from "../lib/errors.js";
import { validateContactRequest } from "../lib/contactValidation.js";
import { supabaseConfigError } from "../lib/supabase.js";
import { submitContactRequest } from "../services/contactService.js";
import { listPublicProjects } from "../services/portfolioService.js";
import { Feedback, LoadingState } from "../components/Feedback.jsx";
import PartnerCarousel from "../components/PartnerCarousel.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

const operatingAreas = [
  {
    title: "Operação geral",
    text: "Ambientes conectados para acompanhar processos, equipes e informações em uma mesma operação.",
    image: "/imgs/Seção 4.0 Geral.webp",
  },
  {
    title: "Distribuição",
    text: "Estruturas digitais voltadas à organização de fluxos, estoques e atividades de distribuição.",
    image: "/imgs/Seção 4.1 Distribuidora.webp",
  },
  {
    title: "Indústria",
    text: "Informações e ferramentas organizadas para apoiar decisões em ambientes industriais.",
    image: "/imgs/Seção 4.2 Indústria.webp",
  },
  {
    title: "Importação",
    text: "Visibilidade operacional para processos comerciais e logísticos que envolvem importações.",
    image: "/imgs/Seção 4.3 Importadoras.webp",
  },
];

function ContactForm() {
  const [status, setStatus] = useState({ message: "", kind: "error" });
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (form.elements.website.value) return;
    if (supabaseConfigError) {
      setStatus({ message: "O formulário ainda não está conectado. Entre em contato após a configuração do serviço.", kind: "error" });
      return;
    }

    const validation = validateContactRequest(Object.fromEntries(new FormData(form)));
    if (!validation.valid) {
      setStatus({ message: validation.error, kind: "error" });
      return;
    }

    setSending(true);
    setStatus({ message: "", kind: "error" });
    try {
      await submitContactRequest({ ...validation.values, website: form.elements.website.value });
      form.reset();
      setStatus({ message: "Mensagem recebida. Obrigado por entrar em contato com a RHIZAM.", kind: "success" });
    } catch (error) {
      setStatus({ message: getErrorMessage(error, "Não foi possível enviar sua mensagem. Tente novamente."), kind: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-field-row">
        <label htmlFor="contact-name">Seu nome <span>*</span><input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
        <label htmlFor="contact-email">E-mail <span>*</span><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      </div>
      <label htmlFor="contact-company">Empresa<input id="contact-company" name="company" autoComplete="organization" maxLength={160} /></label>
      <label htmlFor="contact-message">Como podemos ajudar? <span>*</span><textarea id="contact-message" name="message" rows="5" required minLength={10} maxLength={5000} /></label>
      <div className="honeypot" aria-hidden="true"><label>Não preencha este campo<input name="website" tabIndex="-1" autoComplete="off" /></label></div>
      <div className="contact-submit-row">
        <span>* Campos obrigatórios</span>
        <button className="primary-button" type="submit" disabled={sending}>{sending ? "Enviando…" : "Enviar mensagem →"}</button>
      </div>
      <Feedback kind={status.kind}>{status.message}</Feedback>
    </form>
  );
}

function Portfolio() {
  const { data, loading, error } = useAsyncData(listPublicProjects, []);
  return (
    <section className="portfolio-section" id="projetos" aria-labelledby="portfolio-title">
      <div className="section-shell">
        <p className="eyebrow">Projetos publicados</p>
        <div className="section-heading-row">
          <h2 id="portfolio-title">Soluções em operação</h2>
          <p>Conheça os projetos publicados pela RHIZAM.</p>
        </div>
        {loading && <LoadingState label="Carregando projetos…" />}
        {error && <Feedback>{error}</Feedback>}
        {!loading && !error && data?.length === 0 && <p className="empty-state-light">Novos projetos serão apresentados aqui.</p>}
        {data?.length > 0 && (
          <div className="portfolio-grid">
            {data.map((project) => (
              <article className="portfolio-card" key={project.id}>
                <span>RHIZAM · PROJETO</span>
                <h3>{project.title}</h3>
                <p>{project.public_summary}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="home-hero" id="topo" aria-labelledby="hero-title">
          <img className="hero-media" src="/imgs/Seção 1.webp" alt="" fetchPriority="high" />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-copy section-shell">
            <p className="eyebrow">Operações digitais</p>
            <h1 id="hero-title">Tecnologia para fazer<br />negócios avançarem.</h1>
            <p>Visibilidade, integração e ferramentas digitais para operações que precisam evoluir.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#solucoes">Conhecer soluções</a>
              <a className="text-link" href="#contato">Falar com a RHIZAM →</a>
            </div>
          </div>
        </section>

        <section className="about-section" id="sobre">
          <div className="section-shell about-layout">
            <div className="about-media">
              <img src="/imgs/Seção 2.webp" alt="Gestão digital em ambiente corporativo" loading="lazy" />
            </div>
            <div className="about-copy">
              <p className="eyebrow eyebrow-blue">Sobre a RHIZAM</p>
              <h2>Conectar operação, informação e estratégia.</h2>
              <p>A RHIZAM trabalha com soluções digitais orientadas à realidade de operações comerciais e industriais.</p>
              <p>O trabalho é organizado em torno da compreensão do processo, da integração entre ferramentas e da entrega de uma experiência confiável para equipes e decisões.</p>
            </div>
          </div>
        </section>

        <section className="solutions-section" id="solucoes">
          <div className="section-shell">
            <p className="eyebrow">O que podemos organizar</p>
            <div className="section-heading-row">
              <h2>Soluções digitais com foco operacional.</h2>
              <p>Estruturas pensadas para acompanhar dados, processos e resultados em ambientes digitais B2B.</p>
            </div>
            <div className="solutions-grid">
              <article>
                <span>01</span>
                <h3>Plataformas digitais</h3>
                <p>Interfaces e sistemas organizados para uso interno, operações e relacionamento com parceiros.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Integrações</h3>
                <p>Conexão entre serviços e ferramentas para reduzir retrabalho e melhorar a consistência das informações.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Automação</h3>
                <p>Fluxos digitais voltados a tarefas recorrentes, acompanhamento e tratamento de dados.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="image-feature" aria-label="Ambiente de operação digital">
          <img src="/imgs/Seção 3.webp" alt="Equipe trabalhando em operação digital" loading="lazy" />
          <div className="image-feature-copy">
            <p className="eyebrow">Experiência com tecnologia</p>
            <h2>Uma visão clara para cada etapa da operação.</h2>
          </div>
        </section>

        <section className="operating-section" id="atuacao">
          <div className="section-shell">
            <p className="eyebrow eyebrow-blue">Ambientes de atuação</p>
            <div className="section-heading-row">
              <h2>Contextos diferentes.<br />Estruturas adequadas.</h2>
              <p>Conheça alguns ambientes representados pelo material institucional da RHIZAM.</p>
            </div>
            <div className="operating-grid">
              {operatingAreas.map((area) => (
                <article className="operating-card" key={area.title}>
                  <img src={area.image} alt="" loading="lazy" />
                  <div>
                    <h3>{area.title}</h3>
                    <p>{area.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="partners-section" id="parceiros">
          <div className="section-shell">
            <p className="eyebrow eyebrow-blue">Tecnologias e parceiros</p>
            <PartnerCarousel />
          </div>
        </section>

        <Portfolio />

        <section className="contact-section" id="contato">
          <div className="section-shell contact-layout">
            <div className="contact-copy">
              <p className="eyebrow">Comece uma conversa</p>
              <h2>Conte qual desafio sua operação precisa resolver.</h2>
              <p>Envie uma mensagem para iniciar o contato com a RHIZAM.</p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
