/**
 * App.jsx — La Bella Pizzaria
 * Pindamonhangaba · SP
 *
 * Veja os comentários [PASSO X] para saber exatamente o que personalizar.
 * Guia completo em PERSONALIZACAO.md
 */

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, collection,
  getDocs, deleteDoc, query, orderBy, writeBatch
} from "firebase/firestore";
import React, { useState, useReducer, useContext, createContext, useCallback, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   [PASSO 1] FIREBASE CONFIG
   Cole aqui os dados do seu projeto Firebase.
═══════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyBM_96U5QXTaS3PQbhvduKLEFgN5uy7yis",
  authDomain: "labella-pizzaria.firebaseapp.com",
  projectId: "labella-pizzaria",
  storageBucket: "labella-pizzaria.firebasestorage.app",
  messagingSenderId: "825776243571",
  appId: "1:825776243571:web:ec70a264f9eef78c683b06"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db  = getFirestore(app)
const COL_ORDERS = "pedidos"

async function fbSaveOrder(order) {
  try { await setDoc(doc(db, COL_ORDERS, order.id), order) }
  catch (e) { console.error("Erro ao salvar pedido:", e) }
}
async function fbLoadOrders() {
  try {
    const q = query(collection(db, COL_ORDERS), orderBy("date", "desc"))
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data())
  } catch (e) { console.error("Erro ao carregar pedidos:", e); return [] }
}
async function fbDeleteOrder(id) {
  try { await deleteDoc(doc(db, COL_ORDERS, id)) }
  catch (e) { console.error("Erro ao deletar:", e) }
}
async function fbClearOrders() {
  try {
    const snap = await getDocs(collection(db, COL_ORDERS))
    const batch = writeBatch(db)
    snap.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
  } catch (e) { console.error("Erro ao limpar pedidos:", e) }
}
async function fbLoadPrices() {
  try {
    const d = await getDoc(doc(db, "config", "precos"))
    return d.exists() ? d.data() : {}
  } catch (e) { console.error("Erro ao carregar precos:", e); return {} }
}
async function fbSavePrices(pricesObj) {
  try { await setDoc(doc(db, "config", "precos"), pricesObj) }
  catch (e) { console.error("Erro ao salvar precos:", e) }
}

/* ═══════════════════════════════════════════════════════
   [PASSO 2] ADMIN CONFIG
   Troque usuário e senha antes de publicar.
═══════════════════════════════════════════════════════ */
const ADMIN_CONFIG = {
  username:   "admin",
  password:   "labella2026",
  sessionKey: "lb_admin_ok",
}

/* ═══════════════════════════════════════════════════════
   ESTILOS GLOBAIS
   Paleta: madeira escura · vinho · amarelo · branco
═══════════════════════════════════════════════════════ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;600;700&family=Lato:wght@400;700&display=swap');

  :root {
    --wine:       #5C1A1A;
    --wine-dk:    #3E0F0F;
    --wine-lt:    #7A2424;
    --yellow:     #F5C518;
    --yellow-dk:  #C9A110;
    --yellow-gl:  rgba(245,197,24,0.15);
    --white:      #FFFFFF;
    --dim:        rgba(255,255,255,0.55);
    --border:     rgba(245,197,24,0.2);
    --border-md:  rgba(245,197,24,0.42);
    --surface:    rgba(0,0,0,0.32);
  }

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}

  body{
    font-family:'Lato',sans-serif;
    color:var(--white);
    overflow-x:hidden;
    background-color:#231008;
    /* Textura de madeira com veios e faixas de tabua */
    background-image:
      repeating-linear-gradient(
        172deg,
        transparent 0px, transparent 22px,
        rgba(0,0,0,0.09) 22px, rgba(0,0,0,0.09) 23px,
        transparent 23px, transparent 48px,
        rgba(255,255,255,0.025) 48px, rgba(255,255,255,0.025) 49px
      ),
      repeating-linear-gradient(
        180deg,
        rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px,
        transparent 1px, transparent 88px,
        rgba(0,0,0,0.28) 88px, rgba(0,0,0,0.28) 90px,
        transparent 90px, transparent 176px
      ),
      linear-gradient(
        155deg,
        #3D2008 0%, #251005 28%, #3A1C07 52%, #241004 78%, #361A06 100%
      );
  }

  .gv   { font-family:'Great Vibes',cursive; }
  .mont { font-family:'Montserrat',sans-serif; }
  button{ cursor:pointer; font-family:'Lato',sans-serif; }
  input,textarea{ font-family:'Lato',sans-serif; }
  a{ text-decoration:none; color:inherit; }

  /* BOTOES */
  .by{ background:var(--yellow); color:#1a0800; border:none; font-weight:700; transition:background .15s,transform .1s; }
  .by:hover{ background:var(--yellow-dk); transform:translateY(-1px); }

  .bw{ background:var(--wine); color:#fff; border:none; font-weight:700; transition:background .15s; }
  .bw:hover{ background:var(--wine-lt); }

  .bo{ background:transparent; border:1.5px solid var(--border-md); color:var(--white); font-weight:700; transition:all .15s; }
  .bo:hover{ border-color:var(--yellow); background:var(--yellow-gl); color:var(--yellow); }

  .bg{ background:#1a7a3a; color:#fff; border:none; font-weight:700; transition:background .15s; }
  .bg:hover{ background:#22994a; }

  .bd{ background:#7a1a1a; color:#fff; border:none; font-weight:700; transition:background .15s; }
  .bd:hover{ background:#9e2020; }

  /* CARD */
  .card{
    background:rgba(255,255,255,0.055);
    border-radius:.9rem;
    border:1px solid var(--border);
    overflow:hidden;
    transition:transform .22s,box-shadow .22s;
    backdrop-filter:blur(2px);
  }
  .card:hover{ transform:translateY(-4px); box-shadow:0 14px 32px rgba(0,0,0,.65); }

  /* DRAWER */
  .drawer{
    position:fixed;top:0;right:0;height:100%;width:100%;max-width:22rem;
    background:#221005;
    border-left:1px solid var(--border-md);
    z-index:50;display:flex;flex-direction:column;
    box-shadow:-4px 0 30px rgba(0,0,0,.65);
    transition:transform .3s ease;
  }
  .dopen{ transform:translateX(0); }
  .dclosed{ transform:translateX(100%); }
  .ov{ position:fixed;inset:0;background:rgba(0,0,0,.68);z-index:40;backdrop-filter:blur(3px); }

  /* MODAL */
  .mw{ position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:50;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px); }
  .mb{
    background:#221005;
    width:100%;max-width:32rem;max-height:92vh;
    display:flex;flex-direction:column;overflow:hidden;
    border-radius:1.4rem 1.4rem 0 0;
    box-shadow:0 -8px 40px rgba(0,0,0,.6);
    border:1px solid var(--border-md);
    border-bottom:none;
  }

  /* TAGS */
  .tag{ font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:999px;letter-spacing:.02em; }
  .tv{ background:rgba(22,163,74,.2);color:#6ee7b7; }
  .tp{ background:rgba(245,197,24,.18);color:var(--yellow); }
  .tf{ background:rgba(220,38,38,.2);color:#fca5a5; }
  .tc{ background:rgba(139,92,246,.15);color:#c4b5fd; }
  .tpi{ background:rgba(239,68,68,.15);color:#fca5a5; }
  .tch{ background:rgba(236,72,153,.15);color:#f9a8d4; }
  .td{ background:rgba(217,70,239,.15);color:#e879f9; }
  .tb{ background:rgba(59,130,246,.15);color:#93c5fd; }
  .tlt{ background:rgba(16,185,129,.12);color:#6ee7b7; }

  /* INPUTS */
  .inp{
    width:100%;border:1.5px solid var(--border-md);border-radius:.7rem;
    padding:.6rem 1rem;font-size:.875rem;outline:none;
    transition:border-color .15s;
    background:rgba(255,255,255,.06);color:var(--white);
  }
  .inp::placeholder{ color:var(--dim); }
  .inp:focus{ border-color:var(--yellow); }

  .inp-sm{
    border:1.5px solid var(--border);border-radius:.5rem;
    padding:.35rem .6rem;font-size:.82rem;outline:none;
    transition:border-color .15s;
    background:rgba(255,255,255,.06);color:var(--white);
    width:5.5rem;text-align:right;
  }
  .inp-sm:focus{ border-color:var(--yellow); }

  .sdiv{ height:1px;background:linear-gradient(to right,var(--wine-lt),var(--border),transparent);border:none;margin-top:.6rem; }
  .bar{ height:6px;border-radius:3px;background:var(--yellow);transition:width .6s ease; }
  .noscroll::-webkit-scrollbar{display:none;}.noscroll{-ms-overflow-style:none;scrollbar-width:none;}

  @media(min-width:640px){ .mb{border-radius:1rem;} .mw{align-items:center;} }

  @keyframes shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes spin{ to{transform:rotate(360deg)} }
`

/* ═══════════════════════════════════════════════════════
   [PASSO 3] CARDAPIO
═══════════════════════════════════════════════════════ */
const MENU_BASE = {
  meta: {
    /* [PASSO 3a] WhatsApp: 55 + DDD + numero sem tracos ou espacos */
    whatsappNumber: "5512991375580",
    halfRule: "highest",
    borders: [
      { id:"none",      label:"Sem borda",           price:0  },
      { id:"recheada",  label:"Borda Recheada",       price:18 },
      { id:"cobertura", label:"Cobertura",            price:18 },
      { id:"cob_esp",   label:"Cobertura Especial",   price:25 },
    ],
    payments: [
      { id:"pix",    label:"PIX",                         needsChange:false },
      { id:"credit", label:"Cartao de Credito (maquina)", needsChange:false },
      { id:"debit",  label:"Cartao de Debito (maquina)",  needsChange:false },
      { id:"cash",   label:"Dinheiro",                    needsChange:true  },
    ],
  },
  categories: [
    /* ── PIZZAS SALGADAS ─────────────────────────────────────────────── */
    { id:"trad", label:"Pizzas", desc:"As classicas de sempre, feitas com o molho La Bella", half:true, items:[
      {id:"alho_oleo",       name:"Alho e Oleo",          imagem:"/alho.png",        tags:["classica"],           desc:"Molho La Bella, mussarela, alho fatiado, oleo e oregano",                                               sizes:{I:30,G:58}},
      {id:"aliche",          name:"Aliche",               imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, aliche, azeitona e oregano",                                                 sizes:{I:48,G:92}},
      {id:"alpina",          name:"Alpina",               imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, salaminho, catupiry, azeitona e oregano",                                    sizes:{I:49,G:88}},
      {id:"americana",       name:"Americana",            imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, bacon, catupiry, azeitona e oregano",                                        sizes:{I:49,G:92}},
      {id:"atum",            name:"Atum",                 imagem:"/milhoverde.png",  tags:["classica"],           desc:"Molho La Bella, mussarela, atum, cebola, azeitona e oregano",                                           sizes:{I:49,G:92}},
      {id:"bacalhau",        name:"Bacalhau",             imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, bacalhau, azeitona, cebola e oregano",                                       sizes:{I:49,G:92}},
      {id:"bacon",           name:"Bacon",                imagem:"/presunto.png",    tags:["classica"],           desc:"Molho La Bella, mussarela, bacon, azeitona e oregano",                                                  sizes:{I:40,G:72}},
      {id:"baiana",          name:"Bahiana",              imagem:"/mussarela.png",   tags:["picante"],            desc:"Molho La Bella, mussarela, calabresa, pimenta, ovos, cebola, alho e oregano",                          sizes:{I:40,G:72}},
      {id:"berinjela",       name:"Berinjela",            imagem:"/mussarela.png",   tags:["vegetariana"],        desc:"Molho La Bella, mussarela, berinjela temperada, parmesao e oregano",                                   sizes:{I:38,G:68}},
      {id:"brocolis",        name:"Brocolis",             imagem:"/mussarela.png",   tags:["vegetariana"],        desc:"Molho La Bella, mussarela, brocolis, azeitona e oregano",                                               sizes:{I:40,G:69}},
      {id:"brocolis_cat",    name:"Brocolis Catupiry",    imagem:"/mussarela.png",   tags:["vegetariana"],        desc:"Molho La Bella, mussarela, brocolis, catupiry, azeitona e oregano",                                     sizes:{I:45,G:80}},
      {id:"bufala_esp",      name:"Bufala Especial",      imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela de bufala, tomate, azeitona e oregano",                                      sizes:{I:45,G:80}},
      {id:"calabresa",       name:"Calabresa",            imagem:"/alho.png",        tags:["classica","picante"], desc:"Molho La Bella, mussarela, calabresa fatiada, cebola, azeitona e oregano",                             sizes:{I:30,G:58}},
      {id:"calabresa_esp",   name:"Calabresa Especial",   imagem:"/alho.png",        tags:["classica","picante"], desc:"Molho La Bella, mussarela, calabresa especial, cebola, azeitona e oregano",                           sizes:{I:40,G:69}},
      {id:"california",      name:"California",           imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, frango, milho, catupiry, azeitona e oregano",                               sizes:{I:48,G:90}},
      {id:"camarao_cat",     name:"Camarao com Catupiry", imagem:"/mussarela.png",   tags:["especial","premium"], desc:"Molho rose, mussarela, camarao refogado, catupiry, azeitona e oregano",                               sizes:{I:68,G:130}},
      {id:"catupiry",        name:"Catupiry",             imagem:"/catupiry.png",    tags:["classica"],           desc:"Molho La Bella, mussarela, catupiry, azeitona e oregano",                                               sizes:{I:30,G:62}},
      {id:"cinco_queijos",   name:"Cinco Queijos",        imagem:"/mussarela.png",   tags:["classica"],           desc:"Molho La Bella, mussarela, provolone, catupiry, gorgonzola, parmesao e oregano",                       sizes:{I:40,G:75}},
      {id:"da_casa",         name:"Da Casa",              imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, presunto, calabresa, bacon, ervilha, palmito, ovos, cebola e oregano",      sizes:{I:40,G:75}},
      {id:"escarola",        name:"Escarola",             imagem:"/mussarela.png",   tags:["vegetariana"],        desc:"Molho La Bella, mussarela, escarola temperada, cebola, azeitona e oregano",                           sizes:{I:35,G:66}},
      {id:"escarola_bacon",  name:"Escarola com Bacon",   imagem:"/mussarela.png",   tags:["classica"],           desc:"Molho La Bella, mussarela, escarola, bacon, cebola, azeitona e oregano",                               sizes:{I:40,G:72}},
      {id:"frango_cat",      name:"Frango com Catupiry",  imagem:"/mussarela.png",   tags:["favorito"],           desc:"Molho La Bella, mussarela, frango desfiado, catupiry, azeitona e oregano",                              sizes:{I:40,G:69}},
      {id:"framilho",        name:"Framilho",             imagem:"/mussarela.png",   tags:["classica"],           desc:"Molho La Bella, mussarela, frango, milho, azeitona e oregano",                                          sizes:{I:40,G:72}},
      {id:"gorgonzola",      name:"Gorgonzola",           imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho branco, mussarela, gorgonzola, azeitona e oregano",                                               sizes:{I:40,G:72}},
      {id:"indiana",         name:"Indiana",              imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, camarao, palmito, azeitona e oregano",                                       sizes:{I:50,G:96}},
      {id:"italiana",        name:"Italiana",             imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, salame italiano, rucula, azeitona e oregano",                                sizes:{I:50,G:90}},
      {id:"labella",         name:"La Bella",             imagem:"/mussarela.png",   tags:["especial","premium"], desc:"Molho La Bella, mussarela, lombinho, catupiry, azeitona e oregano",                                    sizes:{I:52,G:96}},
      {id:"lombo_trad",      name:"Lombo Tradicional",    imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, lombo defumado, azeitona e oregano",                                        sizes:{I:40,G:69}},
      {id:"lombo_cat",       name:"Lombo com Catupiry",   imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, lombo defumado, catupiry, azeitona e oregano",                               sizes:{I:40,G:69}},
      {id:"margherita",      name:"Margherita",           imagem:"/margherita.png",  tags:["classica"],           desc:"Molho La Bella, mussarela, tomate, azeitona, oregano e manjericao fresco",                              sizes:{I:35,G:58}},
      {id:"margherita_lb",   name:"Margherita La Bella",  imagem:"/margherita.png",  tags:["classica"],           desc:"Molho La Bella, mussarela, tomate, manjericao, azeitona e toque especial da casa",                     sizes:{I:36,G:66}},
      {id:"milho",           name:"Milho",                imagem:"/milhoverde.png",  tags:["vegetariana"],        desc:"Molho La Bella, mussarela, milho verde, azeitona e oregano",                                            sizes:{I:35,G:59}},
      {id:"mineira",         name:"Mineira",              imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, linguica toscana, catupiry, azeitona e oregano",                             sizes:{I:45,G:80}},
      {id:"mussarela",       name:"Mussarela",            imagem:"/mussarela.png",   tags:["classica"],           desc:"Molho La Bella, mussarela, tomate, azeitona e oregano",                                                 sizes:{I:30,G:58}},
      {id:"napolitana",      name:"Napolitana",           imagem:"/napolitana.png",  tags:["classica"],           desc:"Molho La Bella, mussarela, tomate, azeitona, oregano e parmesao ralado",                                sizes:{I:35,G:58}},
      {id:"nordestina",      name:"Nordestina",           imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, carne seca, cebola caramelizada, azeitona e oregano",                       sizes:{I:45,G:82}},
      {id:"palmito",         name:"Palmito",              imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, catupiry, palmito, azeitona e oregano",                                      sizes:{I:45,G:82}},
      {id:"paulista",        name:"Paulista",             imagem:"/mussarela.png",   tags:["classica"],           desc:"Molho La Bella, mussarela, presunto, milho, ervilha, azeitona e oregano",                              sizes:{I:40,G:69}},
      {id:"peito_peru",      name:"Peito de Peru",        imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, catupiry, peito de peru, azeitona e oregano",                               sizes:{I:45,G:78}},
      {id:"pepperoni",       name:"Peperoni",             imagem:"/mussarela.png",   tags:["picante"],            desc:"Molho La Bella, mussarela, peperoni, tomate, azeitona e oregano",                                       sizes:{I:50,G:88}},
      {id:"portuguesa",      name:"Portuguesa",           imagem:"/mussarela.png",   tags:["classica"],           desc:"Molho La Bella, mussarela, presunto, ervilha, palmito, calabresa, ovos, azeitona e oregano",            sizes:{I:40,G:70}},
      {id:"portuguesa_esp",  name:"Portuguesa Especial",  imagem:"/mussarela.png",   tags:["especial"],           desc:"Molho La Bella, mussarela, presunto, lombo, ervilha, ovo, milho, palmito, calabresa, cebola e oregano", sizes:{I:50,G:88}},
      {id:"presunto",        name:"Presunto",             imagem:"/presunto.png",    tags:["classica"],           desc:"Molho La Bella, mussarela, presunto, tomate, azeitona e oregano",                                       sizes:{I:35,G:62}},
      {id:"presunto_parma",  name:"Presunto de Parma",    imagem:"/mussarela.png",   tags:["especial","premium"], desc:"Molho La Bella, mussarela, presunto de parma, rucula, azeitona e oregano",                            sizes:{I:70,G:130}},
      {id:"primavera",       name:"Primavera",            imagem:"/mussarela.png",   tags:["especial","vegetariana"],desc:"Molho pesto, mussarela, tomate cereja, abobrinha, pimentao grelhado e azeitona",                   sizes:{I:50,G:92}},
    ]},

    /* ── PROMOÇÕES ───────────────────────────────────────────────────── */
    { id:"promocoes", label:"Promoções", desc:"Sabores especiais com preco unico Grande", half:false, items:[
      {id:"promo_brocolis",  name:"Promo Brocolis",   imagem:"/mussarela.png", tags:["promocao"], desc:"Pizza Grande de Brocolis com preco especial. Disponivel somente no tamanho Grande.",    sizes:{UN:65}},
      {id:"promo_frango",    name:"Promo Frango",     imagem:"/mussarela.png", tags:["promocao"], desc:"Pizza Grande de Frango com Catupiry com preco especial. Somente no tamanho Grande.",    sizes:{UN:65}},
      {id:"promo_portuguesa",name:"Promo Portuguesa", imagem:"/mussarela.png", tags:["promocao"], desc:"Pizza Grande Portuguesa com preco especial. Disponivel somente no tamanho Grande.",     sizes:{UN:65}},
    ]},

    /* ── PREFERENCIAL (TRILEGAL) ─────────────────────────────────────── */
    { id:"preferencial", label:"Preferencial", desc:"Trilegal: 3 sabores a sua escolha — preco da pizza de maior valor", half:false, items:[
      {id:"trilegal", name:"Trilegal (3 Sabores)", imagem:"/mussarela.png", tags:["especial"], desc:"Escolha 3 sabores a sua preferencia. Preco = pizza de maior valor dos 3 escolhidos. Informe os sabores nas observacoes do pedido. O valor sera confirmado pela pizzaria.", sizes:{UN:0}},
    ]},

    /* ── LIGHT ───────────────────────────────────────────────────────── */
    { id:"light", label:"Light", desc:"Opcao saudavel e saborosa", half:true, items:[
      {id:"vegetariana", name:"Vegetariana", imagem:"/mussarela.png", tags:["light","vegetariana"], desc:"Molho La Bella, mussarela, brocolis, palmito, milho, champignon, pimentao, azeitona e oregano", sizes:{I:55,G:98}},
    ]},

    /* ── PIZZAS DOCES ────────────────────────────────────────────────── */
    { id:"doces", label:"Pizzas Doces", desc:"Para fechar com docura", half:false, items:[
      {id:"banana",      name:"Banana",     imagem:"/pizzadoce.png", tags:["doce"], desc:"Massa, banana caramelizada, canela e acucar",                     sizes:{I:28,G:44}},
      {id:"brigatone",   name:"Brigatone",  imagem:"/pizzadoce.png", tags:["doce"], desc:"Massa, brigadeiro, granulado e creme de leite",                   sizes:{I:34,G:52}},
      {id:"queijadinha", name:"Queijadinha",imagem:"/pizzadoce.png", tags:["doce"], desc:"Massa, recheio de queijadinha, coco e leite condensado",          sizes:{I:34,G:52}},
      {id:"labella_doce",name:"La Bella Doce",imagem:"/pizzadoce.png",tags:["doce","premium"],desc:"Massa, recheio especial da casa com frutas e cobertura gourmet", sizes:{I:49,G:84}},
      {id:"prestigio",   name:"Prestigio",  imagem:"/pizzadoce.png", tags:["doce"], desc:"Massa, chocolate, coco ralado e creme de leite",                  sizes:{I:34,G:52}},
    ]},

    /* ── ACOMPANHAMENTOS ─────────────────────────────────────────────── */
    { id:"acompanhamentos", label:"Acompanhamentos", desc:"Adicionais para sua pizza", half:false, items:[
      {id:"borda_recheada",   name:"Borda Recheada", imagem:"/borda.png",  tags:["adicional"], desc:"Borda recheada com catupiry ou cheddar",          sizes:{UN:18}},
      {id:"cobertura",        name:"Cobertura", imagem:"/cheddar.png",   tags:["adicional"], desc:"Cobertura adicional para sua pizza",               sizes:{UN:18}},
      {id:"cobertura_esp",    name:"Cobertura Especial", imagem:"/palmito.png", tags:["adicional"], desc:"Cobertura especial premium para sua pizza",        sizes:{UN:25}},
    ]},

    /* ── BAGATELAS ───────────────────────────────────────────────────── */
    { id:"bagatelas", label:"Bagatelas", desc:"Pizza com massa fina, pouco recheio, sem coberturas ou acompanhamentos, servida como aperitivos", half:false, items:[
      {id:"bag_cebola_alho", name:"Cebola e Alho",  imagem:"/mussarela.png", tags:["porcao"], desc:"Porcao individual de cebola e alho",       sizes:{UN:38}},
      {id:"bag_calabresa",   name:"Calabresa",      imagem:"/mussarela.png", tags:["porcao"], desc:"Porcao individual de calabresa",             sizes:{UN:40}},
      {id:"bag_tradicional", name:"Tradicional",    imagem:"/mussarela.png", tags:["porcao"], desc:"Porcao individual no sabor tradicional",    sizes:{UN:38}},
      {id:"bag_labella",     name:"La Bella",       imagem:"/mussarela.png", tags:["porcao"], desc:"Porcao individual no sabor La Bella",       sizes:{UN:38}},
      {id:"bag_gorgonzola",  name:"Gorgonzola",     imagem:"/mussarela.png", tags:["porcao"], desc:"Porcao individual de gorgonzola",           sizes:{UN:44}},
      {id:"bag_atum",        name:"Atum",           imagem:"/mussarela.png", tags:["porcao"], desc:"Porcao individual de atum",                 sizes:{UN:48}},
    ]},

    /* ── BEBIDAS ─────────────────────────────────────────────────────── */
    { id:"bebidas", label:"Bebidas", desc:"Para acompanhar sua pizza", half:false, items:[
      {id:"agua",       name:"Agua Mineral",     imagem:"/refrilata.png", tags:["bebida"], desc:"Agua mineral 500ml",                      sizes:{UN:5}  },
      {id:"del_valle",  name:"Del Valle (lata)", imagem:"/refrilata.png", tags:["bebida"], desc:"Suco Del Valle em lata",                  sizes:{UN:8}  },
      {id:"refri_lata", name:"Refrigerante (lata)",imagem:"/refrilata.png",tags:["bebida"], desc:"Coca · Pepsi · Guarana · Fanta · Sprite",sizes:{UN:8}  },
      {id:"refri_600",  name:"Refrigerante 600ml",imagem:"/refrilata.png", tags:["bebida"], desc:"Garrafa 600ml",                          sizes:{UN:10} },
      {id:"schweppes",  name:"Schweppes",        imagem:"/refrilata.png", tags:["bebida"], desc:"Schweppes tonica ou citrus",              sizes:{UN:8}  },
      {id:"limonada",   name:"Limonada Suica",   imagem:"/refrilata.png", tags:["bebida"], desc:"Limonada suica gelada",                   sizes:{UN:18} },
      {id:"h2oh",       name:"H2OH / Limoneto",  imagem:"/refrilata.png", tags:["bebida"], desc:"H2OH ou Limoneto 500ml",                 sizes:{UN:10} },
    ]},
  ]
}

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
function applyPrices(base, overrides) {
  if(!overrides || Object.keys(overrides).length===0) return base
  return {
    ...base,
    categories: base.categories.map(cat=>({
      ...cat,
      items: cat.items.map(p=>{
        const ov = overrides[p.id]
        return ov ? {...p, sizes:{...p.sizes,...ov}} : p
      })
    }))
  }
}

const SZL   = {I:"Individual",G:"Grande",UN:"Unico"}
const brl   = v => `R$ ${Number(v).toFixed(2).replace(".",",")}`
const genId = () => `lb${Date.now()}${Math.random().toString(36).slice(2,5)}`
function recalc(it){ it.totalPrice=(it.unitPrice+(it.border?.price??0))*it.quantity; return it }
const isAdmin = () => sessionStorage.getItem(ADMIN_CONFIG.sessionKey)==="1"

/* ═══════════════════════════════════════════════════════
   CART
═══════════════════════════════════════════════════════ */
const CartCtx  = createContext(null)
const initCart = {items:[],co:{name:"",address:"",complement:"",pay:null,change:null,notes:""},cartOpen:false,coOpen:false}

function cartR(s,{type:t,p}){
  switch(t){
    case"ADD_S":{const it=recalc({cartItemId:genId(),type:"single",size:p.size,border:p.border,removed:[],quantity:1,unitPrice:p.pizza.sizes[p.size],totalPrice:0,pizza:p.pizza});return{...s,items:[...s.items,it],cartOpen:true}}
    case"ADD_H":{const it=recalc({cartItemId:genId(),type:"half",size:p.size,border:p.border,removed:[],quantity:1,unitPrice:p.up,totalPrice:0,h1:p.h1,h2:p.h2});return{...s,items:[...s.items,it],cartOpen:true}}
    case"UPD":{const items=s.items.map(i=>{if(i.cartItemId!==p.id)return i;const n={...i,quantity:i.quantity+p.d};return n.quantity<1?null:recalc(n)}).filter(Boolean);return{...s,items}}
    case"RM":  return{...s,items:s.items.filter(i=>i.cartItemId!==p.id)}
    case"CLEAR":return{...s,items:[],coOpen:false}
    case"SET_CO":return{...s,co:{...s.co,[p.f]:p.v}}
    case"TOG": return{...s,cartOpen:!s.cartOpen,coOpen:false}
    case"OPCO":return{...s,coOpen:true,cartOpen:false}
    case"CLCO":return{...s,coOpen:false}
    default:   return s
  }
}

function CartProvider({children,menu}){
  const[s,d]=useReducer(cartR,initCart)
  const ic=s.items.reduce((a,i)=>a+i.quantity,0)
  const sub=s.items.reduce((a,i)=>a+i.totalPrice,0)
  return(
    <CartCtx.Provider value={{...s,itemCount:ic,subtotal:sub,menu,
      addSingle:(pz,sz,br)=>d({type:"ADD_S",p:{pizza:pz,size:sz,border:br}}),
      addHalf:(h1,h2,sz,br,up)=>d({type:"ADD_H",p:{h1,h2,size:sz,border:br,up}}),
      upd:(id,delta)=>d({type:"UPD",p:{id,d:delta}}),
      rm:id=>d({type:"RM",p:{id}}),
      clear:()=>d({type:"CLEAR"}),
      setCo:(f,v)=>d({type:"SET_CO",p:{f,v}}),
      toggleCart:()=>d({type:"TOG"}),
      openCo:()=>d({type:"OPCO"}),
      closeCo:()=>d({type:"CLCO"}),
    }}>
      {children}
    </CartCtx.Provider>
  )
}
const useCart=()=>useContext(CartCtx)

function buildMsg(items,co,sub){
  const sep="─────────────────────────────"
  const addr=[co.address,co.complement].filter(Boolean).join(", ")
  return[
    `*LA BELLA PIZZARIA* — Pindamonhangaba`,`*Novo Pedido*`,sep,
    `*Cliente:* ${co.name||"Nao informado"}`,`*Endereco:* ${addr||"Nao informado"}`,
    `\n*Itens:*`,
    ...items.map(it=>{
      const b=it.border?.id!=="none"?` + ${it.border?.label}`:""
      if(it.type==="half")return `  - ${it.quantity}x Meia (${SZL[it.size]||it.size})${b} — ${brl(it.totalPrice)}\n      ${it.h1.name} + ${it.h2.name}`
      return`  - ${it.quantity}x ${it.pizza.name} (${SZL[it.size]||it.size})${b} — ${brl(it.totalPrice)}`
    }),
    `\n${sep}`,`*Subtotal:* ${brl(sub)}`,`*Frete:* A confirmar pela pizzaria`,
    `\n*Pagamento:* ${co.pay?.label??"Nao informado"}`,
    co.pay?.needsChange&&co.change?`Troco para: ${brl(co.change)}`:"",
    co.notes?`\n*Obs:* ${co.notes}`:"",
    `\n${sep}`,
  ].filter(Boolean).join("\n")
}

/* ═══════════════════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════════════════ */
const Lbl=({children})=>(
  <p style={{fontSize:"0.7rem",fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"0.4rem"}}>{children}</p>
)
const MH=({title,sub,onClose})=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.25rem",borderBottom:"1px solid var(--border)"}}>
    <div>
      <h2 className="mont" style={{fontWeight:700,fontSize:"1.05rem",color:"var(--white)"}}>{title}</h2>
      {sub&&<p style={{fontSize:"0.72rem",color:"var(--dim)",marginTop:"0.15rem",lineHeight:1.4}}>{sub}</p>}
    </div>
    <button onClick={onClose} style={{width:"2rem",height:"2rem",borderRadius:"50%",background:"rgba(255,255,255,.1)",border:"1px solid var(--border)",fontWeight:700,color:"var(--white)",flexShrink:0}}>x</button>
  </div>
)
function LoadingBar(){return <div style={{position:"fixed",top:0,left:0,right:0,height:"3px",zIndex:9999,background:"linear-gradient(90deg,var(--wine),var(--yellow),var(--wine))",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>}

const TAGMAP={classica:"tc",vegetariana:"tv",premium:"tp",favorito:"tf",picante:"tpi",especial:"tch",light:"tlt",doce:"td",bebida:"tb"}

/* ═══════════════════════════════════════════════════════
   HEADER — fundo vinho, nome em Great Vibes amarelo
═══════════════════════════════════════════════════════ */
function Header({onAdmin}){
  const{itemCount,toggleCart}=useCart()
  return(
    <header style={{position:"fixed",top:0,left:0,right:0,zIndex:30,background:"var(--wine-dk)",borderBottom:"2px solid var(--wine)",boxShadow:"0 2px 20px rgba(0,0,0,.65)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.25rem",height:"4.2rem",maxWidth:"72rem",margin:"0 auto"}}>
        <div style={{display:"flex",flexDirection:"column",lineHeight:1}}>
          <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
            <img 
              src="/logo.png" 
              alt="Logo La Bella" 
              style={{ height: "60px", width: "auto", objectFit: "contain" }} 
            />
            <span className="gv" style={{fontSize:"1.9rem",color:"var(--yellow)"}}>
              La Bella
            </span>
          </div>
          <span className="mont" style={{fontSize:"0.55rem",letterSpacing:"0.16em",color:"rgba(255,255,255,0.45)",textTransform:"uppercase",marginTop:"-2px"}}>Pizzaria · Pindamonhangaba</span>
        </div>
        <button onClick={toggleCart} className="by" style={{padding:"0.5rem 1.1rem",borderRadius:"0.65rem",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.5rem",position:"relative"}}>
          Pedido
          {itemCount>0&&<span style={{background:"var(--wine-dk)",color:"var(--yellow)",fontSize:"0.65rem",fontWeight:900,width:"1.3rem",height:"1.3rem",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid var(--yellow)"}}>{itemCount}</span>}
        </button>
      </div>
      <nav className="noscroll" style={{display:"flex",gap:"0.1rem",padding:"0 1.25rem 0.5rem",overflowX:"auto",maxWidth:"72rem",margin:"0 auto"}}>
        {MENU_BASE.categories.map(c=>(
          <a key={c.id} href={`#${c.id}`}
            style={{flexShrink:0,fontSize:"0.72rem",fontWeight:600,padding:"0.28rem 0.75rem",borderRadius:"999px",color:"rgba(255,255,255,0.6)",transition:"all .15s",whiteSpace:"nowrap",fontFamily:"Montserrat,sans-serif"}}
            onMouseEnter={e=>{e.target.style.background="rgba(245,197,24,.15)";e.target.style.color="var(--yellow)"}}
            onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="rgba(255,255,255,0.6)"}}>
            {c.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

/* ═══════════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════════ */
function ProductCard({pizza,allowsHalf,onAdd,onHalf}){
  const prices=Object.values(pizza.sizes)
  const lo=Math.min(...prices)
  const isUnique=Object.keys(pizza.sizes).length===1&&pizza.sizes.UN!==undefined
  return(
    <article className="card" style={{display:"flex",flexDirection:"column"}}>
      <div style={{height:"7rem",background:"rgba(0,0,0,.35)",display:"flex",alignItems:"center",justifyContent:"center",borderBottom:"1px solid var(--border)", overflow:"hidden"}}>
        <img 
          src={pizza.imagem} 
          alt={pizza.name} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </div>
      <div style={{padding:"0.85rem",display:"flex",flexDirection:"column",gap:"0.3rem",flex:1}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.2rem"}}>
          {pizza.tags.slice(0,2).map(t=><span key={t} className={`tag ${TAGMAP[t]||""}`}>{t}</span>)}
        </div>
        <h3 className="mont" style={{fontWeight:700,fontSize:"0.9rem",lineHeight:1.25,color:"var(--white)"}}>{pizza.name}</h3>
        <p style={{fontSize:"0.73rem",color:"var(--dim)",lineHeight:1.4,flex:1,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{pizza.desc}</p>
        <p className="mont" style={{fontSize:"0.85rem",fontWeight:700,color:"var(--yellow)",marginTop:"0.1rem"}}>
          {isUnique?brl(lo):`${brl(lo)} – ${brl(Math.max(...prices))}`}
        </p>
        <div style={{display:"flex",gap:"0.4rem",marginTop:"0.3rem"}}>
          <button onClick={()=>onAdd(pizza)} className="by" style={{flex:1,padding:"0.42rem",borderRadius:"0.55rem",fontSize:"0.78rem"}}>
            {isUnique?"Adicionar":"Escolher tamanho"}
          </button>
          {allowsHalf&&<button onClick={()=>onHalf(pizza)} className="bo" style={{padding:"0.42rem 0.6rem",borderRadius:"0.55rem",fontSize:"0.78rem"}}>Meia</button>}
        </div>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════
   SIZE MODAL
═══════════════════════════════════════════════════════ */
function SizeModal({pizza,isOpen,onClose,onConfirm}){
  const sizes=pizza?Object.keys(pizza.sizes).filter(s=>s!=="UN"):[]
  const[size,setSize]=useState(sizes[0]||"M")
  const[border,setBorder]=useState(MENU_BASE.meta.borders[0])
  useEffect(()=>{if(isOpen&&pizza){setSize(Object.keys(pizza.sizes).filter(k=>k!=="UN")[0]||"M");setBorder(MENU_BASE.meta.borders[0])}},[isOpen,pizza])
  if(!isOpen||!pizza)return null
  const calcP=()=>(pizza.sizes[size]??0)+(border?.price??0)
  return(
    <div className="mw" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mb">
        <MH title={pizza.name} sub={pizza.desc} onClose={onClose}/>
        <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1rem",overflowY:"auto"}}>
          {sizes.length>1&&(
            <div><Lbl>Tamanho</Lbl>
              <div style={{display:"flex",gap:"0.5rem"}}>
                {sizes.map(s=>(
                  <button key={s} onClick={()=>setSize(s)} className={size===s?"by":"bo"} style={{flex:1,padding:"0.7rem",borderRadius:"0.7rem",fontSize:"0.88rem"}}>
                    <div className="mont" style={{fontWeight:700}}>{SZL[s]}</div>
                    <div style={{fontSize:"0.78rem",fontWeight:400,opacity:.8,marginTop:"0.1rem"}}>{brl(pizza.sizes[s])}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div><Lbl>Borda</Lbl>
            <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
              {MENU_BASE.meta.borders.map(opt=>(
                <button key={opt.id} onClick={()=>setBorder(opt)}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.65rem 0.9rem",borderRadius:"0.7rem",border:`1.5px solid ${border?.id===opt.id?"var(--yellow)":"var(--border)"}`,background:border?.id===opt.id?"var(--yellow-gl)":"transparent",cursor:"pointer",transition:"all .15s"}}>
                  <span style={{fontWeight:600,fontSize:"0.85rem",color:"var(--white)"}}>{opt.label}</span>
                  <span style={{fontSize:"0.78rem",fontWeight:700,color:opt.price===0?"var(--dim)":"var(--yellow)"}}>
                    {opt.price===0?"gratis":`+${brl(opt.price)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding:"1rem",borderTop:"1px solid var(--border)",background:"rgba(0,0,0,.3)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.7rem"}}>
            <span style={{color:"var(--dim)",fontSize:"0.85rem"}}>Total</span>
            <span className="mont" style={{fontWeight:700,color:"var(--yellow)"}}>{brl(calcP())}</span>
          </div>
          <button onClick={()=>onConfirm(size,border)} className="by" style={{width:"100%",padding:"0.75rem",borderRadius:"0.7rem",fontSize:"0.9rem"}}>
            Adicionar ao pedido
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   HALF MODAL
═══════════════════════════════════════════════════════ */
function HalfModal({isOpen,onClose,initPizza}){
  const{addHalf,menu}=useCart()
  const[h1,setH1]=useState(initPizza)
  const[h2,setH2]=useState(null)
  const[size,setSize]=useState("M")
  const[border,setBorder]=useState(MENU_BASE.meta.borders[0])
  const[step,setStep]=useState(initPizza?2:1)
  useEffect(()=>{if(isOpen){setH1(initPizza??null);setH2(null);setSize("M");setBorder(MENU_BASE.meta.borders[0]);setStep(initPizza?2:1)}},[isOpen,initPizza])
  if(!isOpen)return null
  const all=menu.categories.filter(c=>c.half).flatMap(c=>c.items)
  const avSz=h1&&h2?Object.keys(h1.sizes).filter(s=>h2.sizes[s]&&s!=="UN"):["M","G"]
  const calcP=()=>(!h1||!h2)?0:Math.max(h1.sizes[size]??0,h2.sizes[size]??0)+(border?.price??0)
  return(
    <div className="mw" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mb">
        <MH title="Pizza Meio a Meio" sub={step===1?"Escolha a 1a metade":step===2?"Escolha a 2a metade":"Configure tamanho e borda"} onClose={onClose}/>
        <div style={{overflowY:"auto",flex:1,padding:"1rem"}}>
          <div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem"}}>
            {[h1,h2].map((h,idx)=>(
              <button key={idx} onClick={()=>setStep(idx+1)}
                style={{flex:1,padding:"0.7rem",borderRadius:"0.7rem",border:`1.5px solid ${step===idx+1?"var(--yellow)":h?"var(--border-md)":"var(--border)"}`,borderStyle:!h?"dashed":"solid",background:step===idx+1?"var(--yellow-gl)":"transparent",cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:step===idx+1?"var(--yellow)":"var(--dim)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {h?h.name:`${idx+1}a metade`}
                </div>
              </button>
            ))}
          </div>
          {(step===1||step===2)&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.4rem"}}>
              {all.map(p=>{
                const isSel=step===1?h1?.id===p.id:h2?.id===p.id
                const isOther=step===1?h2?.id===p.id:h1?.id===p.id
                return(
                  <button key={p.id} disabled={isOther}
                    onClick={()=>{if(step===1){setH1(p);setStep(2)}else{setH2(p);setStep(3)}}}
                    style={{padding:"0.55rem 0.65rem",borderRadius:"0.65rem",border:`1.5px solid ${isSel?"var(--yellow)":"var(--border)"}`,background:isSel?"var(--yellow-gl)":"transparent",cursor:isOther?"not-allowed":"pointer",opacity:isOther?0.3:1,textAlign:"left",transition:"all .15s"}}>
                    <span style={{fontSize:"0.73rem",fontWeight:600,color:"var(--white)",lineHeight:1.3}}>{p.name}</span>
                  </button>
                )
              })}
            </div>
          )}
          {step===3&&(
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              <div><Lbl>Tamanho</Lbl>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
                  {avSz.map(s=>(
                    <button key={s} onClick={()=>setSize(s)} className={size===s?"by":"bo"} style={{padding:"0.65rem",borderRadius:"0.7rem",fontWeight:700,fontSize:"0.85rem"}}>
                      {SZL[s]||s}
                    </button>
                  ))}
                </div>
              </div>
              <div><Lbl>Borda</Lbl>
                <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
                  {MENU_BASE.meta.borders.map(opt=>(
                    <button key={opt.id} onClick={()=>setBorder(opt)}
                      style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.65rem 0.9rem",borderRadius:"0.7rem",border:`1.5px solid ${border?.id===opt.id?"var(--yellow)":"var(--border)"}`,background:border?.id===opt.id?"var(--yellow-gl)":"transparent",cursor:"pointer",transition:"all .15s"}}>
                      <span style={{fontWeight:600,fontSize:"0.85rem",color:"var(--white)"}}>{opt.label}</span>
                      <span style={{fontSize:"0.78rem",fontWeight:700,color:opt.price===0?"var(--dim)":"var(--yellow)"}}>
                        {opt.price===0?"gratis":`+${brl(opt.price)}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"1rem",borderTop:"1px solid var(--border)",background:"rgba(0,0,0,.3)"}}>
          {h1&&h2&&<div style={{display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.7rem"}}><span style={{color:"var(--dim)"}}>Preco ({SZL[size]||size})</span><span className="mont" style={{fontWeight:700,color:"var(--yellow)"}}>{brl(calcP())}</span></div>}
          <div style={{display:"flex",gap:"0.5rem"}}>
            {step>1&&<button onClick={()=>setStep(step-1)} className="bo" style={{flex:1,padding:"0.6rem",borderRadius:"0.7rem",fontSize:"0.85rem"}}>Voltar</button>}
            {step===3&&h1&&h2?<button onClick={()=>{addHalf(h1,h2,size,border,calcP()-(border?.price??0));onClose()}} className="by" style={{flex:1,padding:"0.6rem",borderRadius:"0.7rem",fontSize:"0.85rem"}}>Adicionar ao pedido</button>
            :step<3&&h1?<button onClick={()=>setStep(step+1)} className="by" style={{flex:1,padding:"0.6rem",borderRadius:"0.7rem",fontSize:"0.85rem"}}>Proximo</button>:null}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   CART ROW
═══════════════════════════════════════════════════════ */
function CartRow({item}){
  const{upd,rm}=useCart()
  const title=item.type==="half"?`${item.h1.name} + ${item.h2.name}`:item.pizza.name
  const sub=[SZL[item.size]||item.size,item.border?.id!=="none"?item.border?.label:null].filter(Boolean).join(" · ")
  return(
    <div style={{display:"flex",gap:"0.75rem",padding:"0.75rem 0",borderBottom:"1px solid var(--border)"}}>
      <div style={{flex:1,minWidth:0}}>
        {item.type==="half"&&<p style={{fontSize:"0.6rem",color:"var(--yellow)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.1rem"}}>Meia a meia</p>}
        <p style={{fontSize:"0.85rem",fontWeight:700,color:"var(--white)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</p>
        {sub&&<p style={{fontSize:"0.7rem",color:"var(--dim)",marginTop:"0.1rem"}}>{sub}</p>}
        <p className="mont" style={{fontSize:"0.85rem",fontWeight:700,color:"var(--yellow)",marginTop:"0.2rem"}}>{brl(item.totalPrice)}</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem",flexShrink:0}}>
        <button onClick={()=>upd(item.cartItemId,1)} style={{width:"1.6rem",height:"1.6rem",borderRadius:"50%",background:"var(--yellow-gl)",border:"1px solid var(--border-md)",fontWeight:700,fontSize:"0.9rem",color:"var(--yellow)"}}>+</button>
        <span className="mont" style={{fontSize:"0.85rem",fontWeight:700,color:"var(--white)",width:"1.3rem",textAlign:"center"}}>{item.quantity}</span>
        <button onClick={()=>item.quantity===1?rm(item.cartItemId):upd(item.cartItemId,-1)} style={{width:"1.6rem",height:"1.6rem",borderRadius:"50%",background:"var(--yellow-gl)",border:"1px solid var(--border-md)",fontWeight:700,fontSize:"0.85rem",color:"var(--yellow)"}}>
          {item.quantity===1?"x":"−"}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   CART DRAWER
═══════════════════════════════════════════════════════ */
function CartDrawer(){
  const{items,subtotal,cartOpen,toggleCart,openCo}=useCart()
  return(
    <>{cartOpen&&<div className="ov" onClick={toggleCart}/>}
    <aside className={`drawer ${cartOpen?"dopen":"dclosed"}`}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.1rem 1.25rem",borderBottom:"1px solid var(--border)",background:"var(--wine-dk)"}}>
        <span className="gv" style={{fontSize:"1.7rem",color:"var(--yellow)"}}>La Bella</span>
        <button onClick={toggleCart} style={{width:"2rem",height:"2rem",borderRadius:"50%",background:"rgba(255,255,255,.1)",border:"1px solid var(--border)",fontWeight:700,color:"var(--white)"}}>x</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"1rem 1.25rem"}}>
        {items.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:"0.75rem",color:"var(--dim)",paddingTop:"3rem"}}>
            <div style={{fontSize:"2.5rem",opacity:.3}}>🍕</div>
            <p style={{fontWeight:700,color:"var(--white)"}}>Carrinho vazio</p>
            <p style={{fontSize:"0.8rem",textAlign:"center"}}>Adicione pizzas para comecar!</p>
          </div>
        ):items.map(it=><CartRow key={it.cartItemId} item={it}/>)}
      </div>
      {items.length>0&&(
        <div style={{padding:"1rem 1.25rem",borderTop:"1px solid var(--border)",background:"rgba(0,0,0,.4)",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.85rem",color:"var(--dim)"}}>
            <span>Subtotal</span><span>{brl(subtotal)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.75rem",color:"var(--dim)",fontStyle:"italic"}}>
            <span>Frete</span><span>A confirmar</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,paddingTop:"0.5rem",borderTop:"1px solid var(--border)"}}>
            <span style={{color:"var(--white)"}}>Total s/ frete</span>
            <span className="mont" style={{color:"var(--yellow)"}}>{brl(subtotal)}</span>
          </div>
          <button onClick={openCo} className="bg" style={{width:"100%",padding:"0.75rem",borderRadius:"0.7rem",fontSize:"0.85rem",marginTop:"0.25rem"}}>
            Finalizar via WhatsApp
          </button>
        </div>
      )}
    </aside></>
  )
}

/* ═══════════════════════════════════════════════════════
   CHECKOUT MODAL
═══════════════════════════════════════════════════════ */
function CheckoutModal({onOrderSaved}){
  const{items,co,coOpen,subtotal,setCo,closeCo,clear}=useCart()
  const[errors,setErrors]=useState([])
  const[sent,setSent]=useState(false)
  const[saving,setSaving]=useState(false)
  if(!coOpen)return null

  const send=async()=>{
    const errs=[]
    if(!co.name.trim())    errs.push("Informe seu nome.")
    if(!co.address.trim()) errs.push("Informe o endereco de entrega.")
    if(!co.pay)            errs.push("Selecione a forma de pagamento.")
    if(co.pay?.needsChange&&!co.change) errs.push("Informe o valor para troco.")
    if(items.length===0)   errs.push("Carrinho vazio.")
    if(errs.length){setErrors(errs);return}
    setErrors([]);setSaving(true)
    const order={
      id:genId(),date:new Date().toISOString(),customerName:co.name,
      address:[co.address,co.complement].filter(Boolean).join(", "),
      payment:co.pay?.label,subtotal,
      items:items.map(it=>({type:it.type,size:it.size,quantity:it.quantity,totalPrice:it.totalPrice,
        pizzaName:it.type==="half"?`Meia: ${it.h1.name} + ${it.h2.name}`:it.pizza.name,
        pizzaIds:it.type==="half"?[it.h1.id,it.h2.id]:[it.pizza.id],
        pizzaNames:it.type==="half"?[it.h1.name,it.h2.name]:[it.pizza.name]}))
    }
    try{await fbSaveOrder(order)}catch(e){console.warn("Firebase offline:",e)}
    window.open(`https://wa.me/${MENU_BASE.meta.whatsappNumber}?text=${encodeURIComponent(buildMsg(items,co,subtotal))}`,"_blank")
    setSaving(false);setSent(true);onOrderSaved()
  }

  if(sent)return(
    <div className="mw"><div className="mb" style={{padding:"2rem",alignItems:"center",justifyContent:"center",textAlign:"center",gap:"1rem",display:"flex",flexDirection:"column"}}>
      <div style={{fontSize:"2.5rem"}}>✓</div>
      <h2 className="mont" style={{fontWeight:700,fontSize:"1.25rem",color:"var(--yellow)"}}>Pedido enviado!</h2>
      <p style={{fontSize:"0.9rem",color:"var(--dim)",lineHeight:1.6}}>O WhatsApp foi aberto com seu pedido.<br/>A pizzaria confirmara o frete em breve.</p>
      <button onClick={()=>{setSent(false);closeCo();clear()}} className="by" style={{width:"100%",padding:"0.875rem",borderRadius:"0.7rem",fontSize:"0.9rem"}}>Fechar</button>
    </div></div>
  )

  return(
    <div className="mw" onClick={e=>e.target===e.currentTarget&&closeCo()}>
      <div className="mb">
        <MH title="Finalizar Pedido" onClose={closeCo}/>
        <div style={{overflowY:"auto",flex:1,padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
          {errors.length>0&&<div style={{background:"rgba(139,26,26,.3)",border:"1px solid rgba(220,38,38,.4)",borderRadius:"0.7rem",padding:"0.75rem",display:"flex",flexDirection:"column",gap:"0.2rem"}}>{errors.map((e,i)=><p key={i} style={{fontSize:"0.82rem",color:"#fca5a5"}}>· {e}</p>)}</div>}
          <div style={{background:"var(--yellow-gl)",border:"1px solid var(--border)",borderRadius:"0.7rem",padding:"0.75rem"}}>
            <p style={{fontSize:"0.82rem",fontWeight:700,color:"var(--yellow)"}}>Frete a confirmar</p>
            <p style={{fontSize:"0.78rem",color:"var(--dim)",marginTop:"0.2rem",lineHeight:1.5}}>Apos receber seu pedido, a pizzaria confirma o frete pelo seu endereco.</p>
          </div>
          <div><Lbl>Seu Nome *</Lbl><input className="inp" type="text" value={co.name} onChange={e=>setCo("name",e.target.value)} placeholder="Ex: Joao Silva"/></div>
          <div><Lbl>Endereco de Entrega *</Lbl><input className="inp" type="text" value={co.address} onChange={e=>setCo("address",e.target.value)} placeholder="Ex: Rua das Flores, 123 — Centro"/></div>
          <div><Lbl>Complemento (opcional)</Lbl><input className="inp" type="text" value={co.complement} onChange={e=>setCo("complement",e.target.value)} placeholder="Ex: Apto 42, portao azul..."/></div>
          <div><Lbl>Pagamento *</Lbl>
            <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
              {MENU_BASE.meta.payments.map(m=>(
                <button key={m.id} onClick={()=>{setCo("pay",m);setCo("change",null)}}
                  style={{padding:"0.65rem 0.9rem",borderRadius:"0.7rem",border:`1.5px solid ${co.pay?.id===m.id?"var(--yellow)":"var(--border)"}`,background:co.pay?.id===m.id?"var(--yellow-gl)":"transparent",cursor:"pointer",textAlign:"left",fontWeight:600,fontSize:"0.85rem",color:co.pay?.id===m.id?"var(--yellow)":"var(--white)",transition:"all .15s"}}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          {co.pay?.needsChange&&<div><Lbl>Troco para quanto? *</Lbl><input className="inp" type="number" value={co.change??""} onChange={e=>setCo("change",parseFloat(e.target.value)||null)} placeholder={`Ex: ${(Math.ceil(subtotal/10)*10).toFixed(2)}`} min={subtotal}/></div>}
          <div><Lbl>Observacoes (opcional)</Lbl><textarea className="inp" rows={3} value={co.notes} onChange={e=>setCo("notes",e.target.value)} placeholder="Ex: sem cebola... Informe os sabores das pizzas 3 e 4 sabores aqui!"/></div>
        </div>
        <div style={{padding:"1rem 1.25rem",borderTop:"1px solid var(--border)",background:"rgba(0,0,0,.3)",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:700}}>
            <span style={{color:"var(--white)"}}>Subtotal dos itens</span>
            <span className="mont" style={{color:"var(--yellow)"}}>{brl(subtotal)}</span>
          </div>
          <p style={{fontSize:"0.72rem",color:"var(--dim)",fontStyle:"italic"}}>+ Frete a confirmar pela pizzaria</p>
          <button onClick={send} disabled={saving} className="bg" style={{width:"100%",padding:"0.875rem",borderRadius:"0.7rem",fontSize:"0.9rem",marginTop:"0.25rem",opacity:saving?0.7:1}}>
            {saving?"Salvando...":"Enviar pedido pelo WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   ADMIN — Login
═══════════════════════════════════════════════════════ */
function AdminLogin({onLogin,onBack}){
  const[user,setUser]=useState("")
  const[pass,setPass]=useState("")
  const[err,setErr]=useState(false)
  const handle=()=>{
    if(user===ADMIN_CONFIG.username&&pass===ADMIN_CONFIG.password){sessionStorage.setItem(ADMIN_CONFIG.sessionKey,"1");onLogin()}
    else{setErr(true);setPass("")}
  }
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <style>{globalStyles}</style>
      <div style={{background:"rgba(0,0,0,.5)",backdropFilter:"blur(6px)",borderRadius:"1.25rem",padding:"2rem",width:"100%",maxWidth:"22rem",boxShadow:"0 8px 40px rgba(0,0,0,.65)",border:"1px solid var(--border-md)"}}>
        <div className="gv" style={{fontSize:"2.5rem",color:"var(--yellow)",textAlign:"center",marginBottom:"0.1rem"}}>La Bella</div>
        <p className="mont" style={{textAlign:"center",fontSize:"0.7rem",color:"var(--dim)",marginBottom:"1.5rem",letterSpacing:"0.12em",textTransform:"uppercase"}}>Painel Administrativo</p>
        {err&&<div style={{background:"rgba(139,26,26,.3)",border:"1px solid rgba(220,38,38,.4)",borderRadius:"0.7rem",padding:"0.65rem",marginBottom:"1rem",fontSize:"0.82rem",color:"#fca5a5",textAlign:"center"}}>Usuario ou senha incorretos</div>}
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <div><Lbl>Usuario</Lbl><input className="inp" type="text" value={user} onChange={e=>setUser(e.target.value)} placeholder="admin"/></div>
          <div><Lbl>Senha</Lbl><input className="inp" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handle()}/></div>
          <button onClick={handle} className="by" style={{width:"100%",padding:"0.75rem",borderRadius:"0.7rem",fontSize:"0.9rem",marginTop:"0.25rem"}}>Entrar</button>
          <button onClick={onBack} style={{width:"100%",padding:"0.6rem",borderRadius:"0.7rem",fontWeight:700,fontSize:"0.85rem",background:"transparent",border:"none",color:"var(--dim)",cursor:"pointer"}}>Voltar ao site</button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   ADMIN — Overview
═══════════════════════════════════════════════════════ */
function AdminOverview({orders}){
  const today=new Date().toDateString()
  const todayO=orders.filter(o=>new Date(o.date).toDateString()===today)
  const stats=[
    {label:"Pedidos Hoje",  value:todayO.length},
    {label:"Receita Hoje*", value:brl(todayO.reduce((a,o)=>a+o.subtotal,0))},
    {label:"Total Pedidos", value:orders.length},
    {label:"Receita Total*",value:brl(orders.reduce((a,o)=>a+o.subtotal,0))},
  ]
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <h2 className="mont" style={{fontWeight:700,fontSize:"1.2rem",color:"var(--white)"}}>Visao Geral</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"0.75rem"}}>
        {stats.map((s,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.05)",borderRadius:"0.9rem",border:"1px solid var(--border)",padding:"1rem",display:"flex",flexDirection:"column",gap:"0.25rem"}}>
            <p className="mont" style={{fontSize:"1.4rem",fontWeight:900,color:"var(--yellow)",lineHeight:1}}>{s.value}</p>
            <p style={{fontSize:"0.72rem",color:"var(--dim)"}}>{s.label}</p>
          </div>
        ))}
      </div>
      <p style={{fontSize:"0.72rem",color:"var(--dim)",fontStyle:"italic"}}>* Somente subtotal dos itens, sem frete.</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   ADMIN — Ranking
═══════════════════════════════════════════════════════ */
function AdminRanking({orders}){
  const ranking=useMemo(()=>{
    const c={}
    orders.forEach(o=>o.items.forEach(it=>it.pizzaIds.forEach((id,idx)=>{
      const name=it.pizzaNames[idx]
      if(!c[id])c[id]={id,name,count:0}
      c[id].count+=it.type==="half"?it.quantity*0.5:it.quantity
    })))
    return Object.values(c).sort((a,b)=>b.count-a.count)
  },[orders])
  if(!ranking.length)return <div style={{textAlign:"center",padding:"3rem",color:"var(--dim)"}}><p style={{fontWeight:700,color:"var(--white)"}}>Nenhum pedido ainda</p></div>
  const max=ranking[0].count
  const medals=["1.","2.","3."]
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <h2 className="mont" style={{fontWeight:700,fontSize:"1.2rem",color:"var(--white)"}}>Sabores Mais Pedidos</h2>
      <p style={{fontSize:"0.8rem",color:"var(--dim)"}}>Meio a meio conta 0,5 por metade.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
        {ranking.map((item,idx)=>{
          const pct=Math.round((item.count/max)*100)
          const countLabel=item.count%1===0?item.count:item.count.toFixed(1)
          return(
            <div key={item.id} style={{background:"rgba(255,255,255,.05)",borderRadius:"0.8rem",border:"1px solid var(--border)",padding:"0.75rem 1rem"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.4rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  <span className="mont" style={{fontSize:"0.75rem",fontWeight:700,color:"var(--yellow)",width:"1.5rem"}}>{medals[idx]??`${idx+1}.`}</span>
                  <span style={{fontWeight:700,fontSize:"0.88rem",color:"var(--white)"}}>{item.name}</span>
                </div>
                <span className="mont" style={{fontWeight:900,color:"var(--yellow)",fontSize:"0.88rem"}}>{countLabel}x</span>
              </div>
              <div style={{height:"6px",background:"rgba(255,255,255,.08)",borderRadius:"3px",overflow:"hidden"}}>
                <div className="bar" style={{width:`${pct}%`}}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   ADMIN — Historico
═══════════════════════════════════════════════════════ */
function AdminHistory({orders,onDelete,onClear}){
  const[confirmClear,setConfirmClear]=useState(false)
  const[confirmDelId,setConfirmDelId]=useState(null)
  if(!orders.length)return <div style={{textAlign:"center",padding:"3rem",color:"var(--dim)"}}><p style={{fontWeight:700,color:"var(--white)"}}>Nenhum pedido registrado</p></div>
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h2 className="mont" style={{fontWeight:700,fontSize:"1.2rem",color:"var(--white)"}}>Historico</h2>
        {!confirmClear
          ?<button onClick={()=>setConfirmClear(true)} className="bd" style={{padding:"0.35rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem"}}>Limpar tudo</button>
          :<div style={{display:"flex",gap:"0.5rem"}}>
            <button onClick={()=>{onClear();setConfirmClear(false)}} className="bd" style={{padding:"0.35rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem"}}>Confirmar</button>
            <button onClick={()=>setConfirmClear(false)} className="bo" style={{padding:"0.35rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem"}}>Cancelar</button>
          </div>
        }
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        {orders.map(o=>(
          <div key={o.id} style={{background:"rgba(255,255,255,.05)",borderRadius:"0.8rem",border:`1px solid ${confirmDelId===o.id?"rgba(220,38,38,.5)":"var(--border)"}`,padding:"1rem",transition:"border-color .15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.35rem"}}>
              <div>
                <p style={{fontWeight:700,fontSize:"0.9rem",color:"var(--white)"}}>{o.customerName}</p>
                <p style={{fontSize:"0.72rem",color:"var(--dim)"}}>{new Date(o.date).toLocaleString("pt-BR")}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                <span className="mont" style={{fontWeight:900,color:"var(--yellow)",fontSize:"0.9rem"}}>{brl(o.subtotal)}</span>
                {confirmDelId===o.id
                  ?<div style={{display:"flex",gap:"0.35rem"}}>
                    <button onClick={()=>{onDelete(o.id);setConfirmDelId(null)}} className="bd" style={{padding:"0.25rem 0.6rem",borderRadius:"0.5rem",fontSize:"0.72rem"}}>Remover</button>
                    <button onClick={()=>setConfirmDelId(null)} className="bo" style={{padding:"0.25rem 0.6rem",borderRadius:"0.5rem",fontSize:"0.72rem"}}>Nao</button>
                  </div>
                  :<button onClick={()=>setConfirmDelId(o.id)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",background:"rgba(139,26,26,.3)",border:"1px solid rgba(220,38,38,.4)",color:"#fca5a5",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>Cancelar</button>
                }
              </div>
            </div>
            <p style={{fontSize:"0.75rem",color:"var(--dim)",marginBottom:"0.5rem"}}>Endereco: {o.address}</p>
            <div style={{borderTop:"1px solid var(--border)",paddingTop:"0.5rem",display:"flex",flexDirection:"column",gap:"0.2rem"}}>
              {o.items.map((it,i)=><p key={i} style={{fontSize:"0.78rem",color:"rgba(255,255,255,.6)"}}>{it.quantity}x {it.pizzaName} ({SZL[it.size]??it.size})</p>)}
            </div>
            <p style={{fontSize:"0.72rem",color:"var(--dim)",marginTop:"0.4rem"}}>Pagamento: {o.payment} · frete a confirmar</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   ADMIN — Precos
═══════════════════════════════════════════════════════ */
function AdminPrices({currentPrices,onSaved}){
  const[draft,setDraft]=useState(()=>{
    const d={}
    MENU_BASE.categories.forEach(cat=>cat.items.forEach(p=>{d[p.id]={...p.sizes,...(currentPrices[p.id]||{})}}))
    return d
  })
  const[search,setSearch]=useState("")
  const[msg,setMsg]=useState("")
  const[saving,setSaving]=useState(false)
  useEffect(()=>{
    setDraft(prev=>{
      const d={}
      MENU_BASE.categories.forEach(cat=>cat.items.forEach(p=>{d[p.id]={...p.sizes,...(currentPrices[p.id]||{}),...prev[p.id]}}))
      return d
    })
  },[currentPrices])
  const allItems=MENU_BASE.categories.flatMap(cat=>cat.items.map(p=>({...p,catLabel:cat.label})))
  const filtered=search.trim()?allItems.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())):allItems
  const handleChange=(id,sk,val)=>{const n=parseFloat(val);setDraft(d=>({...d,[id]:{...d[id],[sk]:isNaN(n)?d[id][sk]:n}}))}
  const handleSave=async()=>{
    setSaving(true)
    const ov={}
    MENU_BASE.categories.forEach(cat=>cat.items.forEach(p=>{
      const diff={}
      Object.keys(p.sizes).forEach(k=>{if(draft[p.id][k]!==p.sizes[k])diff[k]=draft[p.id][k]})
      if(Object.keys(diff).length>0)ov[p.id]=diff
    }))
    try{await fbSavePrices(ov);setMsg("Precos salvos com sucesso!");onSaved(ov)}
    catch(e){setMsg("Erro ao salvar. Verifique o Firebase.");console.error(e)}
    setSaving(false);setTimeout(()=>setMsg(""),3000)
  }
  const handleReset=async()=>{
    setSaving(true)
    try{
      await fbSavePrices({})
      const d={}
      MENU_BASE.categories.forEach(cat=>cat.items.forEach(p=>{d[p.id]={...p.sizes}}))
      setDraft(d);setMsg("Precos restaurados ao padrao!");onSaved({})
    }catch(e){setMsg("Erro ao restaurar.")}
    setSaving(false);setTimeout(()=>setMsg(""),3000)
  }
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.5rem"}}>
        <h2 className="mont" style={{fontWeight:700,fontSize:"1.2rem",color:"var(--white)"}}>Editar Precos</h2>
        <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexWrap:"wrap"}}>
          {msg&&<span style={{fontSize:"0.82rem",fontWeight:700,color:"var(--yellow)"}}>{msg}</span>}
          <button onClick={handleReset} disabled={saving} className="bo" style={{padding:"0.4rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem"}}>Restaurar padrao</button>
          <button onClick={handleSave} disabled={saving} className="bg" style={{padding:"0.4rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem"}}>{saving?"Salvando...":"Salvar"}</button>
        </div>
      </div>
      <p style={{fontSize:"0.8rem",color:"var(--dim)"}}>Edite os valores e clique em Salvar. Itens com borda amarela foram editados.</p>
      <input className="inp" placeholder="Buscar pizza..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:"20rem"}}/>
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {filtered.map(p=>{
          const sizeKeys=Object.keys(p.sizes)
          const hasOverride=sizeKeys.some(k=>draft[p.id]?.[k]!==p.sizes[k])
          return(
            <div key={p.id} style={{background:"rgba(255,255,255,.04)",borderRadius:"0.75rem",border:`1px solid ${hasOverride?"var(--yellow)":"var(--border)"}`,padding:"0.75rem 1rem",display:"flex",alignItems:"center",gap:"0.75rem",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:"10rem"}}>
                <p style={{fontWeight:700,fontSize:"0.88rem",color:"var(--white)"}}>{p.name}</p>
                <p style={{fontSize:"0.7rem",color:"var(--dim)"}}>{p.catLabel}{hasOverride?" · editado":""}</p>
              </div>
              <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",alignItems:"center"}}>
                {sizeKeys.map(k=>(
                  <div key={k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem"}}>
                    <span style={{fontSize:"0.65rem",fontWeight:700,color:"var(--dim)",textTransform:"uppercase"}}>{SZL[k]||k}</span>
                    <div style={{display:"flex",alignItems:"center",gap:"0.25rem"}}>
                      <span style={{fontSize:"0.75rem",color:"var(--dim)"}}>R$</span>
                      <input type="number" className="inp-sm" value={draft[p.id]?.[k]??p.sizes[k]}
                        onChange={e=>handleChange(p.id,k,e.target.value)} step="0.5" min="0"
                        style={{borderColor:draft[p.id]?.[k]!==p.sizes[k]?"var(--yellow)":"var(--border)"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   ADMIN — Panel
═══════════════════════════════════════════════════════ */
function AdminPanel({onLogout,orders,prices,onOrdersChanged,onPricesChanged}){
  const[tab,setTab]=useState("overview")
  const[loading,setLoading]=useState(false)
  const refresh=async()=>{
    setLoading(true)
    try{const[newOrders,newPrices]=await Promise.all([fbLoadOrders(),fbLoadPrices()]);onOrdersChanged(newOrders);onPricesChanged(newPrices)}
    catch(e){console.error(e)}
    setLoading(false)
  }
  const handleDelete=async id=>{await fbDeleteOrder(id);onOrdersChanged(orders.filter(o=>o.id!==id))}
  const handleClear=async()=>{await fbClearOrders();onOrdersChanged([])}
  const tabs=[{id:"overview",label:"Visao Geral"},{id:"ranking",label:"Ranking"},{id:"prices",label:"Precos"},{id:"history",label:"Historico"}]
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{globalStyles}</style>
      {loading&&<LoadingBar/>}
      <div style={{background:"var(--wine-dk)",borderBottom:"2px solid var(--wine)",padding:"0 1.25rem",height:"3.5rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span className="gv" style={{fontSize:"1.6rem",color:"var(--yellow)"}}>La Bella</span>
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button onClick={refresh} className="bo" style={{padding:"0.3rem 0.75rem",borderRadius:"0.6rem",fontSize:"0.75rem"}}>Atualizar</button>
          <button onClick={()=>{sessionStorage.removeItem(ADMIN_CONFIG.sessionKey);onLogout()}} style={{padding:"0.3rem 0.75rem",borderRadius:"0.6rem",border:"none",background:"rgba(255,255,255,.08)",fontSize:"0.75rem",fontWeight:700,color:"rgba(255,255,255,.55)",cursor:"pointer"}}>Sair</button>
        </div>
      </div>
      <div className="noscroll" style={{background:"var(--wine-dk)",borderBottom:"1px solid var(--border)",padding:"0 1.25rem",display:"flex",gap:"0.1rem",overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"0.7rem 1rem",fontWeight:700,fontSize:"0.82rem",border:"none",background:"transparent",cursor:"pointer",borderBottom:`2px solid ${tab===t.id?"var(--yellow)":"transparent"}`,color:tab===t.id?"var(--yellow)":"rgba(255,255,255,.5)",transition:"all .15s",whiteSpace:"nowrap",fontFamily:"Montserrat,sans-serif"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{flex:1,padding:"1.25rem",maxWidth:"56rem",width:"100%",margin:"0 auto"}}>
        {tab==="overview"&&<AdminOverview orders={orders}/>}
        {tab==="ranking" &&<AdminRanking  orders={orders}/>}
        {tab==="prices"  &&<AdminPrices   currentPrices={prices} onSaved={onPricesChanged}/>}
        {tab==="history" &&<AdminHistory  orders={orders} onClear={handleClear} onDelete={handleDelete}/>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   STORE VIEW
═══════════════════════════════════════════════════════ */
function StoreView({menu,onAdmin,onOrderSaved}){
  const{addSingle}=useCart()
  const[halfOpen,setHalfOpen]=useState(false)
  const[halfInit,setHalfInit]=useState(null)
  const[sizeModal,setSizeModal]=useState({open:false,pizza:null})
  const handleAdd=useCallback((pizza)=>{
    const keys=Object.keys(pizza.sizes)
    if(keys.length===1&&keys[0]==="UN")addSingle(pizza,"UN",MENU_BASE.meta.borders[0])
    else setSizeModal({open:true,pizza})
  },[addSingle])
  const handleSizeConfirm=useCallback((size,border)=>{addSingle(sizeModal.pizza,size,border);setSizeModal({open:false,pizza:null})},[addSingle,sizeModal.pizza])
  const handleHalf=useCallback((pizza)=>{setHalfInit(pizza);setHalfOpen(true)},[])

  return(
    <div style={{minHeight:"100vh"}}>
      <style>{globalStyles}</style>
      <Header onAdmin={onAdmin}/>

      {/* HERO */}
      <section style={{paddingTop:"7.5rem",paddingBottom:"3.5rem",textAlign:"center",padding:"7.5rem 1.25rem 3.5rem",background:"linear-gradient(to bottom,rgba(92,26,26,0.4) 0%,transparent 100%)"}}>
        {/* [PASSO 3b] Slogan e subtitulo */}
        <p className="mont" style={{fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.16em",textTransform:"uppercase",color:"rgba(245,197,24,.7)",marginBottom:"0.75rem"}}>
          Pindamonhangaba · Desde 2012
        </p>
        <img 
          src="/logo.png" 
          alt="Logo La Bella" 
          style={{ height: "300px", width: "auto", marginBottom: "1rem" }} 
        />
        <h1 className="gv" style={{fontSize:"clamp(3rem,10vw,5.5rem)",color:"var(--yellow)",lineHeight:1.1,textShadow:"0 2px 20px rgba(0,0,0,.55)"}}>
          La Bella Pizzaria
        </h1>
        {/* [PASSO 3c] Horario de funcionamento */}
        <p style={{color:"rgba(255,255,255,0.55)",fontSize:"0.9rem",maxWidth:"22rem",margin:"0.9rem auto 0",lineHeight:1.6}}>
          Terça á domingo · 18:00 as 00:00 · Delivery e retirada
        </p>
        <a href="#trad" className="by" style={{display:"inline-block",marginTop:"1.75rem",padding:"0.75rem 1.75rem",borderRadius:"1rem",fontWeight:700,fontSize:"0.9rem",fontFamily:"Montserrat,sans-serif"}}>
          Ver Cardapio
        </a>
      </section>

      {/* CARDAPIO */}
      <main style={{maxWidth:"72rem",margin:"0 auto",padding:"2rem 1.25rem"}}>
        {menu.categories.map(cat=>(
          <section key={cat.id} id={cat.id} style={{marginBottom:"3rem",scrollMarginTop:"5.5rem"}}>
            <div style={{marginBottom:"1.25rem"}}>
              <h2 className="mont" style={{fontWeight:700,fontSize:"1.4rem",color:"var(--white)"}}>{cat.label}</h2>
              <p style={{fontSize:"0.82rem",color:"var(--dim)",marginTop:"0.15rem"}}>{cat.desc}</p>
              <hr className="sdiv"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"1rem"}}>
              {cat.items.map(pizza=>(
                <ProductCard key={pizza.id} pizza={pizza} allowsHalf={cat.half} onAdd={handleAdd} onHalf={handleHalf}/>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* FOOTER com botao admin escondido */}
      <footer style={{background:"rgba(0,0,0,.5)",borderTop:"1px solid var(--border)",textAlign:"center",padding:"3rem 1.25rem 2rem",fontSize:"0.85rem"}}>
        <p className="gv" style={{fontSize:"2.5rem",color:"var(--yellow)",marginBottom:"0.25rem"}}>La Bella</p>
        {/* [PASSO 3d] Telefone e cidade */}
        <p style={{color:"rgba(255,255,255,.5)"}}>Pindamonhangaba, SP</p>
        <p style={{color:"rgba(255,255,255,.5)",marginTop:"0.2rem"}}>(12) 99137-5580</p>
        <p style={{marginTop:"1.5rem",fontSize:"0.7rem",color:"rgba(255,255,255,.2)"}}>© {new Date().getFullYear()} La Bella Pizzaria</p>

        {/* BOTAO ADMIN — quase invisivel, bem discreto no rodape */}
        <button
          onClick={onAdmin}
          style={{marginTop:"2rem",padding:"0.3rem 0.7rem",borderRadius:"0.4rem",background:"transparent",border:"none",fontSize:"0.6rem",color:"rgba(255,255,255,.1)",cursor:"pointer",letterSpacing:"0.08em",transition:"color .25s"}}
          onMouseEnter={e=>e.target.style.color="rgba(255,255,255,.35)"}
          onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.1)"}
        >
          admin
        </button>
      </footer>

      <CartDrawer/>
      <HalfModal isOpen={halfOpen} onClose={()=>setHalfOpen(false)} initPizza={halfInit}/>
      <SizeModal pizza={sizeModal.pizza} isOpen={sizeModal.open} onClose={()=>setSizeModal({open:false,pizza:null})} onConfirm={handleSizeConfirm}/>
      <CheckoutModal onOrderSaved={onOrderSaved}/>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════ */
export default function App(){
  const[view,setView]=useState(()=>isAdmin()?"admin":"store")
  const[prices,setPrices]=useState({})
  const[orders,setOrders]=useState([])
  const[loading,setLoading]=useState(true)
  const menu=useMemo(()=>applyPrices(MENU_BASE,prices),[prices])

  useEffect(()=>{
    let cancelled=false
    ;(async()=>{
      setLoading(true)
      try{
        const[p,o]=await Promise.all([fbLoadPrices(),fbLoadOrders()])
        if(!cancelled){setPrices(p);setOrders(o)}
      }catch(e){console.warn("Firebase offline:",e)}
      if(!cancelled)setLoading(false)
    })()
    return()=>{cancelled=true}
  },[])

  if(loading)return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{globalStyles}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:"3rem",height:"3rem",border:"3px solid rgba(245,197,24,.2)",borderTopColor:"var(--yellow)",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/>
        <p className="gv" style={{fontSize:"2rem",color:"var(--yellow)"}}>La Bella</p>
        <p style={{fontSize:"0.8rem",color:"var(--dim)",marginTop:"0.3rem"}}>Carregando cardapio...</p>
      </div>
    </div>
  )

  if(view==="adminLogin")return <AdminLogin onLogin={()=>setView("admin")} onBack={()=>setView("store")}/>
  if(view==="admin")return(
    <AdminPanel
      onLogout={()=>setView("store")}
      orders={orders} prices={prices}
      onOrdersChanged={setOrders}
      onPricesChanged={p=>{setPrices(p)}}
    />
  )
  return(
    <CartProvider menu={menu}>
      <StoreView
        menu={menu}
        onAdmin={()=>setView("adminLogin")}
        onOrderSaved={async()=>{try{const o=await fbLoadOrders();setOrders(o)}catch{}}}
      />
    </CartProvider>
  )
}
