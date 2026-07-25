import { createElement, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Check,
    ChevronDown,
    ChefHat,
    ClipboardCheck,
    FileText,
    ImagePlus,
    Mic,
    ScanLine,
    ShieldCheck,
    Sparkles,
    UtensilsCrossed,
} from 'lucide-react';
import kitchenDesktop from '../assets/images/kitchen_desktop.png';
import './CookWhatYouBoughtLanding.css';

const MotionDiv = motion.div;

const ingredientItems = ['Arroz', 'Peito de frango', 'Tomate', 'Queijo', 'Creme de leite'];

const modes = [
    { icon: FileText, label: 'Nota fiscal', text: 'Envie a foto da compra e deixe a leitura começar por você.' },
    { icon: ImagePlus, label: 'Ingredientes', text: 'Fotografe o que está na bancada, na geladeira ou na despensa.' },
    { icon: ClipboardCheck, label: 'Lista manual', text: 'Digite poucos itens ou ajuste o que a leitura encontrou.' },
    { icon: Mic, label: 'Por voz', text: 'Fale os ingredientes naturalmente; a gente organiza a lista.' },
];

const faqs = [
    {
        question: 'Preciso ter a nota fiscal?',
        answer: 'Não. Você pode enviar uma foto dos ingredientes, digitar uma lista ou informar os itens por voz.',
    },
    {
        question: 'Posso corrigir os itens antes de receber receitas?',
        answer: 'Sim. A leitura organiza os itens e você revisa a lista antes de criar qualquer sugestão.',
    },
    {
        question: 'O que acontece depois do teste?',
        answer: 'Sua conta começa com 10 gerações incluídas. Cada nova sugestão usa créditos, cujo saldo fica sempre visível no seu perfil.',
    },
    {
        question: 'Preciso informar cartão de crédito?',
        answer: 'Não. Você pode criar a conta e usar as gerações incluídas sem informar cartão.',
    },
];

const scrollGroup = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13 } },
};

const scrollItem = {
    hidden: { opacity: 0, y: 18, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 240, damping: 24 },
    },
};

function ScrollReveal({ children, className, delay = 0, distance = 28 }) {
    const reducedMotion = useReducedMotion();

    return (
        createElement(
            MotionDiv,
            {
                className,
                initial: reducedMotion ? false : { opacity: 0, y: distance },
                whileInView: reducedMotion ? undefined : { opacity: 1, y: 0 },
                viewport: { once: true, amount: 0.22 },
                transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
            },
            children,
        )
    );
}

function DemoRecipeCard({ featured = false }) {
    return (
        <article className={`jcl-demo-recipe ${featured ? 'jcl-demo-recipe--featured' : ''}`}>
            {featured && <div className="jcl-demo-recipe-photo" style={{ backgroundImage: `url(${kitchenDesktop})` }} />}
            <div className="jcl-demo-recipe-content">
                <span className="jcl-demo-recipe-kicker">{featured ? 'SUGESTÃO PARA HOJE' : 'OUTRA IDEIA'}</span>
                <h3>{featured ? 'Frango cremoso com arroz' : 'Arroz de forno com tomate'}</h3>
                <p>{featured ? '35 min · fácil' : '40 min · fácil'}</p>
            </div>
        </article>
    );
}

function ProductDemo() {
    const reducedMotion = useReducedMotion();

    return (
        <motion.div
            className="jcl-demo"
            aria-label="Demonstração: uma nota vira ingredientes e receitas"
            initial={reducedMotion ? false : { opacity: 0, y: 28, rotate: 1.25 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ type: 'spring', stiffness: 140, damping: 24, delay: 0.08 }}
        >
            <div className="jcl-demo-topbar">
                <span className="jcl-demo-brand"><Sparkles size={14} /> Já Comprei</span>
                <span className="jcl-demo-status"><span /> Demo do fluxo</span>
            </div>

            <div className="jcl-demo-flow">
                <motion.section
                    className="jcl-demo-receipt"
                    initial={reducedMotion ? false : { opacity: 0, x: -24, rotate: -6 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, x: 0, rotate: -2.5 }}
                    viewport={{ once: true, amount: 0.65 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 23, delay: 0.12 }}
                >
                    <div className="jcl-demo-receipt-head">
                        <ScanLine size={17} />
                        <span>NOTA DO MERCADO</span>
                    </div>
                    <div className="jcl-scan-line" aria-hidden="true" />
                    <p>ARROZ TIPO 1</p>
                    <p>FILE PEITO FRANGO</p>
                    <p>TOMATE ITALIANO</p>
                    <p>QUEIJO MUÇARELA</p>
                    <p>CREME DE LEITE</p>
                    <div className="jcl-demo-receipt-footer">5 itens encontrados</div>
                </motion.section>

                <span className="jcl-demo-connector" aria-hidden="true"><ArrowRight size={18} /></span>

                <motion.section
                    className="jcl-demo-pantry"
                    initial={reducedMotion ? false : 'hidden'}
                    whileInView={reducedMotion ? undefined : 'visible'}
                    viewport={{ once: true, amount: 0.55 }}
                    variants={scrollGroup}
                >
                    <div className="jcl-demo-pantry-head">
                        <div>
                            <span>SEUS INGREDIENTES</span>
                            <strong>Confira antes de criar</strong>
                        </div>
                        <span className="jcl-demo-confirm"><Check size={13} /> pronto</span>
                    </div>
                    <motion.div className="jcl-demo-chips" variants={scrollGroup}>
                        {ingredientItems.map((item) => <motion.span variants={scrollItem} key={item}><Check size={13} /> {item}</motion.span>)}
                    </motion.div>
                    <motion.button variants={scrollItem} className="jcl-demo-create" type="button" tabIndex={-1}>
                        <ChefHat size={16} /> Criar receitas
                    </motion.button>
                </motion.section>
            </div>

            <motion.div
                className="jcl-demo-output"
                initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ type: 'spring', stiffness: 180, damping: 23, delay: 0.34 }}
            >
                <div className="jcl-demo-output-heading">
                    <span><Sparkles size={15} /> Receitas que você pode fazer</span>
                    <small>3 sugestões</small>
                </div>
                <div className="jcl-demo-recipes">
                    <DemoRecipeCard featured />
                    <DemoRecipeCard />
                </div>
            </motion.div>
        </motion.div>
    );
}

function FaqItem({ item, open, onToggle }) {
    return (
        <article className={`jcl-faq-item ${open ? 'is-open' : ''}`}>
            <button type="button" onClick={onToggle} aria-expanded={open} className="jcl-faq-question">
                <span>{item.question}</span>
                <ChevronDown size={18} aria-hidden="true" />
            </button>
            <div className="jcl-faq-answer" aria-hidden={!open}>
                <p>{item.answer}</p>
            </div>
        </article>
    );
}

export default function CookWhatYouBoughtLanding() {
    const navigate = useNavigate();
    const reducedMotion = useReducedMotion();
    const [openFaq, setOpenFaq] = useState(0);

    useEffect(() => {
        document.title = 'Cozinhe o que comprou | Já Comprei';
        const description = document.querySelector('meta[name="description"]');
        if (description) description.setAttribute('content', 'Transforme sua nota fiscal em receitas para fazer hoje com o Já Comprei.');
    }, []);

    const start = () => navigate('/login', { state: { from: { pathname: '/scanner' } } });

    return (
        <div className="jcl-landing">
            <header className="jcl-header">
                <button className="jcl-logo" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao início">
                    <span><Sparkles size={18} /></span>
                    <strong>Já Comprei</strong>
                </button>
                <button className="jcl-login" type="button" onClick={() => navigate('/login')}>Já tenho conta</button>
            </header>

            <main>
                <section className="jcl-hero">
                    <div className="jcl-hero-copy">
                        <p className="jcl-eyebrow"><span /> Para quem fez mercado e ainda não sabe o que cozinhar</p>
                        <h1>Transforme sua <em>nota fiscal</em> em receitas para fazer hoje.</h1>
                        <p className="jcl-hero-description">O Já Comprei lê os itens da sua compra, deixa você revisar tudo e sugere pratos com o que já entrou na sua cozinha.</p>
                        <div className="jcl-hero-actions">
                            <button type="button" onClick={start} className="jcl-primary-button">Criar minha primeira receita <ArrowRight size={19} /></button>
                            <p><Check size={15} /> 10 gerações incluídas · sem cartão · você revisa antes</p>
                        </div>
                    </div>
                    <ProductDemo />
                </section>

                <motion.section
                    className="jcl-reassurance"
                    aria-label="Benefícios principais"
                    initial={reducedMotion ? false : 'hidden'}
                    whileInView={reducedMotion ? undefined : 'visible'}
                    viewport={{ once: true, amount: 0.6 }}
                    variants={scrollGroup}
                >
                    <motion.p variants={scrollItem}><span>01</span> Uma foto é suficiente para começar</motion.p>
                    <motion.p variants={scrollItem}><span>02</span> Você controla os ingredientes da lista</motion.p>
                    <motion.p variants={scrollItem}><span>03</span> Receitas possíveis, não inspiração vaga</motion.p>
                </motion.section>

                <section className="jcl-proof-section">
                    <div className="jcl-section-heading">
                        <p className="jcl-eyebrow"><span /> Mostre, não prometa</p>
                        <h2>O que era uma compra vira <em>um plano para o jantar.</em></h2>
                        <p>Você começa com o que entrou na sacola e termina com sugestões que fazem sentido para os ingredientes que já tem.</p>
                    </div>
                    <div className="jcl-proof-layout">
                        <motion.div className="jcl-proof-steps" initial={reducedMotion ? false : 'hidden'} whileInView={reducedMotion ? undefined : 'visible'} viewport={{ once: true, amount: 0.35 }} variants={scrollGroup}>
                            <motion.article variants={scrollItem}>
                                <span>1</span>
                                <div><strong>Envie uma foto</strong><p>Da nota fiscal ou dos ingredientes que estão aí.</p></div>
                            </motion.article>
                            <motion.article variants={scrollItem}>
                                <span>2</span>
                                <div><strong>Confira a leitura</strong><p>Edite, remova ou acrescente itens antes de gerar.</p></div>
                            </motion.article>
                            <motion.article variants={scrollItem}>
                                <span>3</span>
                                <div><strong>Escolha o que cozinhar</strong><p>Veja várias possibilidades para decidir sem ficar travado.</p></div>
                            </motion.article>
                        </motion.div>
                        <ScrollReveal className="jcl-proof-screen" delay={0.12} distance={34}>
                            <div className="jcl-proof-screen-top"><span /><span /><span /></div>
                            <div className="jcl-proof-phone">
                                <img src="/mockups/recipe_detail/screen.png" alt="Exemplo de tela de receita no Já Comprei" />
                                <div className="jcl-proof-badge"><ChefHat size={16} /><span>Receita<br /><strong>pronta</strong></span></div>
                            </div>
                            <p>Tela real do produto</p>
                        </ScrollReveal>
                    </div>
                </section>

                <section className="jcl-how-section">
                    <div className="jcl-section-heading jcl-section-heading--center">
                        <p className="jcl-eyebrow"><span /> Como funciona</p>
                        <h2>Três passos. <em>Sem planejar demais.</em></h2>
                    </div>
                    <motion.div className="jcl-how-grid" initial={reducedMotion ? false : 'hidden'} whileInView={reducedMotion ? undefined : 'visible'} viewport={{ once: true, amount: 0.2 }} variants={scrollGroup}>
                        <motion.article variants={scrollItem}><span>01</span><div className="jcl-how-icon"><ScanLine size={25} /></div><h3>Mostre o que comprou</h3><p>Fotografe a nota ou os ingredientes. O começo não precisa ser perfeito.</p></motion.article>
                        <motion.article variants={scrollItem}><span>02</span><div className="jcl-how-icon"><ClipboardCheck size={25} /></div><h3>Deixe sua lista certa</h3><p>Confira os itens identificados e ajuste o que precisar antes das sugestões.</p></motion.article>
                        <motion.article variants={scrollItem}><span>03</span><div className="jcl-how-icon"><UtensilsCrossed size={25} /></div><h3>Escolha sua próxima receita</h3><p>Descubra pratos para hoje e salve os que quiser repetir depois.</p></motion.article>
                    </motion.div>
                </section>

                <section className="jcl-modes-section">
                    <div className="jcl-modes-copy">
                        <p className="jcl-eyebrow"><span /> Do seu jeito</p>
                        <h2>Sem nota? Ainda dá para começar.</h2>
                        <p>O produto não depende de uma única porta de entrada. Use o caminho que estiver mais perto de você agora.</p>
                    </div>
                    <motion.div className="jcl-modes-grid" initial={reducedMotion ? false : 'hidden'} whileInView={reducedMotion ? undefined : 'visible'} viewport={{ once: true, amount: 0.2 }} variants={scrollGroup}>
                        {modes.map(({ icon, label, text }) => (
                            <motion.article variants={scrollItem} key={label}><span>{createElement(icon, { size: 19 })}</span><h3>{label}</h3><p>{text}</p></motion.article>
                        ))}
                    </motion.div>
                </section>

                <section className="jcl-faq-section">
                    <div className="jcl-faq-intro">
                        <p className="jcl-eyebrow"><span /> Sem letra miúda</p>
                        <h2>As perguntas que vêm antes do primeiro teste.</h2>
                    </div>
                    <div className="jcl-faq-list">
                        {faqs.map((item, index) => <FaqItem key={item.question} item={item} open={openFaq === index} onToggle={() => setOpenFaq(openFaq === index ? -1 : index)} />)}
                    </div>
                </section>

                <section className="jcl-final-cta">
                    <div>
                        <p className="jcl-eyebrow"><span /> Comece pela sua próxima compra</p>
                        <h2>Já comprou. Agora descubra <em>o que fazer com isso.</em></h2>
                        <p>Crie sua conta, envie a primeira foto e deixe a decisão do jantar mais simples.</p>
                        <button type="button" onClick={start} className="jcl-primary-button">Criar minha primeira receita <ArrowRight size={19} /></button>
                    </div>
                </section>
            </main>

            <footer className="jcl-footer">
                <span className="jcl-logo"><span><Sparkles size={16} /></span><strong>Já Comprei</strong></span>
                <p>© {new Date().getFullYear()} Já Comprei · Feito para aproveitar melhor o que já está na sua cozinha.</p>
            </footer>
        </div>
    );
}
