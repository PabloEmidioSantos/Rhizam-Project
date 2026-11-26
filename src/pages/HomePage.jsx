import { useRef, useState } from "react";
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
    title: "Indústrias, fabricantes e convertedoras",
    text: "Incluindo indústrias gráficas e outras operações que atendem exclusivamente o mercado B2B.",
    image: "/imgs/Seção 4.0 Geral.webp",
    alt: "Profissional registra informações durante uma reunião corporativa.",
  },
  {
    title: "Importadoras e distribuidoras",
    text: "Operações de médio porte que buscam conectar canais digitais, equipe comercial e giro de estoque.",
    image: "/imgs/Seção 4.1 Distribuidora.webp",
    alt: "Profissionais organizam caixas em um centro de distribuição.",
  },
  {
    title: "Marcas para especificadores",
    text: "Marcas de pisos, acabamentos e outros segmentos cuja venda envolve a recomendação de especificadores.",
    image: "/imgs/Seção 4.2 Indústria.webp",
    alt: "Profissional trabalha em uma linha de produção industrial.",
  },
  {
    title: "Redes de lojistas e parceiros comerciais",
    text: "Canais B2B que precisam alinhar presença digital, oferta e relacionamento comercial.",
    image: "/imgs/Seção 4.3 Importadoras.webp",
    alt: "Navio cargueiro transporta contêineres em uma operação de comércio exterior.",
  },
];

function ContactForm() {
  const [status, setStatus] = useState({ message: "", kind: "error" });
  const [sending, setSending] = useState(false);
  const submissionInProgress = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;
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

    submissionInProgress.current = true;
    setSending(true);
    setStatus({ message: "", kind: "error" });
    try {
      await submitContactRequest({ ...validation.values, website: form.elements.website.value });
      form.reset();
      setStatus({ message: "Mensagem recebida. Obrigado por entrar em contato com a RHIZAM.", kind: "success" });
    } catch (error) {
      setStatus({ message: getErrorMessage(error, "Não foi possível enviar sua mensagem. Tente novamente."), kind: "error" });
    } finally {
      submissionInProgress.current = false;
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-field-row">
        <label htmlFor="contact-name">Seu nome <span>*</span><input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} disabled={sending} /></label>
        <label htmlFor="contact-email">E-mail <span>*</span><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} disabled={sending} /></label>
      </div>
      <label htmlFor="contact-company">Empresa<input id="contact-company" name="company" autoComplete="organization" maxLength={160} disabled={sending} /></label>
      <label htmlFor="contact-message">Como podemos ajudar? <span>*</span><textarea id="contact-message" name="message" rows="5" required minLength={10} maxLength={5000} disabled={sending} /></label>
      <div className="honeypot" aria-hidden="true"><label>Não preencha este campo<input name="website" tabIndex="-1" autoComplete="off" disabled={sending} /></label></div>
      <div className="contact-submit-row">
        <span>* Campos obrigatórios</span>
        <button className="primary-button" type="submit" disabled={sending}>{sending ? "Enviando…" : "Enviar mensagem →"}</button>
      </div>
      <Feedback kind={status.kind}>{status.message}</Feedback>
    </form>
  );
}

function Portfolio() {
  const { data, loading, error } = useAsyncData(listPublicProjects);
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
          <img className="hero-media" src="/imgs/Seção 1.webp" alt="Profissional acompanha indicadores comerciais em um painel digital." fetchPriority="high" />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-copy section-shell">
            <p className="eyebrow">Engenharia comercial e digital B2B</p>
            <h1 id="hero-title">Estratégia comercial para operações B2B.</h1>
            <p>A Rhizam integra tráfego pago, e-commerce em lote, automação de CRM, redes sociais, lives e trade marketing digital — com foco em previsibilidade de caixa, margem e giro real de estoque.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#solucoes">Conhecer serviços</a>
              <a className="text-link" href="#contato">Solicitar diagnóstico →</a>
            </div>
          </div>
        </section>

        <section className="about-section anchor-section" id="sobre" aria-labelledby="about-title" tabIndex="-1">
          <div className="section-shell about-layout">
            <div className="about-media">
              <img src="/imgs/Seção 2.webp" alt="Equipe de gestão consulta informações em um centro de distribuição." loading="lazy" />
            </div>
            <div className="about-copy">
              <p className="eyebrow eyebrow-blue">Por que a Rhizam?</p>
              <h2 id="about-title">Engenharia comercial para além das métricas de vaidade.</h2>
              <p>Diferente de agências focadas apenas em volume de postagens, a Rhizam conecta canais digitais e operação comercial B2B.</p>
              <p>A estratégia considera previsibilidade de caixa, margem e giro real de estoque, com base na vivência prática de quem conhece grandes operações corporativas e de distribuição no Brasil.</p>
            </div>
          </div>
        </section>

        <section className="solutions-section anchor-section" id="solucoes" aria-labelledby="solutions-title" tabIndex="-1">
          <div className="section-shell">
            <p className="eyebrow">A solução</p>
            <div className="section-heading-row">
              <h2 id="solutions-title">Frentes digitais conectadas à estratégia comercial.</h2>
              <p>Da geração de demanda à conversão, integramos canais digitais ao contexto de operações B2B.</p>
            </div>
            <div className="solutions-grid">
              <article>
                <span>01</span>
                <h3>Tráfego pago e trade marketing digital</h3>
                <p>Campanhas de tráfego pago de alta performance e ações de trade marketing digital para o ecossistema B2B.</p>
              </article>
              <article>
                <span>02</span>
                <h3>E-commerce B2B em lote</h3>
                <p>Estratégias de comércio eletrônico pensadas para vendas em lote, lojistas e parceiros comerciais.</p>
              </article>
              <article>
                <span>03</span>
                <h3>CRM, redes sociais e lives</h3>
                <p>Automação de relacionamento, conteúdo e transmissões ao vivo conectados à estratégia de vendas — não ao volume de postagens.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="image-feature" aria-label="Ambiente de operação digital">
          <img src="/imgs/Seção 3.webp" alt="Transmissão ao vivo de produtos exibida ao lado de uma loja online em um computador." loading="lazy" />
          <div className="image-feature-copy">
            <p className="eyebrow">Vivência em operações B2B</p>
            <h2>Estratégia conduzida por quem conhece grandes operações por dentro.</h2>
            <p>Quem comanda a estratégia possui vivência prática nas maiores operações corporativas e de distribuição do Brasil.</p>
          </div>
        </section>

        <section className="operating-section anchor-section" id="atuacao" aria-labelledby="operating-title" tabIndex="-1">
          <div className="section-shell">
            <p className="eyebrow eyebrow-blue">Para quem é</p>
            <div className="section-heading-row">
              <h2 id="operating-title">Para decisores de operações B2B em São Paulo.</h2>
              <p>Atendemos donos, diretores comerciais e gestores — não o consumidor final B2C.</p>
            </div>
            <div className="operating-grid">
              {operatingAreas.map((area) => (
                <article className="operating-card" key={area.title}>
                  <img src={area.image} alt={area.alt} loading="lazy" />
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

        <section className="contact-section anchor-section" id="contato" aria-labelledby="contact-title" tabIndex="-1">
          <div className="section-shell contact-layout">
            <div className="contact-copy">
              <p className="eyebrow">Diagnóstico B2B</p>
              <h2 id="contact-title">Agende uma conversa sobre os desafios da sua operação.</h2>
              <p>Conte sobre sua empresa e o contexto comercial que deseja discutir.</p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
