/**
 * App.jsx — La Bella Pizzaria
 * Pindamonhangaba · SP
 *
 * Estrutura idêntica à Pizzaria Varanda.
 * Visual: fundo marrom escuro (madeira) + vermelho escuro.
 *
 * PASSO OBRIGATÓRIO ANTES DE USAR:
 *   Substitua o objeto FIREBASE_CONFIG abaixo com os dados do SEU projeto Firebase.
 *   Siga o guia FIREBASE_SETUP.md incluído neste projeto.
 */

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, collection,
  getDocs, deleteDoc, query, orderBy, writeBatch
} from "firebase/firestore";
import React, { useState, useReducer, useContext, createContext, useCallback, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   🔥 FIREBASE — substitua com os dados do SEU projeto
═══════════════════════════════════════════════════════════════ */
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
  } catch (e) { console.error("Erro ao carregar preços:", e); return {} }
}
async function fbSavePrices(pricesObj) {
  try { await setDoc(doc(db, "config", "precos"), pricesObj) }
  catch (e) { console.error("Erro ao salvar preços:", e) }
}

/* ═══════════════════════════════════════════════════════════════
   CONFIG ADMIN
═══════════════════════════════════════════════════════════════ */
const ADMIN_CONFIG = {
  username:   "admin",
  password:   "labella2026",
  sessionKey: "lb_admin_ok",
}

/* ═══════════════════════════════════════════════════════════════
   ESTILOS — tema madeira escura + vermelho escuro
═══════════════════════════════════════════════════════════════ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Lato:wght@400;700&display=swap');

  :root {
    --wood:        #2A1A0E;
    --wood-mid:    #3D2310;
    --wood-light:  #5C3317;
    --red:         #8B1A2A;
    --red-dark:    #6B1020;
    --red-light:   #A52035;
    --cream:       #F5E6C8;
    --cream-dim:   #D4B896;
    --gold:        #C8963C;
    --text-main:   #F2DFC0;
    --text-dim:    #A8896A;
    --white:       #FDFAF5;
    --surface:     rgba(255,255,255,0.06);
    --surface-md:  rgba(255,255,255,0.10);
    --border:      rgba(200,150,60,0.25);
    --border-strong: rgba(200,150,60,0.55);
    --shadow:      rgba(0,0,0,0.55);
  }

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{
    font-family:'Lato',sans-serif;
    background:var(--wood);
    color:var(--text-main);
    overflow-x:hidden;
    background-image:
      repeating-linear-gradient(88deg, transparent, transparent 40px, rgba(0,0,0,0.03) 40px, rgba(0,0,0,0.03) 41px),
      repeating-linear-gradient(92deg, transparent, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 61px);
  }
  .fd{font-family:'Playfair Display',serif;}
  button{cursor:pointer;font-family:'Lato',sans-serif;}
  input,textarea{font-family:'Lato',sans-serif;}
  a{text-decoration:none;color:inherit;}

  /* BOTÕES */
  .br{background:var(--red);color:white;border:none;transition:background .2s;}.br:hover{background:var(--red-light);}
  .bo{background:var(--wood-light);color:var(--cream);border:none;transition:background .2s;}.bo:hover{background:#7a4520;}
  .bg{background:rgba(200,150,60,.15);color:var(--gold);border:2px solid rgba(200,150,60,.3);transition:all .2s;}.bg:hover{background:rgba(200,150,60,.25);}
  .bl{background:transparent;border:2px solid var(--border-strong);color:var(--text-dim);transition:all .2s;}.bl:hover{border-color:var(--gold);}
  .bgreen{background:#16a34a;color:white;border:none;transition:background .2s;}.bgreen:hover{background:#15803d;}
  .bdan{background:#dc2626;color:white;border:none;transition:background .2s;}.bdan:hover{background:#b91c1c;}

  /* CARDS */
  .card{
    background:var(--surface-md);
    border-radius:1rem;
    border:1px solid var(--border);
    overflow:hidden;
    transition:transform .25s,box-shadow .25s;
  }
  .card:hover{transform:translateY(-4px);box-shadow:0 12px 30px var(--shadow);}

  /* DRAWER */
  .drawer{
    position:fixed;top:0;right:0;height:100%;width:100%;max-width:22rem;
    background:var(--wood-mid);
    z-index:50;display:flex;flex-direction:column;
    box-shadow:-4px 0 30px rgba(0,0,0,.5);
    transition:transform .3s ease;
    border-left:1px solid var(--border);
  }
  .dopen{transform:translateX(0);}.dclosed{transform:translateX(100%);}
  .ov{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:40;backdrop-filter:blur(3px);}

  /* MODAL */
  .mw{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:50;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);}
  .mb{
    background:var(--wood-mid);
    width:100%;max-width:32rem;max-height:92vh;
    display:flex;flex-direction:column;overflow:hidden;
    border-radius:1.5rem 1.5rem 0 0;
    box-shadow:0 -8px 40px rgba(0,0,0,.4);
    border:1px solid var(--border);
    border-bottom:none;
  }

  /* TAGS */
  .tag{font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:999px;}
  .tv{background:rgba(22,163,74,.2);color:#4ade80;}
  .tp{background:rgba(200,150,60,.2);color:var(--gold);}
  .tf{background:rgba(220,38,38,.2);color:#f87171;}
  .tc{background:rgba(139,92,246,.15);color:#c4b5fd;}
  .tpi{background:rgba(239,68,68,.15);color:#fca5a5;}
  .tn{background:rgba(16,185,129,.15);color:#6ee7b7;}
  .tch{background:rgba(236,72,153,.15);color:#f9a8d4;}
  .tsm{background:rgba(255,255,255,.08);color:var(--text-dim);}
  .tr{background:rgba(20,184,166,.15);color:#5eead4;}
  .td{background:rgba(217,70,239,.15);color:#e879f9;}
  .tb{background:rgba(59,130,246,.15);color:#93c5fd;}
  .tlt{background:rgba(16,185,129,.12);color:#6ee7b7;}

  .noscroll::-webkit-scrollbar{display:none;}.noscroll{-ms-overflow-style:none;scrollbar-width:none;}

  /* INPUTS */
  .inp{
    width:100%;border:2px solid var(--border);border-radius:.75rem;
    padding:.6rem 1rem;font-size:.875rem;outline:none;
    transition:border-color .2s;
    background:rgba(255,255,255,.07);
    color:var(--text-main);
  }
  .inp::placeholder{color:var(--text-dim);}
  .inp:focus{border-color:var(--red-light);}

  .inp-sm{
    border:2px solid var(--border);border-radius:.5rem;
    padding:.35rem .6rem;font-size:.82rem;outline:none;
    transition:border-color .2s;
    background:rgba(255,255,255,.07);
    color:var(--text-main);
    width:5.5rem;text-align:right;
  }
  .inp-sm:focus{border-color:var(--red-light);}

  .sdiv{height:2px;background:linear-gradient(to right,rgba(139,26,42,.5),var(--border),transparent);border:none;margin-top:.75rem;}
  .bar{height:8px;border-radius:4px;background:var(--red);transition:width .6s ease;}

  @media(min-width:640px){.mb{border-radius:1rem;}.mw{align-items:center;}}

  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes spin{to{transform:rotate(360deg)}}
`

/* ═══════════════════════════════════════════════════════════════
   CARDÁPIO BASE — La Bella Pizzaria
═══════════════════════════════════════════════════════════════ */
const MENU_BASE = {
  meta: {
    whatsappNumber: "5512991375580",   // ← TROQUE PELO NÚMERO DA LA BELLA
    halfRule: "highest",
    borders: [
      { id:"none",     label:"Sem borda",             price:0  },
      { id:"recheada", label:"Borda Recheada",         price:20 },
      { id:"cheddar",  label:"Borda de Cheddar",       price:22 },
    ],
    payments: [
      { id:"pix",    label:"PIX",                         needsChange:false },
      { id:"credit", label:"Cartão de Crédito (maquina)", needsChange:false },
      { id:"debit",  label:"Cartão de Débito (maquina)",  needsChange:false },
      { id:"cash",   label:"Dinheiro",                    needsChange:true  },
    ],
  },
  categories: [
    { id:"trad", label:"🍕 Tradicionais", desc:"As clássicas de sempre, feitas com o molho La Bella", half:true, items:[
      {id:"mussarela",       name:"Mussarela",           tags:["classica"],           desc:"Molho La Bella, mussarela, tomate, azeitona e orégano",                                                                          sizes:{M:50,G:55}},
      {id:"margherita",      name:"Margherita",           tags:["classica"],           desc:"Molho La Bella, mussarela, tomate, azeitona, orégano e manjericão fresco",                                                      sizes:{M:52,G:57}},
      {id:"napolitana",      name:"Napolitana",           tags:["classica"],           desc:"Molho La Bella, mussarela, tomate, azeitona, orégano e parmesão ralado",                                                        sizes:{M:52,G:57}},
      {id:"milho",           name:"Milho Verde",          tags:["vegetariana"],        desc:"Molho La Bella, mussarela, milho verde, azeitona e orégano",                                                                    sizes:{M:52,G:57}},
      {id:"alho",            name:"Alho",                 tags:["classica"],           desc:"Molho La Bella, mussarela, tomate, alho fatiado, azeitona e orégano",                                                          sizes:{M:52,G:57}},
      {id:"catupiry",        name:"Catupiry",             tags:["classica"],           desc:"Molho La Bella, mussarela, catupiry, azeitona e orégano",                                                                       sizes:{M:56,G:61}},
      {id:"presunto",        name:"Presunto",             tags:["classica"],           desc:"Molho La Bella, mussarela, presunto, tomate, azeitona e orégano",                                                              sizes:{M:54,G:59}},
      {id:"salame",          name:"Salame",               tags:["classica"],           desc:"Molho La Bella, mussarela, salame, tomate, azeitona e orégano",                                                                sizes:{M:58,G:63}},
      {id:"quatro_queijos",  name:"4 Queijos",            tags:["classica"],           desc:"Molho La Bella, mussarela, provolone, catupiry, parmesão, azeitona e orégano",                                                 sizes:{M:62,G:67}},
      {id:"rucula",          name:"Rúcula",               tags:["classica"],           desc:"Molho La Bella, mussarela, tomate seco, azeitona, orégano e rúcula",                                                          sizes:{M:59,G:64}},
      {id:"atum",            name:"Atum",                 tags:["classica"],           desc:"Molho La Bella, mussarela, atum, cebola, azeitona e orégano",                                                                  sizes:{M:63,G:68}},
      {id:"calabresa",       name:"Calabresa",            tags:["classica","picante"], desc:"Molho La Bella, mussarela, calabresa fatiada, cebola, azeitona e orégano",                                                     sizes:{M:58,G:63}},
      {id:"caipira",         name:"Caipira",              tags:["classica"],           desc:"Molho La Bella, mussarela, frango desfiado, milho, azeitona e orégano",                                                       sizes:{M:60,G:65}},
      {id:"bacon",           name:"Bacon",                tags:["classica"],           desc:"Molho La Bella, mussarela, bacon, azeitona e orégano",                                                                         sizes:{M:63,G:68}},
      {id:"brocolis",        name:"Brócolis",             tags:["vegetariana"],        desc:"Molho La Bella, mussarela, catupiry, brócolis, bacon, azeitona e orégano",                                                    sizes:{M:65,G:70}},
      {id:"frango_cat",      name:"Frango c/ Catupiry",   tags:["favorito"],           desc:"Molho La Bella, mussarela, frango desfiado, catupiry, azeitona e orégano",                                                    sizes:{M:65,G:70}},
      {id:"pepperoni",       name:"Pepperoni",            tags:["picante"],            desc:"Molho La Bella, mussarela, pepperoni, tomate, azeitona e orégano",                                                            sizes:{M:68,G:73}},
      {id:"portuguesa",      name:"Portuguesa",           tags:["classica"],           desc:"Molho La Bella, mussarela, presunto, ervilha, palmito, calabresa, ovos, azeitona e orégano",                                  sizes:{M:65,G:70}},
      {id:"champignon",      name:"Champignon",           tags:["especial"],           desc:"Molho La Bella, mussarela, catupiry, champignon, azeitona e orégano",                                                         sizes:{M:65,G:70}},
      {id:"palmito",         name:"Palmito",              tags:["especial"],           desc:"Molho La Bella, mussarela, catupiry, palmito, azeitona e orégano",                                                            sizes:{M:68,G:73}},
      {id:"lombo",           name:"Lombo Campeão",        tags:["especial"],           desc:"Molho La Bella, mussarela, catupiry, lombo defumado, azeitona e orégano",                                                     sizes:{M:65,G:70}},
      {id:"carne_seca",      name:"Carne Seca",           tags:["especial"],           desc:"Molho La Bella, mussarela, carne seca desfiada, cebola caramelizada, azeitona e orégano",                                    sizes:{M:70,G:75}},
      {id:"strogonoff",      name:"Strogonoff",           tags:["especial"],           desc:"Molho La Bella, mussarela, frango, champignon, creme de leite, batata palha e orégano",                                      sizes:{M:68,G:73}},
      {id:"pantaneira",      name:"Pantaneira",           tags:["especial"],           desc:"Molho La Bella, mussarela, catupiry, carne seca, azeitona e orégano",                                                        sizes:{M:70,G:75}},
      {id:"baiana",          name:"Baiana",               tags:["picante"],            desc:"Molho La Bella, mussarela, calabresa, pimenta, ovos, cebola, alho e orégano",                                                sizes:{M:64,G:69}},
      {id:"vegetariana",     name:"Vegetariana",          tags:["vegetariana"],        desc:"Molho La Bella, mussarela, brócolis, palmito, milho, champignon, azeitona e orégano",                                        sizes:{M:72,G:77}},
      {id:"peito_peru",      name:"Peito de Peru",        tags:["especial"],           desc:"Molho La Bella, mussarela, catupiry, peito de peru, azeitona e orégano",                                                     sizes:{M:64,G:69}},
      {id:"siciliana",       name:"Siciliana",            tags:["especial"],           desc:"Molho La Bella, mussarela, champignon, bacon, azeitona e orégano",                                                           sizes:{M:65,G:70}},
      {id:"escarola",        name:"Escarola",             tags:["vegetariana"],        desc:"Molho La Bella, mussarela, escarola temperada, bacon, cebola, azeitona e orégano",                                           sizes:{M:64,G:69}},
      {id:"sardinha",        name:"Sardinha",             tags:["classica"],           desc:"Molho La Bella, mussarela, sardinha, cebola, ovo, tomate, azeitona e orégano",                                               sizes:{M:62,G:67}},
      {id:"genova",          name:"Gênova [Light]",       tags:["light"],              desc:"Molho La Bella, mussarela, peito de peru, tomate, azeitona, manjericão e orégano",                                           sizes:{M:65,G:70}},
      {id:"veneza",          name:"Veneza [Light]",       tags:["light"],              desc:"Molho La Bella, mussarela, peito de peru, rúcula, tomate, azeitona e orégano",                                               sizes:{M:65,G:70}},
      {id:"moda_casa",       name:"À Moda da Casa",       tags:["especial"],           desc:"Molho La Bella, mussarela, presunto, calabresa, bacon, ervilha, palmito, ovos, cebola, azeitona e orégano",                  sizes:{M:75,G:80}},
      {id:"portuguesa_esp",  name:"Portuguesa Especial",  tags:["especial"],           desc:"Molho La Bella, mussarela, presunto, lombo, ervilha, ovo, milho, palmito, calabresa, cebola, tomate, azeitona e orégano",    sizes:{M:78,G:83}},
      {id:"abobrinha",       name:"Abobrinha",            tags:["vegetariana"],        desc:"Molho La Bella, mussarela, abobrinha, parmesão, azeitona e orégano",                                                         sizes:{M:65,G:70}},
      {id:"berinjela",       name:"Berinjela",            tags:["vegetariana"],        desc:"Molho La Bella, berinjela temperada, mussarela, parmesão, azeitona e orégano",                                               sizes:{M:65,G:70}},
      {id:"salsicha",        name:"Salsicha",             tags:["classica"],           desc:"Molho La Bella, mussarela, salsicha fatiada, azeitona e orégano",                                                            sizes:{M:58,G:63}},
      {id:"brocolis_palmito",name:"Brócolis c/ Palmito",  tags:["vegetariana"],        desc:"Molho La Bella, mussarela, brócolis, palmito, catupiry, azeitona e orégano",                                                 sizes:{M:70,G:75}},
    ]},
    { id:"especiais", label:"⭐ Especiais La Bella", desc:"As criações exclusivas da casa", half:true, items:[
      {id:"bella_rucula",    name:"Bella Rúcula",         tags:["especial"],           desc:"Molho La Bella, mussarela, rúcula, tomate seco, grana padano, mel de alecrim e orégano",                                      sizes:{M:78,G:85}},
      {id:"bella_trufa",     name:"Bella Trufada",        tags:["especial","premium"], desc:"Creme de trufa, mussarela de búfala, cogumelos shiitake, parmesão e azeite de trufas",                                        sizes:{M:95,G:105}},
      {id:"bella_carne",     name:"Bella Carne",          tags:["especial"],           desc:"Molho La Bella, mussarela, picanha fatiada, cebola roxa, azeitona e chimichurri",                                             sizes:{M:88,G:96}},
      {id:"bella_gorgonzola",name:"Gorgonzola La Bella",  tags:["especial","premium"], desc:"Molho branco, mussarela, gorgonzola, pera fatiada, nozes e mel",                                                              sizes:{M:85,G:93}},
      {id:"bella_camarao",   name:"Camarão La Bella",     tags:["especial","premium"], desc:"Molho rosé, mussarela, camarão refogado, catupiry, azeitona e orégano",                                                       sizes:{M:92,G:100}},
      {id:"bella_primavera", name:"Primavera",            tags:["especial","vegetariana"],desc:"Molho pesto, mussarela, tomate cereja, abobrinha, pimentão grelhado e azeitona",                                           sizes:{M:78,G:85}},
      {id:"bella_defumada",  name:"Defumada La Bella",    tags:["especial"],           desc:"Molho La Bella, mussarela, linguiça defumada, provolone, cebola caramelizada e orégano",                                     sizes:{M:82,G:89}},
      {id:"bella_burguer",   name:"La Bella Burguer",     tags:["especial"],           desc:"Molho La Bella, hambúrguer artesanal, mussarela, tomate, cebola crispy e mostarda",                                           sizes:{M:80,G:87}},
    ]},
    { id:"multi", label:"🎨 3 e 4 Sabores", desc:"Preço fixo — informe os sabores nas observações", half:false, items:[
      {id:"p3_trad",  name:"Pizza 3 Sabores (Tradicional)", tags:["especial"], desc:"Escolha 3 sabores tradicionais. Informe os sabores no campo de observações do pedido.", sizes:{UN:88} },
      {id:"p4_trad",  name:"Pizza 4 Sabores (Tradicional)", tags:["especial"], desc:"Escolha 4 sabores tradicionais. Informe os sabores no campo de observações do pedido.", sizes:{UN:100}},
      {id:"p3_esp",   name:"Pizza 3 Sabores (Especial)",    tags:["premium"],  desc:"Escolha 3 sabores especiais La Bella. Informe os sabores nas observações.",             sizes:{UN:115}},
      {id:"p4_esp",   name:"Pizza 4 Sabores (Especial)",    tags:["premium"],  desc:"Escolha 4 sabores especiais La Bella. Informe os sabores nas observações.",             sizes:{UN:130}},
    ]},
    { id:"doces", label:"🍫 Pizzas Doces", desc:"Para fechar com doçura — tamanho único", half:false, items:[
      {id:"brigadeiro",    name:"Brigadeiro",        tags:["doce"], desc:"Massa, cobertura de brigadeiro belga, granulado e morangos frescos",   sizes:{UN:65}},
      {id:"romeu_julieta", name:"Romeu & Julieta",   tags:["doce"], desc:"Massa, goiabada, mussarela e creme de leite",                          sizes:{UN:62}},
      {id:"nutella",       name:"Nutella",            tags:["doce"], desc:"Massa, Nutella, morangos fatiados e açúcar de confeiteiro",            sizes:{UN:72}},
      {id:"banana_canela", name:"Banana c/ Canela",  tags:["doce"], desc:"Massa, banana caramelizada, doce de leite, canela e coco ralado",      sizes:{UN:62}},
    ]},
    { id:"bebidas", label:"🥤 Bebidas", desc:"Para acompanhar sua pizza", half:false, items:[
      {id:"coca_ks",    name:"Coca-Cola KS",           tags:["bebida"], desc:"Lata KS 220ml",                                sizes:{UN:6}  },
      {id:"refri_lata", name:"Refrigerante (lata)",    tags:["bebida"], desc:"Coca | Pepsi | Guaraná | Fanta | Sprite",      sizes:{UN:8}  },
      {id:"coca_600",   name:"Coca-Cola 600ml",        tags:["bebida"], desc:"Garrafa 600ml",                                sizes:{UN:9}  },
      {id:"refri_1l",   name:"Refrigerante 1L",        tags:["bebida"], desc:"Pet 1 litro",                                  sizes:{UN:12} },
      {id:"refri_2l",   name:"Refrigerante 2L",        tags:["bebida"], desc:"Pet 2 litros",                                 sizes:{UN:15} },
      {id:"agua",       name:"Água Mineral",           tags:["bebida"], desc:"500ml com ou sem gás",                         sizes:{UN:5}  },
      {id:"suco",       name:"Suco Natural 500ml",     tags:["bebida"], desc:"Laranja | Limão | Maracujá",                   sizes:{UN:12} },
    ]},
  ]
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function applyPrices(base, overrides) {
  if (!overrides || Object.keys(overrides).length === 0) return base
  return {
    ...base,
    categories: base.categories.map(cat => ({
      ...cat,
      items: cat.items.map(p => {
        const ov = overrides[p.id]
        return ov ? { ...p, sizes: { ...p.sizes, ...ov } } : p
      })
    }))
  }
}

const SZL   = { M:"Média", G:"Grande", UN:"Único" }
const brl   = v => `R$ ${Number(v).toFixed(2).replace(".",",")}`
const genId = () => `lb${Date.now()}${Math.random().toString(36).slice(2,5)}`

function recalc(it) { it.totalPrice = (it.unitPrice + (it.border?.price ?? 0)) * it.quantity; return it }
const isAdmin = () => sessionStorage.getItem(ADMIN_CONFIG.sessionKey) === "1"

/* ═══════════════════════════════════════════════════════════════
   CART CONTEXT
═══════════════════════════════════════════════════════════════ */
const CartCtx  = createContext(null)
const initCart = { items:[], co:{name:"",address:"",complement:"",pay:null,change:null,notes:""}, cartOpen:false, coOpen:false }

function cartR(s, {type:t, p}) {
  switch(t) {
    case"ADD_S": { const it=recalc({cartItemId:genId(),type:"single",size:p.size,border:p.border,removed:[],quantity:1,unitPrice:p.pizza.sizes[p.size],totalPrice:0,pizza:p.pizza}); return{...s,items:[...s.items,it],cartOpen:true} }
    case"ADD_H": { const it=recalc({cartItemId:genId(),type:"half",size:p.size,border:p.border,removed:[],quantity:1,unitPrice:p.up,totalPrice:0,h1:p.h1,h2:p.h2}); return{...s,items:[...s.items,it],cartOpen:true} }
    case"UPD":   { const items=s.items.map(i=>{if(i.cartItemId!==p.id)return i;const n={...i,quantity:i.quantity+p.d};return n.quantity<1?null:recalc(n)}).filter(Boolean); return{...s,items} }
    case"RM":    return{...s,items:s.items.filter(i=>i.cartItemId!==p.id)}
    case"CLEAR": return{...s,items:[],coOpen:false}
    case"SET_CO":return{...s,co:{...s.co,[p.f]:p.v}}
    case"TOG":   return{...s,cartOpen:!s.cartOpen,coOpen:false}
    case"OPCO":  return{...s,coOpen:true,cartOpen:false}
    case"CLCO":  return{...s,coOpen:false}
    default:     return s
  }
}

function CartProvider({children, menu}) {
  const [s,d] = useReducer(cartR, initCart)
  const ic  = s.items.reduce((a,i)=>a+i.quantity,0)
  const sub = s.items.reduce((a,i)=>a+i.totalPrice,0)
  return (
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
const useCart = () => useContext(CartCtx)

/* ── WhatsApp message builder ── */
function buildMsg(items, co, sub) {
  const sep  = "─────────────────────────────"
  const addr = [co.address, co.complement].filter(Boolean).join(", ")
  return [
    `🍕 *LA BELLA PIZZARIA* — Pindamonhangaba`, `📋 *Novo Pedido*`, sep,
    `👤 *Cliente:* ${co.name||"Não informado"}`, `📍 *Endereço:* ${addr||"Não informado"}`,
    `\n🛒 *Itens:*`,
    ...items.map(it => {
      const b = it.border?.id!=="none" ? ` + ${it.border?.label}` : ""
      if(it.type==="half") return `  • ${it.quantity}x Meia (${SZL[it.size]||it.size})${b} — ${brl(it.totalPrice)}\n      ↳ ${it.h1.name} + ${it.h2.name}`
      return `  • ${it.quantity}x ${it.pizza.name} (${SZL[it.size]||it.size})${b} — ${brl(it.totalPrice)}`
    }),
    `\n${sep}`, `💰 *Subtotal dos itens:* ${brl(sub)}`, `🛵 *Frete:* A confirmar pela pizzaria`,
    `⚠️ _Aguarde confirmação do frete._`, `\n💳 *Pagamento:* ${co.pay?.label??"Não informado"}`,
    co.pay?.needsChange&&co.change ? `   🔄 Troco para: ${brl(co.change)}` : "",
    co.notes ? `\n📝 *Obs:* ${co.notes}` : "",
    `\n${sep}\nAguardo confirmação! 😊`,
  ].filter(Boolean).join("\n")
}

/* ═══════════════════════════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════════════════════════ */
const Lbl = ({children}) => (
  <p style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-dim)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.4rem"}}>{children}</p>
)
const MH = ({title,sub,onClose}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem",borderBottom:"1px solid var(--border)"}}>
    <div>
      <h2 className="fd" style={{fontWeight:700,fontSize:"1.1rem",color:"var(--text-main)"}}>{title}</h2>
      {sub&&<p style={{fontSize:"0.72rem",color:"var(--text-dim)",marginTop:"0.1rem"}}>{sub}</p>}
    </div>
    <button onClick={onClose} style={{width:"2rem",height:"2rem",borderRadius:"50%",background:"var(--surface-md)",border:"1px solid var(--border)",fontWeight:700,color:"var(--text-main)"}}>✕</button>
  </div>
)

function LoadingBar() {
  return <div style={{position:"fixed",top:0,left:0,right:0,height:"3px",zIndex:9999,background:"linear-gradient(90deg,var(--red),var(--gold),var(--red))",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>
}

/* ── SizeModal ── */
function SizeModal({pizza, isOpen, onClose, onConfirm}) {
  const sizes = pizza ? Object.keys(pizza.sizes).filter(s=>s!=="UN") : []
  const [size,  setSize]   = useState(sizes[0]||"M")
  const [border,setBorder] = useState(MENU_BASE.meta.borders[0])
  useEffect(()=>{ if(isOpen&&pizza){ setSize(Object.keys(pizza.sizes).filter(k=>k!=="UN")[0]||"M"); setBorder(MENU_BASE.meta.borders[0]) } },[isOpen,pizza])
  if(!isOpen||!pizza) return null
  const calcP = () => (pizza.sizes[size]??0) + (border?.price??0)
  return (
    <div className="mw" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mb">
        <MH title={pizza.name} sub={pizza.desc} onClose={onClose}/>
        <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1rem",overflowY:"auto"}}>
          {sizes.length>1 && (
            <div><Lbl>Tamanho</Lbl>
              <div style={{display:"flex",gap:"0.5rem"}}>
                {sizes.map(s=>(
                  <button key={s} onClick={()=>setSize(s)} style={{flex:1,padding:"0.75rem",borderRadius:"0.75rem",border:`2px solid ${size===s?"var(--red-light)":"var(--border)"}`,background:size===s?"rgba(139,26,42,.2)":"transparent",cursor:"pointer",fontWeight:700,fontSize:"0.9rem",color:size===s?"var(--cream)":"var(--text-dim)"}}>
                    <div>{SZL[s]}</div><div style={{fontSize:"0.8rem",fontWeight:400,opacity:0.7,marginTop:"0.15rem"}}>{brl(pizza.sizes[s])}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div><Lbl>Borda</Lbl>
            <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
              {MENU_BASE.meta.borders.map(opt=>(
                <button key={opt.id} onClick={()=>setBorder(opt)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.7rem",borderRadius:"0.75rem",border:`2px solid ${border?.id===opt.id?"var(--gold)":"var(--border)"}`,background:border?.id===opt.id?"rgba(200,150,60,.15)":"transparent",cursor:"pointer"}}>
                  <span style={{fontWeight:700,fontSize:"0.85rem",color:"var(--text-main)"}}>{opt.label}</span>
                  <span style={{fontSize:"0.75rem",fontWeight:700,color:opt.price===0?"var(--text-dim)":"var(--gold)"}}>{opt.price===0?"grátis":`+${brl(opt.price)}`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding:"1rem",borderTop:"1px solid var(--border)",background:"rgba(0,0,0,.2)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.75rem"}}><span style={{color:"var(--text-dim)",fontSize:"0.85rem"}}>Total</span><span style={{fontWeight:700,color:"var(--gold)"}}>{brl(calcP())}</span></div>
          <button onClick={()=>onConfirm(size,border)} className="br" style={{width:"100%",padding:"0.75rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.9rem"}}>Adicionar ao Carrinho 🛒</button>
        </div>
      </div>
    </div>
  )
}

/* ── Tags ── */
const TAGMAP = {classica:"tc",vegetariana:"tv",premium:"tp",favorito:"tf",picante:"tpi",especial:"tch",light:"tlt",doce:"td",bebida:"tb"}

/* ── Header ── */
function Header({onAdmin}) {
  const {itemCount,toggleCart} = useCart()
  return (
    <header style={{position:"fixed",top:0,left:0,right:0,zIndex:30,background:"rgba(42,26,14,0.97)",backdropFilter:"blur(8px)",borderBottom:"1px solid var(--border)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.25rem",height:"4rem",maxWidth:"72rem",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div className="fd" style={{fontWeight:900,fontSize:"1.4rem",display:"flex",gap:"6px",alignItems:"baseline"}}>
            <span style={{color:"var(--cream)",fontStyle:"italic"}}>La</span>
            <span style={{color:"var(--red-light)"}}>Bella</span>
          </div>
          <span style={{fontSize:"0.65rem",color:"var(--text-dim)",letterSpacing:"0.08em",textTransform:"uppercase",borderLeft:"1px solid var(--border)",paddingLeft:"10px"}}>Pizzaria</span>
        </div>
        <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
          <button onClick={onAdmin} style={{padding:"0.4rem 0.8rem",borderRadius:"0.6rem",border:"1px solid var(--border)",background:"transparent",fontSize:"0.75rem",fontWeight:700,color:"var(--text-dim)"}}>⚙️ Admin</button>
          <button onClick={toggleCart} className="br" style={{padding:"0.5rem 1rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.4rem",position:"relative"}}>
            🛒 Carrinho
            {itemCount>0&&<span style={{position:"absolute",top:"-0.5rem",right:"-0.5rem",background:"var(--gold)",color:"var(--wood)",fontSize:"0.65rem",fontWeight:900,width:"1.2rem",height:"1.2rem",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{itemCount}</span>}
          </button>
        </div>
      </div>
      <nav className="noscroll" style={{display:"flex",gap:"0.25rem",padding:"0 1.25rem 0.5rem",overflowX:"auto",maxWidth:"72rem",margin:"0 auto"}}>
        {MENU_BASE.categories.map(c=>(
          <a key={c.id} href={`#${c.id}`} style={{flexShrink:0,fontSize:"0.75rem",fontWeight:700,padding:"0.3rem 0.7rem",borderRadius:"999px",color:"var(--text-dim)",transition:"all .2s",whiteSpace:"nowrap"}}
            onMouseEnter={e=>{e.target.style.background="rgba(139,26,42,.3)";e.target.style.color="var(--cream)"}}
            onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="var(--text-dim)"}}>
            {c.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

/* ── ProductCard ── */
function ProductCard({pizza,allowsHalf,onAdd,onHalf}) {
  const prices  = Object.values(pizza.sizes)
  const lo      = Math.min(...prices)
  const isUnique = Object.keys(pizza.sizes).length===1 && pizza.sizes.UN!==undefined
  return (
    <article className="card" style={{display:"flex",flexDirection:"column"}}>
      <div style={{height:"9rem",width:"100%",background:"rgba(0,0,0,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3.5rem"}}>
        🍕
      </div>
      <div style={{padding:"0.9rem",display:"flex",flexDirection:"column",gap:"0.35rem",flex:1}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.2rem"}}>
          {pizza.tags.slice(0,2).map(t=><span key={t} className={`tag ${TAGMAP[t]||""}`}>{t}</span>)}
        </div>
        <h3 className="fd" style={{fontWeight:700,fontSize:"0.95rem",lineHeight:1.2,color:"var(--cream)"}}>{pizza.name}</h3>
        <p style={{fontSize:"0.75rem",color:"var(--text-dim)",lineHeight:1.4,flex:1,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{pizza.desc}</p>
        <p style={{fontSize:"0.82rem",fontWeight:700,color:"var(--gold)"}}>{isUnique?brl(lo):`${brl(lo)} – ${brl(Math.max(...prices))}`}</p>
        <div style={{display:"flex",gap:"0.5rem",marginTop:"0.2rem"}}>
          <button onClick={()=>onAdd(pizza)} className="br" style={{flex:1,padding:"0.45rem",borderRadius:"0.6rem",fontWeight:700,fontSize:"0.78rem"}}>{isUnique?"Adicionar":"Escolher tamanho"}</button>
          {allowsHalf&&<button onClick={()=>onHalf(pizza)} className="bg" style={{padding:"0.45rem 0.65rem",borderRadius:"0.6rem",fontWeight:700,fontSize:"0.78rem"}}>Meia</button>}
        </div>
      </div>
    </article>
  )
}

/* ── CartRow ── */
function CartRow({item}) {
  const {upd,rm} = useCart()
  const title = item.type==="half" ? `Meia: ${item.h1.name} + ${item.h2.name}` : item.pizza.name
  const sub   = [SZL[item.size]||item.size, item.border?.id!=="none"?item.border?.label:null].filter(Boolean).join(" · ")
  return (
    <div style={{display:"flex",gap:"0.75rem",paddingTop:"0.75rem",paddingBottom:"0.75rem",borderBottom:"1px solid var(--border)"}}>
      <span style={{fontSize:"1.3rem",width:"2rem",textAlign:"center",flexShrink:0}}>🍕</span>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:"0.85rem",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--cream)"}}>{title}</p>
        {sub&&<p style={{fontSize:"0.7rem",color:"var(--text-dim)",marginTop:"0.1rem"}}>{sub}</p>}
        <p style={{fontSize:"0.85rem",fontWeight:700,color:"var(--gold)",marginTop:"0.2rem"}}>{brl(item.totalPrice)}</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem",flexShrink:0}}>
        <button onClick={()=>upd(item.cartItemId,1)} style={{width:"1.5rem",height:"1.5rem",borderRadius:"50%",background:"var(--surface-md)",border:"1px solid var(--border)",fontWeight:700,fontSize:"0.9rem",color:"var(--cream)"}}>+</button>
        <span style={{fontSize:"0.85rem",fontWeight:700,width:"1.25rem",textAlign:"center",color:"var(--cream)"}}>{item.quantity}</span>
        <button onClick={()=>item.quantity===1?rm(item.cartItemId):upd(item.cartItemId,-1)} style={{width:"1.5rem",height:"1.5rem",borderRadius:"50%",background:"var(--surface-md)",border:"1px solid var(--border)",fontWeight:700,fontSize:"0.85rem",color:"var(--cream)"}}>{item.quantity===1?"🗑":"−"}</button>
      </div>
    </div>
  )
}

/* ── CartDrawer ── */
function CartDrawer() {
  const {items,subtotal,cartOpen,toggleCart,openCo} = useCart()
  return (
    <>{cartOpen&&<div className="ov" onClick={toggleCart}/>}
    <aside className={`drawer ${cartOpen?"dopen":"dclosed"}`}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem",borderBottom:"1px solid var(--border)"}}>
        <h2 className="fd" style={{fontWeight:700,fontSize:"1.1rem",color:"var(--cream)"}}>🛒 Seu Pedido</h2>
        <button onClick={toggleCart} style={{width:"2rem",height:"2rem",borderRadius:"50%",background:"var(--surface-md)",border:"1px solid var(--border)",fontWeight:700,color:"var(--text-main)"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"1rem"}}>
        {items.length===0
          ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:"0.75rem",color:"var(--text-dim)"}}>
              <span style={{fontSize:"3rem"}}>🍕</span>
              <p style={{fontWeight:700,color:"var(--text-main)"}}>Carrinho vazio</p>
              <p style={{fontSize:"0.8rem",textAlign:"center"}}>Adicione pizzas para começar!</p>
            </div>
          : items.map(it=><CartRow key={it.cartItemId} item={it}/>)
        }
      </div>
      {items.length>0&&(
        <div style={{padding:"1rem",borderTop:"1px solid var(--border)",background:"rgba(0,0,0,.3)",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.85rem",color:"var(--text-dim)"}}><span>Subtotal</span><span>{brl(subtotal)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.75rem",color:"var(--text-dim)",fontStyle:"italic"}}><span>Frete</span><span>A confirmar</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,paddingTop:"0.5rem",borderTop:"1px solid var(--border)"}}><span style={{color:"var(--cream)"}}>Total s/ frete</span><span style={{color:"var(--gold)"}}>{brl(subtotal)}</span></div>
          <button onClick={openCo} className="bo" style={{width:"100%",padding:"0.75rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.85rem",marginTop:"0.25rem"}}>📲 Finalizar via WhatsApp</button>
        </div>
      )}
    </aside></>
  )
}

/* ── HalfModal ── */
function HalfModal({isOpen,onClose,initPizza}) {
  const {addHalf,menu} = useCart()
  const [h1,setH1]     = useState(initPizza)
  const [h2,setH2]     = useState(null)
  const [size,setSize] = useState("M")
  const [border,setBorder] = useState(MENU_BASE.meta.borders[0])
  const [step,setStep] = useState(initPizza?2:1)
  useEffect(()=>{if(isOpen){setH1(initPizza??null);setH2(null);setSize("M");setBorder(MENU_BASE.meta.borders[0]);setStep(initPizza?2:1)}},[isOpen,initPizza])
  if(!isOpen) return null
  const all  = menu.categories.filter(c=>c.half).flatMap(c=>c.items)
  const avSz = h1&&h2?Object.keys(h1.sizes).filter(s=>h2.sizes[s]&&s!=="UN"):h1?Object.keys(h1.sizes).filter(s=>s!=="UN"):["M","G"]
  const calcP = ()=>(!h1||!h2)?0:Math.max(h1.sizes[size]??0,h2.sizes[size]??0)+(border?.price??0)
  return (
    <div className="mw" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mb">
        <MH title="Pizza Meio a Meio" sub={step===1?"Escolha a 1ª metade":step===2?"Escolha a 2ª metade":"Configure tamanho e borda"} onClose={onClose}/>
        <div style={{overflowY:"auto",flex:1,padding:"1rem"}}>
          <div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem"}}>
            {[h1,h2].map((h,idx)=>(
              <button key={idx} onClick={()=>setStep(idx+1)} style={{flex:1,padding:"0.75rem",borderRadius:"0.75rem",border:`2px solid ${step===idx+1?"var(--red-light)":h?"var(--gold)":"var(--border)"}`,borderStyle:!h?"dashed":undefined,background:step===idx+1?"rgba(139,26,42,.2)":h?"rgba(200,150,60,.1)":"transparent",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:"1.5rem"}}>🍕</div>
                <div style={{fontSize:"0.75rem",fontWeight:700,color:"var(--cream)",marginTop:"0.2rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h?h.name:`${idx+1}ª metade`}</div>
              </button>
            ))}
          </div>
          {(step===1||step===2)&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
              {all.map(p=>{
                const isSel   = step===1?h1?.id===p.id:h2?.id===p.id
                const isOther = step===1?h2?.id===p.id:h1?.id===p.id
                return (
                  <button key={p.id} disabled={isOther} onClick={()=>{if(step===1){setH1(p);setStep(2)}else{setH2(p);setStep(3)}}}
                    style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.6rem",borderRadius:"0.75rem",border:`2px solid ${isSel?"var(--red-light)":"var(--border)"}`,background:isSel?"rgba(139,26,42,.2)":"transparent",cursor:isOther?"not-allowed":"pointer",opacity:isOther?0.3:1,textAlign:"left"}}>
                    <span style={{fontSize:"0.72rem",fontWeight:700,color:"var(--cream)",lineHeight:1.3}}>{p.name}</span>
                  </button>
                )
              })}
            </div>
          )}
          {step===3&&(
            <div style={{display:"flex",flexDirection:"column",gap:"1.2rem"}}>
              <div><Lbl>Tamanho</Lbl>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
                  {avSz.map(s=><button key={s} onClick={()=>setSize(s)} style={{padding:"0.7rem",borderRadius:"0.75rem",border:`2px solid ${size===s?"var(--red-light)":"var(--border)"}`,background:size===s?"rgba(139,26,42,.2)":"transparent",cursor:"pointer",fontWeight:700,fontSize:"0.85rem",color:size===s?"var(--cream)":"var(--text-dim)"}}>{SZL[s]||s}</button>)}
                </div>
              </div>
              <div><Lbl>Borda</Lbl>
                <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
                  {MENU_BASE.meta.borders.map(opt=>(
                    <button key={opt.id} onClick={()=>setBorder(opt)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.7rem",borderRadius:"0.75rem",border:`2px solid ${border?.id===opt.id?"var(--gold)":"var(--border)"}`,background:border?.id===opt.id?"rgba(200,150,60,.15)":"transparent",cursor:"pointer"}}>
                      <span style={{fontWeight:700,fontSize:"0.85rem",color:"var(--text-main)"}}>{opt.label}</span>
                      <span style={{fontSize:"0.75rem",fontWeight:700,color:opt.price===0?"var(--text-dim)":"var(--gold)"}}>{opt.price===0?"grátis":`+${brl(opt.price)}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"1rem",borderTop:"1px solid var(--border)",background:"rgba(0,0,0,.2)"}}>
          {h1&&h2&&<div style={{display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.75rem"}}><span style={{color:"var(--text-dim)"}}>Preço ({SZL[size]||size})</span><span style={{fontWeight:700,color:"var(--gold)"}}>{brl(calcP())}</span></div>}
          <div style={{display:"flex",gap:"0.5rem"}}>
            {step>1&&<button onClick={()=>setStep(step-1)} className="bl" style={{flex:1,padding:"0.6rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.85rem"}}>← Voltar</button>}
            {step===3&&h1&&h2?<button onClick={()=>{addHalf(h1,h2,size,border,calcP()-(border?.price??0));onClose()}} className="br" style={{flex:1,padding:"0.6rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.85rem"}}>Adicionar 🛒</button>
            :step<3&&h1?<button onClick={()=>setStep(step+1)} className="br" style={{flex:1,padding:"0.6rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.85rem"}}>Próximo →</button>:null}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── CheckoutModal ── */
function CheckoutModal({onOrderSaved}) {
  const {items,co,coOpen,subtotal,setCo,closeCo,clear} = useCart()
  const [errors,setErrors] = useState([])
  const [sent,setSent]     = useState(false)
  const [saving,setSaving] = useState(false)
  if(!coOpen) return null

  const send = async () => {
    const errs = []
    if(!co.name.trim())    errs.push("Informe seu nome.")
    if(!co.address.trim()) errs.push("Informe o endereço de entrega.")
    if(!co.pay)            errs.push("Selecione a forma de pagamento.")
    if(co.pay?.needsChange&&!co.change) errs.push("Informe o valor para troco.")
    if(items.length===0)   errs.push("Carrinho vazio.")
    if(errs.length){ setErrors(errs); return }
    setErrors([])
    setSaving(true)
    const order = {
      id:genId(), date:new Date().toISOString(), customerName:co.name,
      address:[co.address,co.complement].filter(Boolean).join(", "),
      payment:co.pay?.label, subtotal,
      items:items.map(it=>({type:it.type,size:it.size,quantity:it.quantity,totalPrice:it.totalPrice,
        pizzaName:it.type==="half"?`Meia: ${it.h1.name} + ${it.h2.name}`:it.pizza.name,
        pizzaIds:it.type==="half"?[it.h1.id,it.h2.id]:[it.pizza.id],
        pizzaNames:it.type==="half"?[it.h1.name,it.h2.name]:[it.pizza.name]}))
    }
    try { await fbSaveOrder(order) } catch(e) { console.warn("Firebase offline:", e) }
    window.open(`https://wa.me/${MENU_BASE.meta.whatsappNumber}?text=${encodeURIComponent(buildMsg(items,co,subtotal))}`,"_blank")
    setSaving(false); setSent(true); onOrderSaved()
  }

  if(sent) return (
    <div className="mw"><div className="mb" style={{padding:"2rem",alignItems:"center",justifyContent:"center",textAlign:"center",gap:"1rem",display:"flex",flexDirection:"column"}}>
      <div style={{fontSize:"3rem"}}>✅</div>
      <h2 className="fd" style={{fontWeight:700,fontSize:"1.3rem",color:"var(--cream)"}}>Pedido enviado!</h2>
      <p style={{fontSize:"0.9rem",color:"var(--text-dim)",lineHeight:1.6}}>O WhatsApp foi aberto com seu pedido.<br/>A pizzaria confirmará o frete em breve.</p>
      <button onClick={()=>{setSent(false);closeCo();clear()}} className="br" style={{width:"100%",padding:"0.875rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.9rem"}}>Fechar</button>
    </div></div>
  )

  return (
    <div className="mw" onClick={e=>e.target===e.currentTarget&&closeCo()}>
      <div className="mb">
        <MH title="Finalizar Pedido" onClose={closeCo}/>
        <div style={{overflowY:"auto",flex:1,padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1.1rem"}}>
          {errors.length>0&&<div style={{background:"rgba(220,38,38,.15)",border:"1px solid rgba(220,38,38,.4)",borderRadius:"0.75rem",padding:"0.75rem",display:"flex",flexDirection:"column",gap:"0.2rem"}}>{errors.map((e,i)=><p key={i} style={{fontSize:"0.82rem",color:"#f87171"}}>⚠️ {e}</p>)}</div>}
          <div style={{background:"rgba(200,150,60,.12)",border:"1px solid rgba(200,150,60,.3)",borderRadius:"0.75rem",padding:"0.75rem"}}>
            <p style={{fontSize:"0.82rem",fontWeight:700,color:"var(--gold)"}}>🛵 Frete a confirmar</p>
            <p style={{fontSize:"0.78rem",color:"var(--text-dim)",marginTop:"0.2rem",lineHeight:1.5}}>Após receber seu pedido, a pizzaria confirma o frete pelo seu endereço.</p>
          </div>
          <div><Lbl>Seu Nome *</Lbl><input className="inp" type="text" value={co.name} onChange={e=>setCo("name",e.target.value)} placeholder="Ex: João Silva"/></div>
          <div><Lbl>Endereço de Entrega *</Lbl><input className="inp" type="text" value={co.address} onChange={e=>setCo("address",e.target.value)} placeholder="Ex: Rua das Flores, 123 — Centro"/></div>
          <div><Lbl>Complemento (opcional)</Lbl><input className="inp" type="text" value={co.complement} onChange={e=>setCo("complement",e.target.value)} placeholder="Ex: Apto 42, portão azul..."/></div>
          <div><Lbl>Pagamento *</Lbl>
            <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
              {MENU_BASE.meta.payments.map(m=>(
                <button key={m.id} onClick={()=>{setCo("pay",m);setCo("change",null)}} style={{padding:"0.7rem",borderRadius:"0.75rem",border:`2px solid ${co.pay?.id===m.id?"var(--gold)":"var(--border)"}`,background:co.pay?.id===m.id?"rgba(200,150,60,.15)":"transparent",cursor:"pointer",textAlign:"left",fontWeight:700,fontSize:"0.85rem",color:co.pay?.id===m.id?"var(--gold)":"var(--text-main)"}}>{m.label}</button>
              ))}
            </div>
          </div>
          {co.pay?.needsChange&&<div><Lbl>Troco para quanto? *</Lbl><input className="inp" type="number" value={co.change??""} onChange={e=>setCo("change",parseFloat(e.target.value)||null)} placeholder={`Ex: ${(Math.ceil(subtotal/10)*10).toFixed(2)}`} min={subtotal}/></div>}
          <div><Lbl>Observações (opcional)</Lbl><textarea className="inp" rows={3} value={co.notes} onChange={e=>setCo("notes",e.target.value)} placeholder="Ex: Sem cebola, campainha quebrada... Informe aqui os sabores das pizzas 3 e 4 sabores!"/></div>
        </div>
        <div style={{padding:"1rem",borderTop:"1px solid var(--border)",background:"rgba(0,0,0,.2)",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,color:"var(--cream)"}}><span>Subtotal</span><span style={{color:"var(--gold)"}}>{brl(subtotal)}</span></div>
          <p style={{fontSize:"0.72rem",color:"var(--text-dim)",fontStyle:"italic"}}>+ Frete a confirmar pela pizzaria</p>
          <button onClick={send} disabled={saving} className="bgreen" style={{width:"100%",padding:"0.875rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",marginTop:"0.25rem",opacity:saving?0.7:1}}>
            {saving?"Salvando…":"📲 Enviar Pedido pelo WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN
═══════════════════════════════════════════════════════════════ */
const adminStyles = `
  body{ background:#1a1a1a !important; }
  .adm-wrap{ min-height:100vh; background:#1e1208; display:flex; flex-direction:column; }
  .adm-card{ background:rgba(255,255,255,0.05); border-radius:1rem; border:1px solid var(--border); padding:1.1rem; display:flex; flex-direction:column; gap:0.3rem; }
  .adm-input{ width:100%; border:2px solid var(--border); border-radius:.75rem; padding:.6rem 1rem; font-size:.875rem; outline:none; transition:border-color .2s; background:rgba(255,255,255,.07); color:var(--text-main); }
  .adm-input::placeholder{ color:var(--text-dim); }
  .adm-input:focus{ border-color:var(--red-light); }
  .adm-inp-sm{ border:2px solid var(--border); border-radius:.5rem; padding:.35rem .6rem; font-size:.82rem; outline:none; transition:border-color .2s; background:rgba(255,255,255,.07); color:var(--text-main); width:5.5rem; text-align:right; }
`

function AdminLogin({onLogin,onBack}) {
  const [user,setUser]=useState(""), [pass,setPass]=useState(""), [err,setErr]=useState(false)
  const handle=()=>{if(user===ADMIN_CONFIG.username&&pass===ADMIN_CONFIG.password){sessionStorage.setItem(ADMIN_CONFIG.sessionKey,"1");onLogin()}else{setErr(true);setPass("")}}
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--wood)",padding:"1rem"}}>
      <style>{globalStyles}</style>
      <div style={{background:"var(--wood-mid)",borderRadius:"1.25rem",padding:"2rem",width:"100%",maxWidth:"22rem",boxShadow:"0 8px 40px rgba(0,0,0,.5)",border:"1px solid var(--border)"}}>
        <div className="fd" style={{fontWeight:900,fontSize:"1.5rem",color:"var(--red-light)",textAlign:"center",marginBottom:"0.15rem"}}>⚙️ Admin</div>
        <p style={{textAlign:"center",fontSize:"0.8rem",color:"var(--text-dim)",marginBottom:"1.5rem"}}>La Bella Pizzaria</p>
        {err&&<div style={{background:"rgba(220,38,38,.15)",border:"1px solid rgba(220,38,38,.4)",borderRadius:"0.75rem",padding:"0.65rem",marginBottom:"1rem",fontSize:"0.82rem",color:"#f87171",textAlign:"center"}}>❌ Usuário ou senha incorretos</div>}
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <div><Lbl>Usuário</Lbl><input className="inp" type="text" value={user} onChange={e=>setUser(e.target.value)} placeholder="admin"/></div>
          <div><Lbl>Senha</Lbl><input className="inp" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handle()}/></div>
          <button onClick={handle} className="br" style={{width:"100%",padding:"0.75rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.9rem",marginTop:"0.25rem"}}>Entrar</button>
          <button onClick={onBack} style={{width:"100%",padding:"0.6rem",borderRadius:"0.75rem",fontWeight:700,fontSize:"0.85rem",background:"transparent",border:"none",color:"var(--text-dim)",cursor:"pointer"}}>← Voltar ao site</button>
        </div>
      </div>
    </div>
  )
}

function AdminOverview({orders}) {
  const today  = new Date().toDateString()
  const todayO = orders.filter(o=>new Date(o.date).toDateString()===today)
  const stats  = [
    {icon:"📦",label:"Pedidos Hoje",  value:todayO.length},
    {icon:"💰",label:"Receita Hoje*", value:brl(todayO.reduce((a,o)=>a+o.subtotal,0))},
    {icon:"📋",label:"Total Pedidos", value:orders.length},
    {icon:"💵",label:"Receita Total*",value:brl(orders.reduce((a,o)=>a+o.subtotal,0))},
  ]
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <h2 className="fd" style={{fontWeight:700,fontSize:"1.3rem",color:"var(--cream)"}}>📊 Visão Geral</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"0.75rem"}}>
        {stats.map((s,i)=>(
          <div key={i} className="adm-card">
            <span style={{fontSize:"1.4rem"}}>{s.icon}</span>
            <p style={{fontSize:"1.3rem",fontWeight:900,color:"var(--red-light)",lineHeight:1}}>{s.value}</p>
            <p style={{fontSize:"0.72rem",color:"var(--text-dim)"}}>{s.label}</p>
          </div>
        ))}
      </div>
      <p style={{fontSize:"0.72rem",color:"var(--text-dim)",fontStyle:"italic"}}>* Somente subtotal dos itens, sem frete.</p>
    </div>
  )
}

function AdminRanking({orders}) {
  const ranking = useMemo(()=>{
    const c={}
    orders.forEach(o=>o.items.forEach(it=>it.pizzaIds.forEach((id,idx)=>{
      const name=it.pizzaNames[idx]
      if(!c[id])c[id]={id,name,count:0}
      c[id].count+=it.type==="half"?it.quantity*0.5:it.quantity
    })))
    return Object.values(c).sort((a,b)=>b.count-a.count)
  },[orders])
  if(!ranking.length) return <div style={{textAlign:"center",padding:"3rem",color:"var(--text-dim)"}}><p style={{fontSize:"2rem",marginBottom:"0.5rem"}}>📊</p><p style={{fontWeight:700,color:"var(--cream)"}}>Nenhum pedido ainda</p></div>
  const max=ranking[0].count, medals=["🥇","🥈","🥉"]
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <h2 className="fd" style={{fontWeight:700,fontSize:"1.3rem",color:"var(--cream)"}}>🏆 Sabores Mais Pedidos</h2>
      <p style={{fontSize:"0.8rem",color:"var(--text-dim)"}}>Meio a meio conta 0,5 por metade. Novos sabores aparecem automaticamente.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
        {ranking.map((item,idx)=>{
          const pct=Math.round((item.count/max)*100)
          const countLabel=item.count%1===0?item.count:item.count.toFixed(1)
          return (
            <div key={item.id} className="adm-card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.4rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  <span>{medals[idx]??`${idx+1}º`}</span>
                  <span style={{fontWeight:700,fontSize:"0.9rem",color:"var(--cream)"}}>{item.name}</span>
                </div>
                <span style={{fontWeight:900,color:"var(--gold)",fontSize:"0.9rem"}}>{countLabel}×</span>
              </div>
              <div style={{height:"8px",background:"rgba(255,255,255,.1)",borderRadius:"4px",overflow:"hidden"}}>
                <div className="bar" style={{width:`${pct}%`}}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AdminHistory({orders, onDelete, onClear}) {
  const [confirmClear,setConfirmClear] = useState(false)
  const [confirmDelId,setConfirmDelId] = useState(null)
  if(!orders.length) return <div style={{textAlign:"center",padding:"3rem",color:"var(--text-dim)"}}><p style={{fontSize:"2rem",marginBottom:"0.5rem"}}>📋</p><p style={{fontWeight:700,color:"var(--cream)"}}>Nenhum pedido registrado</p></div>
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h2 className="fd" style={{fontWeight:700,fontSize:"1.3rem",color:"var(--cream)"}}>📋 Histórico</h2>
        {!confirmClear
          ?<button onClick={()=>setConfirmClear(true)} className="bdan" style={{padding:"0.4rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem",fontWeight:700}}>🗑 Limpar tudo</button>
          :<div style={{display:"flex",gap:"0.5rem"}}>
            <button onClick={()=>{onClear();setConfirmClear(false)}} className="bdan" style={{padding:"0.4rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem",fontWeight:700}}>Confirmar</button>
            <button onClick={()=>setConfirmClear(false)} className="bl" style={{padding:"0.4rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem",fontWeight:700}}>Cancelar</button>
          </div>
        }
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        {orders.map(o=>(
          <div key={o.id} className="adm-card" style={{border:`1px solid ${confirmDelId===o.id?"rgba(220,38,38,.5)":"var(--border)"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.35rem"}}>
              <div>
                <p style={{fontWeight:700,fontSize:"0.9rem",color:"var(--cream)"}}>{o.customerName}</p>
                <p style={{fontSize:"0.72rem",color:"var(--text-dim)"}}>{new Date(o.date).toLocaleString("pt-BR")}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                <span style={{fontWeight:900,color:"var(--gold)",fontSize:"0.9rem"}}>{brl(o.subtotal)}</span>
                {confirmDelId===o.id
                  ?<div style={{display:"flex",gap:"0.35rem"}}>
                    <button onClick={()=>{onDelete(o.id);setConfirmDelId(null)}} className="bdan" style={{padding:"0.25rem 0.6rem",borderRadius:"0.5rem",fontSize:"0.72rem",fontWeight:700}}>Remover</button>
                    <button onClick={()=>setConfirmDelId(null)} className="bl" style={{padding:"0.25rem 0.6rem",borderRadius:"0.5rem",fontSize:"0.72rem",fontWeight:700}}>Não</button>
                  </div>
                  :<button onClick={()=>setConfirmDelId(o.id)} style={{padding:"0.25rem 0.5rem",borderRadius:"0.5rem",background:"rgba(220,38,38,.15)",border:"1px solid rgba(220,38,38,.4)",color:"#f87171",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>✕ Cancelar</button>
                }
              </div>
            </div>
            <p style={{fontSize:"0.75rem",color:"var(--text-dim)",marginBottom:"0.5rem"}}>📍 {o.address}</p>
            <div style={{borderTop:"1px solid var(--border)",paddingTop:"0.5rem",display:"flex",flexDirection:"column",gap:"0.2rem"}}>
              {o.items.map((it,i)=><p key={i} style={{fontSize:"0.78rem",color:"var(--text-dim)"}}>{it.quantity}× {it.pizzaName} ({SZL[it.size]??it.size})</p>)}
            </div>
            <p style={{fontSize:"0.72rem",color:"var(--text-dim)",marginTop:"0.4rem"}}>💳 {o.payment} · + frete a confirmar</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminPrices({currentPrices, onSaved}) {
  const [draft,  setDraft]  = useState(()=>{
    const d = {}
    MENU_BASE.categories.forEach(cat=>cat.items.forEach(p=>{ d[p.id]={...p.sizes,...(currentPrices[p.id]||{})} }))
    return d
  })
  const [search, setSearch] = useState("")
  const [msg,    setMsg]    = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    setDraft(prev=>{
      const d = {}
      MENU_BASE.categories.forEach(cat=>cat.items.forEach(p=>{
        d[p.id] = { ...p.sizes, ...(currentPrices[p.id]||{}), ...prev[p.id] }
      }))
      return d
    })
  },[currentPrices])

  const allItems = MENU_BASE.categories.flatMap(cat=>cat.items.map(p=>({...p,catLabel:cat.label})))
  const filtered = search.trim() ? allItems.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())) : allItems

  const handleChange = (id,sk,val) => { const n=parseFloat(val); setDraft(d=>({...d,[id]:{...d[id],[sk]:isNaN(n)?d[id][sk]:n}})) }

  const handleSave = async () => {
    setSaving(true)
    const ov = {}
    MENU_BASE.categories.forEach(cat=>cat.items.forEach(p=>{
      const diff = {}
      Object.keys(p.sizes).forEach(k=>{ if(draft[p.id][k]!==p.sizes[k]) diff[k]=draft[p.id][k] })
      if(Object.keys(diff).length>0) ov[p.id] = diff
    }))
    try { await fbSavePrices(ov); setMsg("✅ Preços salvos e sincronizados!"); onSaved(ov) }
    catch(e) { setMsg("❌ Erro ao salvar. Verifique o Firebase."); console.error(e) }
    setSaving(false); setTimeout(()=>setMsg(""),3000)
  }

  const handleReset = async () => {
    setSaving(true)
    try {
      await fbSavePrices({})
      const d = {}
      MENU_BASE.categories.forEach(cat=>cat.items.forEach(p=>{ d[p.id]={...p.sizes} }))
      setDraft(d); setMsg("↩️ Preços restaurados ao padrão!"); onSaved({})
    } catch(e) { setMsg("❌ Erro ao restaurar.") }
    setSaving(false); setTimeout(()=>setMsg(""),3000)
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.5rem"}}>
        <h2 className="fd" style={{fontWeight:700,fontSize:"1.3rem",color:"var(--cream)"}}>💰 Editar Preços</h2>
        <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexWrap:"wrap"}}>
          {msg&&<span style={{fontSize:"0.82rem",fontWeight:700,color:"#4ade80"}}>{msg}</span>}
          <button onClick={handleReset} disabled={saving} className="bl" style={{padding:"0.4rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem",fontWeight:700}}>↩️ Restaurar padrão</button>
          <button onClick={handleSave} disabled={saving} className="bgreen" style={{padding:"0.4rem 0.85rem",borderRadius:"0.6rem",fontSize:"0.78rem",fontWeight:700}}>{saving?"Salvando…":"💾 Salvar"}</button>
        </div>
      </div>
      <p style={{fontSize:"0.8rem",color:"var(--text-dim)"}}>Edite os valores e clique em Salvar. Os novos preços ficam sincronizados em todos os dispositivos automaticamente. Itens com borda dourada foram editados.</p>
      <input className="inp" placeholder="🔍 Buscar pizza..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:"20rem"}}/>
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {filtered.map(p=>{
          const sizeKeys  = Object.keys(p.sizes)
          const hasOverride = sizeKeys.some(k=>draft[p.id]?.[k]!==p.sizes[k])
          return (
            <div key={p.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:"0.75rem",border:`1px solid ${hasOverride?"var(--gold)":"var(--border)"}`,padding:"0.75rem 1rem",display:"flex",alignItems:"center",gap:"0.75rem",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:"10rem"}}>
                <p style={{fontWeight:700,fontSize:"0.88rem",color:"var(--cream)"}}>{p.name}</p>
                <p style={{fontSize:"0.7rem",color:"var(--text-dim)"}}>{p.catLabel}{hasOverride?" · ✏️ editado":""}</p>
              </div>
              <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",alignItems:"center"}}>
                {sizeKeys.map(k=>(
                  <div key={k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem"}}>
                    <span style={{fontSize:"0.65rem",fontWeight:700,color:"var(--text-dim)",textTransform:"uppercase"}}>{SZL[k]||k}</span>
                    <div style={{display:"flex",alignItems:"center",gap:"0.25rem"}}>
                      <span style={{fontSize:"0.75rem",color:"var(--text-dim)"}}>R$</span>
                      <input type="number" className="inp-sm" value={draft[p.id]?.[k]??p.sizes[k]}
                        onChange={e=>handleChange(p.id,k,e.target.value)} step="0.5" min="0"
                        style={{borderColor:draft[p.id]?.[k]!==p.sizes[k]?"var(--gold)":"var(--border)"}}/>
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

function AdminPanel({onLogout, orders, prices, onOrdersChanged, onPricesChanged}) {
  const [tab,    setTab]    = useState("overview")
  const [loading,setLoading]= useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const [newOrders, newPrices] = await Promise.all([fbLoadOrders(), fbLoadPrices()])
      onOrdersChanged(newOrders); onPricesChanged(newPrices)
    } catch(e){ console.error(e) }
    setLoading(false)
  }

  const handleDelete = async id => { await fbDeleteOrder(id); onOrdersChanged(orders.filter(o=>o.id!==id)) }
  const handleClear  = async () => { await fbClearOrders(); onOrdersChanged([]) }
  const tabs = [{id:"overview",label:"📊 Visão Geral"},{id:"ranking",label:"🏆 Ranking"},{id:"prices",label:"💰 Preços"},{id:"history",label:"📋 Histórico"}]

  return (
    <div className="adm-wrap">
      <style>{globalStyles}</style>
      <style>{adminStyles}</style>
      {loading&&<LoadingBar/>}
      <div style={{background:"var(--wood-mid)",borderBottom:"1px solid var(--border)",padding:"0 1.25rem",height:"3.5rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <span className="fd" style={{fontWeight:900,color:"var(--red-light)",fontSize:"1.1rem"}}>⚙️ Admin</span>
          <span style={{fontSize:"0.75rem",color:"var(--text-dim)"}}>La Bella Pizzaria</span>
        </div>
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button onClick={refresh} style={{padding:"0.35rem 0.75rem",borderRadius:"0.6rem",border:"1px solid var(--border)",background:"transparent",fontSize:"0.75rem",fontWeight:700,color:"var(--text-dim)",cursor:"pointer"}}>🔄 Atualizar</button>
          <button onClick={()=>{sessionStorage.removeItem(ADMIN_CONFIG.sessionKey);onLogout()}} style={{padding:"0.35rem 0.75rem",borderRadius:"0.6rem",border:"none",background:"var(--surface-md)",fontSize:"0.75rem",fontWeight:700,color:"var(--text-dim)",cursor:"pointer"}}>Sair</button>
        </div>
      </div>
      <div className="noscroll" style={{background:"var(--wood-mid)",borderBottom:"1px solid var(--border)",padding:"0 1.25rem",display:"flex",gap:"0.1rem",overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"0.75rem 1rem",fontWeight:700,fontSize:"0.82rem",border:"none",background:"transparent",cursor:"pointer",borderBottom:`2px solid ${tab===t.id?"var(--red-light)":"transparent"}`,color:tab===t.id?"var(--cream)":"var(--text-dim)",transition:"all .2s",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{flex:1,padding:"1.25rem",maxWidth:"56rem",width:"100%",margin:"0 auto"}}>
        {tab==="overview" && <AdminOverview orders={orders}/>}
        {tab==="ranking"  && <AdminRanking  orders={orders}/>}
        {tab==="prices"   && <AdminPrices   currentPrices={prices} onSaved={onPricesChanged}/>}
        {tab==="history"  && <AdminHistory  orders={orders} onClear={handleClear} onDelete={handleDelete}/>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STORE VIEW
═══════════════════════════════════════════════════════════════ */
function StoreView({menu, onAdmin, onOrderSaved}) {
  const {addSingle} = useCart()
  const [halfOpen,  setHalfOpen]  = useState(false)
  const [halfInit,  setHalfInit]  = useState(null)
  const [sizeModal, setSizeModal] = useState({open:false,pizza:null})

  const handleAdd = useCallback((pizza)=>{
    const keys = Object.keys(pizza.sizes)
    if(keys.length===1&&keys[0]==="UN") addSingle(pizza,"UN",MENU_BASE.meta.borders[0])
    else setSizeModal({open:true,pizza})
  },[addSingle])

  const handleSizeConfirm = useCallback((size,border)=>{
    addSingle(sizeModal.pizza,size,border)
    setSizeModal({open:false,pizza:null})
  },[addSingle,sizeModal.pizza])

  const handleHalf = useCallback((pizza)=>{setHalfInit(pizza);setHalfOpen(true)},[])

  return (
    <div style={{minHeight:"100vh"}}>
      <style>{globalStyles}</style>
      <Header onAdmin={onAdmin}/>
      {/* HERO */}
      <section style={{paddingTop:"7rem",paddingBottom:"3rem",textAlign:"center",padding:"7rem 1.25rem 3rem",background:"linear-gradient(to bottom, rgba(91,26,10,0.3), transparent)"}}>
        <p style={{fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--gold)",marginBottom:"0.5rem"}}>Pindamonhangaba · Desde 2010</p>
        <h1 className="fd" style={{fontWeight:900,fontSize:"clamp(2rem,7vw,3.5rem)",lineHeight:1.15,color:"var(--cream)"}}>
          A autêntica pizza<br/><span style={{fontStyle:"italic",color:"var(--red-light)"}}>italiana de Pinda!</span>
        </h1>
        <p style={{color:"var(--text-dim)",fontSize:"0.9rem",maxWidth:"22rem",margin:"0.75rem auto 0"}}>Todos os dias · 18:00 às 23:30 · Delivery e retirada</p>
        <a href="#trad" className="br" style={{display:"inline-block",marginTop:"1.5rem",padding:"0.75rem 1.5rem",borderRadius:"1rem",fontWeight:700,fontSize:"0.9rem"}}>Ver Cardápio ↓</a>
      </section>
      {/* CARDÁPIO */}
      <main style={{maxWidth:"72rem",margin:"0 auto",padding:"2rem 1.25rem"}}>
        {menu.categories.map(cat=>(
          <section key={cat.id} id={cat.id} style={{marginBottom:"3rem",scrollMarginTop:"5rem"}}>
            <div style={{marginBottom:"1.25rem"}}>
              <h2 className="fd" style={{fontWeight:700,fontSize:"1.5rem",color:"var(--cream)"}}>{cat.label}</h2>
              <p style={{fontSize:"0.82rem",color:"var(--text-dim)",marginTop:"0.1rem"}}>{cat.desc}</p>
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
      {/* FOOTER */}
      <footer style={{background:"var(--wood-mid)",borderTop:"1px solid var(--border)",color:"var(--text-dim)",textAlign:"center",padding:"2.5rem 1.25rem",fontSize:"0.85rem"}}>
        <p className="fd" style={{color:"var(--cream)",fontWeight:900,fontSize:"1.2rem",marginBottom:"0.25rem"}}>
          <span style={{fontStyle:"italic"}}>La</span> <span style={{color:"var(--red-light)"}}>Bella</span> Pizzaria
        </p>
        <p>Pindamonhangaba, SP</p>
        <p style={{marginTop:"0.2rem"}}>(12) 99137-5580</p>
        <p style={{marginTop:"1.5rem",fontSize:"0.7rem",color:"var(--wood-light)"}}>© {new Date().getFullYear()} La Bella Pizzaria</p>
      </footer>
      <CartDrawer/>
      <HalfModal isOpen={halfOpen} onClose={()=>setHalfOpen(false)} initPizza={halfInit}/>
      <SizeModal pizza={sizeModal.pizza} isOpen={sizeModal.open} onClose={()=>setSizeModal({open:false,pizza:null})} onConfirm={handleSizeConfirm}/>
      <CheckoutModal onOrderSaved={onOrderSaved}/>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [view,    setView]    = useState(()=>isAdmin()?"admin":"store")
  const [prices,  setPrices]  = useState({})
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  const menu = useMemo(()=>applyPrices(MENU_BASE, prices), [prices])

  useEffect(()=>{
    let cancelled = false
    ;(async()=>{
      setLoading(true)
      try {
        const [p, o] = await Promise.all([fbLoadPrices(), fbLoadOrders()])
        if(!cancelled){ setPrices(p); setOrders(o) }
      } catch(e){ console.warn("Firebase offline:", e) }
      if(!cancelled) setLoading(false)
    })()
    return ()=>{ cancelled=true }
  },[])

  if(loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--wood)"}}>
      <style>{globalStyles}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:"3rem",height:"3rem",border:"4px solid var(--border)",borderTopColor:"var(--red-light)",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/>
        <p className="fd" style={{fontWeight:700,color:"var(--red-light)",fontSize:"1.1rem"}}>La Bella Pizzaria</p>
        <p style={{fontSize:"0.8rem",color:"var(--text-dim)",marginTop:"0.3rem"}}>Carregando cardápio…</p>
      </div>
    </div>
  )

  if(view==="adminLogin") return <AdminLogin onLogin={()=>setView("admin")} onBack={()=>setView("store")}/>

  if(view==="admin") return (
    <AdminPanel
      onLogout={()=>setView("store")}
      orders={orders}
      prices={prices}
      onOrdersChanged={setOrders}
      onPricesChanged={p=>{ setPrices(p) }}
    />
  )

  return (
    <CartProvider menu={menu}>
      <StoreView
        menu={menu}
        onAdmin={()=>setView("adminLogin")}
        onOrderSaved={async()=>{ try{ const o=await fbLoadOrders(); setOrders(o) }catch{} }}
      />
    </CartProvider>
  )
}
