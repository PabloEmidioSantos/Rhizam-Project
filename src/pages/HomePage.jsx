import { useState } from "react";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { getErrorMessage } from "../lib/errors.js";
import { validateContactRequest } from "../lib/contactValidation.js";
import { supabaseConfigError } from "../lib/supabase.js";
import { submitContactRequest } from "../services/contactService.js";
import { listPublicProjects } from "../services/portfolioService.js";
import { Feedback, LoadingState } from "../components/Feedback.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

const services = [
  { number: "01", title: "Desenvolvimento de sites", text: "Sites funcionais e responsivos para apresentar sua empresa com clareza em qualquer tela.", icon: "▣" },
  { number: "02", title: "Estratégia digital", text: "Orientação para construir uma presença online alinhada às necessidades do seu negócio.", icon: "⌕" },
  { number: "03", title: "Design personalizado", text: "Composições visuais criadas para refletir a identidade e os objetivos de cada cliente.", icon: "✳" },
  { number: "04", title: "Suporte contínuo", text: "Acompanhamento para apoiar a continuidade da sua solução digital.", icon: "↻" },
];

const principles = [
  ["Personalização", "Soluções digitais alinhadas às necessidades de cada cliente."],
  ["Acessibilidade", "Experiências pensadas para diferentes pessoas e habilidades."],
  ["Qualidade", "Cuidado e responsabilidade em cada detalhe do trabalho."],
  ["Criatividade", "Inovação aplicada para transformar ideias em soluções."],
  ["Proximidade", "Atendimento próximo, ético e transparente ao longo do projeto."],
  ["Comprometimento", "Uma parceria guiada pelas necessidades de cada cliente."],
];

const process = [
  ["Entender", "Conhecemos suas necessidades, seu negócio e seus objetivos."],
  ["Planejar", "Alinhamos a proposta de solução ao que faz sentido para você."],
  ["Desenvolver", "Damos forma ao projeto com tecnologia e design personalizado."],
  ["Validar e entregar", "Revisamos o projeto em conjunto e realizamos a entrega."],
  ["Acompanhar", "Oferecemos suporte contínuo para sua solução digital."],
];

const ods = [
  ["04", "Educação de qualidade", "Inclusão digital e orientação para uso das plataformas."],
  ["08", "Trabalho decente e crescimento econômico", "Presença digital para apoiar pequenos e médios negócios."],
  ["09", "Indústria, inovação e infraestrutura", "Soluções tecnológicas e transformação digital."],
  ["10", "Redução das desigualdades", "Sites acessíveis a pessoas com diferentes habilidades."],
  ["12", "Consumo e produção responsáveis", "Otimização de recursos e menos materiais físicos."],
];

const esg = [
  ["E", "Ambiental", "Priorizar processos digitais, otimizar recursos dos sites e usar equipamentos e energia de forma consciente."],
  ["S", "Social", "Desenvolver experiências acessíveis, orientar clientes e valorizar respeito, diversidade e aprendizagem."],
  ["G", "Governança", "Agir com transparência, clareza sobre responsabilidades e respeito à privacidade."],
];

const faq = [
  ["Quais serviços a MONOLITH oferece?", "Desenvolvimento de sites, estratégia digital, design personalizado e suporte contínuo."],
  ["Para quais empresas são as soluções?", "A MONOLITH busca fortalecer a presença digital de empresas, principalmente pequenos e médios negócios."],
  ["Como começa um projeto?", "A proposta de atendimento começa pela conversa para entender necessidades, segue com planejamento, desenvolvimento, validação e entrega, e pode incluir suporte contínuo. As etapas são ajustadas a cada projeto."],
  ["Onde fica a MONOLITH?", "A documentação institucional informa Centro, Carapicuíba, São Paulo, na região da Avenida Inocêncio Seráfico. O atendimento deve ser combinado diretamente."],
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
      setStatus({ message: "Mensagem recebida. Obrigado por entrar em contato com a MONOLITH.", kind: "success" });
    } catch (error) {
      setStatus({ message: getErrorMessage(error, "Não foi possível enviar sua mensagem. Tente novamente."), kind: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-field-row">
        <label>Seu nome <span>*</span><input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
        <label>E-mail <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      </div>
      <label>Empresa<input name="company" autoComplete="organization" maxLength={160} /></label>
      <label>Como podemos ajudar? <span>*</span><textarea name="message" rows="4" required minLength={10} maxLength={5000} /></label>
      <div className="honeypot" aria-hidden="true"><label>Não preencha este campo<input name="website" tabIndex="-1" autoComplete="off" /></label></div>
      <div className="contact-submit-row">
        <span>* Campos obrigatórios</span>
        <button className="gold-button" type="submit" disabled={sending}>{sending ? "Enviando…" : "Enviar mensagem ↗"}</button>
      </div>
      <Feedback kind={status.kind}>{status.message}</Feedback>
    </form>
  );
}

function Portfolio() {
  const { data, loading, error } = useAsyncData(listPublicProjects, []);
  return (
    <section className="portfolio-section" id="portfolio" aria-labelledby="portfolio-title">
      <div className="section-shell">
        <p className="eyebrow">Projetos selecionados</p>
        <div className="section-heading-row"><h2 id="portfolio-title">Presença que ganha forma.</h2><p>Projetos publicados pela MONOLITH.</p></div>
        {loading && <LoadingState label="Carregando portfólio…" />}
        {error && <Feedback>{error}</Feedback>}
        {!loading && !error && data?.length === 0 && <p className="empty-portfolio">Os projetos serão apresentados aqui quando forem publicados.</p>}
        {data?.length > 0 && <div className="portfolio-grid">{data.map((project) => <article className="portfolio-card" key={project.id}><span>MONOLITH · PROJETO</span><h3>{project.title}</h3><p>{project.public_summary}</p></article>)}</div>}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="home-hero" id="topo">
          <div className="hero-geometry" aria-hidden="true"><div className="hero-stone"><span /></div></div>
          <div className="hero-copy section-shell">
            <p className="eyebrow">Tecnologia com propósito</p>
            <h1>Presença digital<br />que <em>impulsiona.</em></h1>
            <p className="hero-slogan">Construindo presença digital, impulsionando negócios.</p>
            <p className="hero-description">Criamos sites e soluções digitais personalizadas para empresas que querem se apresentar com credibilidade e crescer no ambiente online.</p>
            <div className="hero-actions"><a className="gold-button" href="#servicos">Conheça os serviços ↘</a><a className="inline-link" href="#contato">Entre em contato ↗</a></div>
            <p className="hero-location">Carapicuíba, São Paulo</p>
          </div>
          <a className="scroll-cue" href="#sobre">Explore ↓</a>
        </section>

        <section className="about-section light-section" id="sobre">
          <div className="section-shell about-layout">
            <div><p className="eyebrow eyebrow-dark">01 / A empresa</p><p className="side-note">Uma única pedra.<br />Uma presença feita para durar.</p></div>
            <div className="about-copy"><h2>Uma presença forte começa com <em>propósito.</em></h2><div className="about-columns"><p>A MONOLITH nasceu da percepção de que, em um mundo cada vez mais conectado, estar presente na internet deixou de ser apenas um diferencial. É parte do caminho para empresas que desejam crescer e conquistar novos clientes.</p><p>Unimos tecnologia, criatividade e qualidade para desenvolver sites e soluções digitais personalizadas — especialmente para pequenos e médios negócios que buscam se apresentar com mais credibilidade.</p></div><div className="mission-strip"><span>M.</span><p><strong>Nosso propósito</strong>Criar soluções digitais acessíveis e eficientes que fortaleçam a presença online e contribuam para o crescimento dos nossos clientes.</p></div></div>
          </div>
        </section>

        <section className="services-section" id="servicos">
          <div className="section-shell"><p className="eyebrow">O que fazemos</p><div className="section-heading-row"><h2>Soluções pensadas<br />para o seu negócio.</h2><p>Cada projeto parte de uma necessidade real. Combinamos estratégia e cuidado em cada detalhe para criar uma experiência digital que faça sentido para você.</p></div><div className="services-grid">{services.map((service) => <article className="service-card" key={service.number}><span className="service-number">{service.number}</span><span className="service-icon" aria-hidden="true">{service.icon}</span><h3>{service.title}</h3><p>{service.text}</p></article>)}</div><div className="service-bottom"><span>Do primeiro esboço ao próximo passo.</span><a className="inline-link" href="#contato">Conte pra gente o que você precisa ↗</a></div></div>
        </section>

        <Portfolio />

        <section className="principles-section light-section">
          <div className="section-shell principles-layout"><div><p className="eyebrow eyebrow-dark">Como pensamos</p><h2>Feito para pessoas.<br /><em>Construído para durar.</em></h2><p className="principles-intro">O significado do nosso nome inspira a forma como trabalhamos: com solidez, atenção e respeito por cada projeto.</p></div><div className="principles-list">{principles.map(([title, description], index) => <article className="principle-row" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></div>
        </section>

        <section className="process-section" id="processo">
          <div className="section-shell"><p className="eyebrow">Uma parceria próxima</p><div className="section-heading-row"><h2>Um caminho claro,<br />feito em conjunto.</h2><p>Esta sequência apresenta uma experiência de atendimento que pode ser ajustada às necessidades de cada projeto.</p></div><ol className="process-list">{process.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></div>
        </section>

        <section className="commitments-section light-section" id="compromissos">
          <div className="section-shell"><p className="eyebrow eyebrow-dark">Responsabilidade em cada escolha</p><div className="section-heading-row"><h2>Tecnologia com<br /><em>olhar para o futuro.</em></h2><p>Compromissos com sustentabilidade, inclusão e transparência fazem parte da maneira como pensamos soluções digitais.</p></div><div className="impact-grid"><div className="ods-panel"><div className="panel-title"><span>Objetivos de Desenvolvimento Sustentável</span><span>ONU · ODS</span></div>{ods.map(([number, title, text]) => <article className="ods-row" key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div><div className="esg-panel"><div className="panel-title"><span>Princípios ESG</span><span>Na prática</span></div>{esg.map(([letter, title, text]) => <article className="esg-row" key={letter}><span>{letter}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></div>
        </section>

        <section className="faq-section">
          <div className="section-shell faq-layout"><div><p className="eyebrow">Perguntas frequentes</p><h2>Vamos esclarecer<br />o começo.</h2></div><div className="faq-list">{faq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div>
        </section>

        <section className="contact-section" id="contato">
          <div className="section-shell contact-layout"><div className="contact-copy"><p className="eyebrow">Vamos construir juntos</p><h2>Sua próxima ideia começa com uma <em>conversa.</em></h2><p>Conte um pouco sobre seu negócio e o que você precisa. Será um prazer conhecer seu projeto.</p><div className="contact-location"><span aria-hidden="true">⌖</span><p>Carapicuíba, São Paulo<br /><small>Centro · Avenida Inocêncio Seráfico</small></p></div><p className="contact-note">As informações oficiais de contato serão divulgadas em breve.</p></div><ContactForm /></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
