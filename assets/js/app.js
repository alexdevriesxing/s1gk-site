const $=(q,ctx=document)=>ctx.querySelector(q);const $$=(q,ctx=document)=>[...ctx.querySelectorAll(q)];
const state={products:[],kit:(()=>{try{return JSON.parse(localStorage.getItem('s1gk-kit')||'[]')}catch(e){return[]}})(),motion:!matchMedia('(prefers-reduced-motion: reduce)').matches};
const modeCopy={academy:{title:'Start here. Level up.',text:'Junior gloves, easy closures and training-ready essentials for young keepers.',href:'/levels/academy/'},match:{title:'Game day. Own it.',text:'Match gloves, long-sleeve jerseys and team-ready kit for weekly football.',href:'/levels/match/'},elite:{title:'No excuses. Just results.',text:'Padded protection, compression layers and premium accessories for high-intensity sessions.',href:'/levels/elite/'}};
const kitPresets={starter:{title:'Starter Keeper Kit',items:['Junior One Glove','Training Jersey SS','Grip Socks','Glove Bag'],total:'€136'},match:{title:'Matchday Keeper Kit',items:['Match Pro Glove','Match Jersey LS','Match Shorts','Grip Socks'],total:'€226'},elite:{title:'Elite Training Kit',items:['Training Grip Glove','Padded Pants','Compression Top','Compression Leggings','Keeper Backpack'],total:'€310'}};

function init(){
  hidePreloader();
  loadProducts();
  wireScroll();
  wireReveal();
  wireDrawers();
  wireSearchUI();
  wirePointer();
  wireTilt();
  wireButtons();
  wireModes();
  wireFinder();
  wireKit();
  wireCarousel();
  wireCounters();
  wireParticles();
  wireParallax();
  wireImageGlow();
  updateCartBadge();
  highlightActiveNav();
  setupModalAndForms();
  renderCartPage();
  setupFilterAndSort();
}

function hidePreloader(){window.addEventListener('load',()=>setTimeout(()=>$('#preloader')?.classList.add('done'),350));setTimeout(()=>$('#preloader')?.classList.add('done'),1600)}
function loadProducts(){
  fetch('/data/products.json')
    .then(r=>r.json())
    .then(data=>{
      state.products=data;
      wireSearch(data);
      renderCartPage();
      renderProductsGrid();
    })
    .catch(()=>{})
}
function wireScroll(){const progress=$('.progress'),sticky=$('.sticky-cta'),header=$('.site-header');const onScroll=()=>{const h=document.documentElement;const p=h.scrollTop/(h.scrollHeight-h.clientHeight);if(progress)progress.style.width=(p*100)+'%'; if(sticky)sticky.classList.toggle('show',h.scrollTop>680); if(header)header.classList.toggle('scrolled',h.scrollTop>40)};document.addEventListener('scroll',onScroll,{passive:true});onScroll()}
function wireReveal(){if(!('IntersectionObserver'in window)){return $$('.reveal').forEach(el=>el.classList.add('in'))}const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -60px 0px'});$$('.reveal').forEach((el,i)=>{el.style.transitionDelay=Math.min(i%6*60,300)+'ms';io.observe(el)})}
function lockBody(v){document.body.classList.toggle('no-scroll',v)}
function wireDrawers(){const drawer=$('.mobile-drawer'),search=$('.search-drawer');$('#menuBtn')?.addEventListener('click',()=>{drawer?.classList.add('active');drawer?.setAttribute('aria-hidden','false');lockBody(true)});$('#searchBtn')?.addEventListener('click',()=>{search?.classList.add('active');search?.setAttribute('aria-hidden','false');lockBody(true);setTimeout(()=>$('#siteSearch')?.focus(),120)});$$('[data-close]').forEach(b=>b.addEventListener('click',()=>{$$('.mobile-drawer,.search-drawer').forEach(d=>{d.classList.remove('active');d.setAttribute('aria-hidden','true')});lockBody(false)}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){$$('[data-close]')[0]?.click()}})}
function wireSearchUI(){ $('#openFinder')?.addEventListener('click',()=>document.querySelector('.lab-section')?.scrollIntoView({behavior:'smooth'})); }
function wireSearch(products){const input=$('#siteSearch'),results=$('#searchResults');if(!input||!results)return;input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();if(!q){results.innerHTML='';return}const hits=products.filter(p=>(p.name+' '+p.category+' '+p.tier+' '+p.description+' '+p.keywords.join(' ')+' '+p.features.join(' ')).toLowerCase().includes(q)).slice(0,8);results.innerHTML=hits.map(p=>`<a class="search-hit" href="${p.slug}"><strong>${p.name}</strong><br><span>${p.tier} · ${p.category} · €${p.price}</span></a>`).join('')||'<p class="muted">No keeper gear found yet. Try gloves, junior, pants or match.</p>'})}
function wirePointer(){if(!state.motion)return;window.addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px')},{passive:true})}
function wireTilt(){if(!state.motion)return;$$('[data-tilt]').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width;const y=(e.clientY-r.top)/r.height;card.style.setProperty('--px',(x*100)+'%');card.style.setProperty('--py',(y*100)+'%');card.style.transform=`perspective(1000px) rotateX(${(0.5-y)*6}deg) rotateY(${(x-0.5)*8}deg) translateY(-8px)`});card.addEventListener('pointerleave',()=>{card.style.transform='';})})}
function wireButtons(){if(!state.motion)return;$$('.magnetic,.btn').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.10}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')})}
function wireModes(){const panel=$('#modePanel');$$('.mode').forEach(btn=>btn.addEventListener('click',()=>{$$('.mode').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const m=modeCopy[btn.dataset.mode];if(panel&&m){panel.animate([{opacity:.45,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});panel.innerHTML=`<h3>${m.title}</h3><p>${m.text}</p><a href="${m.href}">Explore ${btn.dataset.mode} →</a>`}}))}
function wireFinder(){const finder=$('#gloveFinder');if(!finder)return;finder.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(finder);const level=fd.get('level'),surface=fd.get('surface'),age=fd.get('age');let title='Training Grip Glove',url='/products/training-grip-glove/',img='/assets/img/products/training-glove.webp',why='built for repetition, daily training and durability.';if(age==='junior'||level==='beginner'){title='Junior One Glove';url='/products/junior-one-glove/';img='/assets/img/products/junior-glove.webp';why='best for younger keepers building confidence and technique.'}if(level==='match'||surface==='matchday'){title='Match Pro Glove';url='/products/match-pro-glove/';img='/assets/img/products/match-pro-glove.webp';why='the best fit for game-day grip and control.'}$('#labImage')?.setAttribute('src',img);$('#finderResult').innerHTML=`<div class="answer-card"><span class="kicker">Keeper Match</span><h3>${title}</h3><p>Start with the ${title}: ${why}</p><a class="btn btn-primary" href="${url}">View ${title} →</a></div>`;toast(`${title} unlocked`)})}
function wireKit(){
  const list=$('#kitList'),title=$('#kitTitle'),total=$('#kitTotal');
  $$('[data-kit]').forEach(chip=>chip.addEventListener('click',()=>{
    $$('[data-kit]').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    const k=kitPresets[chip.dataset.kit];
    if(!k)return;
    title.textContent=k.title;
    list.innerHTML=k.items.map(i=>`<li>${i}</li>`).join('');
    total.textContent=k.total;
    toast(`${k.title} loaded`)
  }));
  // Bind dynamic add-to-kit buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    const item={id:btn.dataset.add,name:btn.dataset.name,price:btn.dataset.price};
    state.kit.push(item);
    localStorage.setItem('s1gk-kit',JSON.stringify(state.kit));
    updateCartBadge();
    toast(`${item.name} added to kit`);
    burst(btn);
    renderCartPage();
  });
}
function updateCartBadge(){const b=$('#cartBadge');if(b)b.textContent=state.kit.length}
function toast(text){const holder=$('#toast');if(!holder)return;const el=document.createElement('div');el.className='toast-msg';el.textContent=text;holder.appendChild(el);setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(10px)';setTimeout(()=>el.remove(),250)},2300)}
function burst(origin){if(!state.motion)return;const r=origin.getBoundingClientRect();for(let i=0;i<14;i++){const s=document.createElement('i');s.className='confetti';s.style.left=(r.left+r.width/2)+'px';s.style.top=(r.top+r.height/2)+'px';s.style.setProperty('--dx',((Math.random()-.5)*220)+'px');s.style.setProperty('--dy',(-80-Math.random()*140)+'px');s.style.background=i%3?'var(--green)':'#fff';document.body.appendChild(s);setTimeout(()=>s.remove(),850)}}
function wireCarousel(){const carousel=$('#productCarousel');$$('[data-slide]').forEach(btn=>btn.addEventListener('click',()=>{if(!carousel)return;carousel.scrollBy({left:(btn.dataset.slide==='next'?1:-1)*310,behavior:'smooth'})}))}
function wireCounters(){if(!('IntersectionObserver'in window))return;const countIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;const max=Number(el.dataset.count||0);let n=0;const step=()=>{n+=Math.max(1,Math.ceil(max/42));if(n>max)n=max;el.textContent=n.toLocaleString();if(n<max)requestAnimationFrame(step)};step();countIO.unobserve(el)}),{threshold:.5});$$('[data-count]').forEach(el=>countIO.observe(el))}
function wireParticles(){const canvas=$('#particleNet');if(!canvas||!state.motion)return;const ctx=canvas.getContext('2d');let w,h,dpr,pts=[];function resize(){dpr=Math.min(devicePixelRatio||1,2);w=canvas.width=innerWidth*dpr;h=canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';pts=Array.from({length:Math.min(70,Math.floor(innerWidth/22))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.18*dpr,vy:(Math.random()-.5)*.18*dpr,r:(Math.random()*1.8+0.6)*dpr}))}function draw(){ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(57,255,20,.42)';ctx.strokeStyle='rgba(57,255,20,.12)';ctx.lineWidth=1*dpr;for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<150*dpr){ctx.globalAlpha=1-d/(150*dpr);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.globalAlpha=1}}requestAnimationFrame(draw)}resize();addEventListener('resize',resize,{passive:true});draw()}
function wireParallax(){if(!state.motion)return;const hero=$('[data-parallax]');if(!hero)return;addEventListener('scroll',()=>{const y=scrollY;hero.style.setProperty('--parallax',Math.min(y*.12,80)+'px');const bg=$('.hero-bg img');if(bg)bg.style.transform=`translateY(${Math.min(y*.08,64)}px) scale(1.04)`},{passive:true})}
function wireImageGlow(){$$('img').forEach(img=>{if(img.complete)img.classList.add('loaded');img.addEventListener('load',()=>img.classList.add('loaded'))})}

function highlightActiveNav() {
  const path = window.location.pathname;
  $$('.nav-links a, .drawer-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (href !== '/' && path.startsWith(href) && href.length > 1)) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
}

function setupModalAndForms() {
  if (!$('#checkoutModal')) {
    const modalHtml = `
      <div id="checkoutModal" class="s1gk-modal" aria-hidden="true">
        <div class="modal-content">
          <button class="modal-close" id="closeModalBtn" aria-label="Close modal">&times;</button>
          <div id="modalFormBody">
            <h3>Secure Checkout</h3>
            <p style="color: var(--muted); margin-bottom: 1.5rem;">Enter your shipping details below. No payment card is needed for this demo order.</p>
            <form id="s1gkCheckoutForm" class="s1gk-form">
              <div class="s1gk-form-row">
                <div class="form-group">
                  <label for="cFirstName">First Name</label>
                  <input type="text" id="cFirstName" class="s1gk-input" required placeholder="John">
                </div>
                <div class="form-group">
                  <label for="cLastName">Last Name</label>
                  <input type="text" id="cLastName" class="s1gk-input" required placeholder="Doe">
                </div>
              </div>
              <div class="form-group">
                <label for="cEmail">Email Address</label>
                <input type="email" id="cEmail" class="s1gk-input" required placeholder="john@example.com">
              </div>
              <div class="form-group">
                <label for="cAddress">Shipping Address</label>
                <input type="text" id="cAddress" class="s1gk-input" required placeholder="123 Glove St, Box 1">
              </div>
              <div class="s1gk-form-row">
                <div class="form-group">
                  <label for="cCity">City</label>
                  <input type="text" id="cCity" class="s1gk-input" required placeholder="London">
                </div>
                <div class="form-group">
                  <label for="cZip">Postcode</label>
                  <input type="text" id="cZip" class="s1gk-input" required placeholder="SW1A 1AA">
                </div>
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem; width: 100%;">Complete Order</button>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  $('#closeModalBtn')?.addEventListener('click', () => {
    $('#checkoutModal')?.classList.remove('active');
    $('#checkoutModal')?.setAttribute('aria-hidden', 'true');
    lockBody(false);
  });

  $('#s1gkCheckoutForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const formBody = $('#modalFormBody');
    if (formBody) {
      formBody.innerHTML = `
        <div class="success-msg">
          <h4>Order Placed!</h4>
          <p style="margin-bottom: 1.5rem;">Thank you for your order. Your keeper gear is locked in.</p>
          <button type="button" class="btn btn-primary" id="successCloseBtn">Close</button>
        </div>
      `;
      state.kit = [];
      localStorage.removeItem('s1gk-kit');
      updateCartBadge();
      
      $('#successCloseBtn')?.addEventListener('click', () => {
        $('#checkoutModal')?.classList.remove('active');
        $('#checkoutModal')?.setAttribute('aria-hidden', 'true');
        lockBody(false);
        if (window.location.pathname.includes('/cart/')) {
          location.reload();
        }
      });
    }
  });

  document.addEventListener('submit', e => {
    const form = e.target;
    if (form.id === 's1gkCheckoutForm' || form.classList.contains('newsletter') || form.id === 'gloveFinder') return;
    e.preventDefault();
    form.innerHTML = `
      <div class="success-msg" style="padding: 1rem 0;">
        <h4 style="font-size: 1.4rem;">Success!</h4>
        <p>Your request has been received. Our team will get back to you shortly.</p>
      </div>
    `;
    toast('Request submitted successfully');
  });

  document.addEventListener('submit', e => {
    const form = e.target;
    if (!form.classList.contains('newsletter')) return;
    e.preventDefault();
    const input = $('input', form);
    if (input && input.value) {
      toast(`Subscribed: ${input.value}`);
      input.value = '';
    }
  });
}

function renderCartPage() {
  const container = $('#cartPageContainer');
  if (!container) return;

  if (state.kit.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state reveal in">
        <h3>Your cart is empty</h3>
        <p style="color: var(--muted); margin-bottom: 2rem;">Build your perfect goalkeeper setup by adding gloves, matchwear, and training accessories.</p>
        <a href="/gloves/" class="btn btn-primary">Shop Gloves</a>
        <a href="/products/" class="btn btn-secondary" style="margin-left: 0.5rem;">Browse All Gear</a>
      </div>
    `;
    return;
  }

  const counts = {};
  state.kit.forEach(item => {
    counts[item.id] = (counts[item.id] || 0) + 1;
  });

  const uniqueItems = [];
  const seen = new Set();
  state.kit.forEach(item => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      uniqueItems.push(item);
    }
  });

  const getProductInfo = (id) => {
    const p = state.products.find(prod => prod.id === id);
    if (p) return p;
    return {
      name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      price: "49.00",
      image: "/assets/img/brand/s1gk-tagline.png",
      category: "Gear"
    };
  };

  let subtotal = 0;
  const itemsHtml = uniqueItems.map(item => {
    const info = getProductInfo(item.id);
    const qty = counts[item.id];
    const priceNum = parseFloat(info.price || item.price || 49);
    const totalItemPrice = priceNum * qty;
    subtotal += totalItemPrice;

    return `
      <div class="cart-item-row reveal in" data-item-id="${item.id}">
        <img class="cart-item-img" src="${info.image}" alt="${info.name}">
        <div class="cart-item-details">
          <h4>${info.name}</h4>
          <p>${info.category} · €${priceNum.toFixed(2)}</p>
        </div>
        <div class="cart-qty-ctrl">
          <button class="cart-qty-btn qty-dec" data-id="${item.id}">-</button>
          <span class="cart-qty-val">${qty}</span>
          <button class="cart-qty-btn qty-inc" data-id="${item.id}">+</button>
        </div>
        <div class="cart-item-price">€${totalItemPrice.toFixed(2)}</div>
        <button class="cart-item-remove" data-remove-id="${item.id}" aria-label="Remove item">&times;</button>
      </div>
    `;
  }).join('');

  const shipping = 5.95;
  const grandTotal = subtotal + shipping;

  container.innerHTML = `
    <div class="cart-layout">
      <div>
        <h3 style="text-transform: uppercase; margin-bottom: 1.5rem; font-size: 1.5rem; border-bottom: 1px solid var(--line2); padding-bottom: 0.5rem;">Your Selection</h3>
        <div class="cart-items-list">
          ${itemsHtml}
        </div>
      </div>
      <div>
        <div class="cart-summary-box reveal in">
          <h3 style="margin-top: 0; margin-bottom: 1.5rem; border-bottom: 1px solid var(--line2); padding-bottom: 0.5rem;">Summary</h3>
          <div class="cart-summary-row">
            <span>Subtotal</span>
            <span>€${subtotal.toFixed(2)}</span>
          </div>
          <div class="cart-summary-row">
            <span>Shipping</span>
            <span>€${shipping.toFixed(2)}</span>
          </div>
          <div class="cart-summary-row total">
            <span>Total</span>
            <span>€${grandTotal.toFixed(2)}</span>
          </div>
          <button type="button" class="btn btn-primary" id="checkoutBtn" style="width: 100%; margin-top: 1rem;">Proceed to Checkout</button>
          <p style="font-size: 0.75rem; color: var(--muted); text-align: center; margin-top: 1rem; line-height: 1.4;">
            Free delivery on orders over €150. Easy returns within 30 days.
          </p>
        </div>
      </div>
    </div>
  `;

  $$('.qty-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const idx = state.kit.findIndex(item => item.id === id);
      if (idx !== -1) {
        state.kit.splice(idx, 1);
        localStorage.setItem('s1gk-kit', JSON.stringify(state.kit));
        updateCartBadge();
        renderCartPage();
      }
    });
  });

  $$('.qty-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const info = getProductInfo(id);
      state.kit.push({ id, name: info.name, price: info.price });
      localStorage.setItem('s1gk-kit', JSON.stringify(state.kit));
      updateCartBadge();
      renderCartPage();
    });
  });

  $$('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.removeId;
      state.kit = state.kit.filter(item => item.id !== id);
      localStorage.setItem('s1gk-kit', JSON.stringify(state.kit));
      updateCartBadge();
      renderCartPage();
    });
  });

  $('#checkoutBtn')?.addEventListener('click', () => {
    $('#checkoutModal')?.classList.add('active');
    $('#checkoutModal')?.setAttribute('aria-hidden', 'false');
    lockBody(true);
  });
}

// Products page filter state
let activeCategory = 'all';
let activeSort = 'default';

function setupFilterAndSort() {
  const tabs = $$('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.filter;
      renderProductsGrid();
    });
  });

  $('#sortSelect')?.addEventListener('change', e => {
    activeSort = e.target.value;
    renderProductsGrid();
  });
}

function renderProductsGrid() {
  const grid = $('#productsListGrid');
  if (!grid || state.products.length === 0) return;

  // Filter
  let filtered = [...state.products];
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === activeCategory);
  }

  // Sort
  if (activeSort === 'price-asc') {
    filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (activeSort === 'price-desc') {
    filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (activeSort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  grid.innerHTML = filtered.map(p => {
    return `
      <article class="product-card reveal in" data-tilt data-tier="${p.tier.toLowerCase()}" data-category="${p.category.toLowerCase()}">
        <a href="${p.slug}" aria-label="View ${p.name}">
          <span class="card-orbit" aria-hidden="true"></span>
          <figure><img src="${p.image}" alt="${p.name} product image" loading="lazy" width="520" height="380"></figure>
          <div class="product-meta">
            <span class="tag">${p.tier} · ${p.category}</span>
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <div class="quick"><span class="price">From €${parseFloat(p.price).toFixed(2)}</span><span class="arrow">↗</span></div>
          </div>
        </a>
        <button class="add-kit" data-add="${p.id}" data-name="${p.name}" data-price="${p.price}" type="button">Add to kit</button>
      </article>
    `;
  }).join('');

  // Re-wire tilt for new elements
  wireTilt();
}

document.addEventListener('DOMContentLoaded',init);
