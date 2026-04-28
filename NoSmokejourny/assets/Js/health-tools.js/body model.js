'use strict';

/* ────── AUTH ────── */
const Auth = (() => {
  const K = {t:'jwt_token',u:'user_id',n:'user_name'};
  const tok  = () => localStorage.getItem(K.t);
  const name = () => localStorage.getItem(K.n)||'';
  function sync(){
    const g=document.getElementById('nav-auth-guest');
    const u=document.getElementById('nav-auth-user');
    const i=document.getElementById('user-profile-icon');
    if(!g||!u) return;
    if(tok()){g.style.display='none';u.style.display='block';if(i&&name())i.title=`Hello, ${name()} 👋`}
    else{g.style.display='block';u.style.display='none'}
  }
  function logout(){Object.values(K).forEach(k=>localStorage.removeItem(k));location.href='index.html'}
  return {sync,logout};
})();

/* ────── ORGAN DATA ──────
   Each hotspot position is % of the actual image:
   Image = 350 × 904 px
   
   Precise pixel centers measured from image:
   brain(175,55) lungs(185,235) heart(148,215) liver(143,308)
   stomach(192,315) kidneys(175,378) intestines(175,455)
   bladder(175,528) muscles(118,575) blood(270,328) bones(225,650)
──────────────────────────── */
const ORGANS = [
  {
    id:'brain', name:'Brain', icon:'🧠', sub:'Neurological & Cognitive Effects',
    hs:{l:'50.00%', t:'6.08%'},
    smoking:{
      stat:'30%', statDesc:'higher stroke risk vs. non-smokers',
      warn:'Nicotine and carbon monoxide damage cerebral blood vessels, raising the risk of blockages and brain haemorrhage.',
      fx:['Narrows cerebral arteries, reducing oxygen to brain tissue',
          'Accelerates carotid atherosclerosis over time',
          'Elevated blood pressure damages the blood-brain barrier',
          'Significantly higher risk of dementia and cognitive decline',
          'Disrupts dopamine pathways — reinforcing addiction and mood swings']
    },
    vaping:{
      warn:'High-dose nicotine from vaping poses serious neurological risks, especially for developing brains.',
      fx:['High-concentration nicotine can trigger seizures in some users',
          'Adolescent vaping impairs prefrontal cortex development',
          'Rewires reward pathways similarly to other substance addictions',
          'Concentration and memory difficulties during withdrawal cycles']
    },
    rec:[{t:'20 min',  d:'Blood pressure and heart rate begin to normalise'},
         {t:'8 hours', d:'Nicotine and CO levels in blood halve'},
         {t:'2 weeks', d:'Cerebral circulation measurably improves'},
         {t:'5 years', d:'Stroke risk reduces to roughly that of a non-smoker'}]
  },
  {
    id:'heart', name:'Heart & Blood', icon:'❤️', sub:'Cardiovascular System',
    hs:{l:'42.29%', t:'23.78%'},
    smoking:{
      stat:'2×', statDesc:'risk of coronary heart disease and heart attack',
      warn:'Even second-hand smoke significantly raises cardiovascular risk.',
      fx:['Nicotine triggers adrenaline raising heart rate and blood pressure immediately',
          'Carbon monoxide reduces oxygen delivery to the heart muscle',
          'Accelerates atherosclerosis — plaque build-up in coronary arteries',
          'Increases platelet stickiness, raising clot and heart attack risk',
          'Lowers HDL (good) cholesterol while raising LDL and triglycerides']
    },
    vaping:{
      warn:'Nicotine from vaping exerts the same acute cardiovascular stress as cigarettes.',
      fx:['Raises resting heart rate and blood pressure with every session',
          'Associated with increased risk of arrhythmias (irregular heartbeat)',
          'Aerosol chemicals cause oxidative stress in coronary artery endothelium',
          'Studies link regular vaping to elevated myocardial infarction risk']
    },
    rec:[{t:'20 min',   d:'Blood pressure and pulse return to normal'},
         {t:'24 hours', d:'Risk of heart attack begins decreasing'},
         {t:'1 year',   d:'Risk of coronary heart disease is halved'},
         {t:'15 years', d:'Heart disease risk equals that of a lifelong non-smoker'}]
  },
  {
    id:'lungs', name:'Lungs', icon:'🫁', sub:'Respiratory System',
    hs:{l:'52.86%', t:'26.00%'},
    smoking:{
      stat:'85%', statDesc:'of lung cancer cases directly linked to smoking',
      warn:'COPD caused by smoking is irreversible — damage accumulates silently over years before symptoms appear.',
      fx:['Destroys alveoli (air sacs), causing emphysema and permanently reduced capacity',
          'Kills cilia — airway filters — allowing toxins and bacteria to accumulate',
          'Chronic bronchitis: persistent cough, mucus overproduction, recurrent infections',
          '15× higher risk of lung cancer vs. non-smokers',
          'Weakens immune response in lung tissue; triggers and worsens asthma attacks']
    },
    vaping:{
      warn:'Vaping-Associated Lung Injury (EVALI) has been reported in hundreds of cases globally.',
      fx:['Vitamin E acetate in some products causes severe inflammatory lung injury (EVALI)',
          'Ultrafine particles penetrate deep into alveoli causing lasting inflammation',
          'Impairs innate immune function in lung tissue similar to cigarette smoke',
          'Increased risk of chronic obstructive airway disease with prolonged use']
    },
    rec:[{t:'72 hours', d:'Cilia begin regrowing; breathing becomes easier'},
         {t:'1 month',  d:'Lung function measurably improves'},
         {t:'9 months', d:'Chronic cough and shortness of breath reduce significantly'},
         {t:'10 years', d:'Lung cancer risk drops to half that of a continuing smoker'}]
  },
  {
    id:'liver', name:'Liver', icon:'🫀', sub:'Hepatic System',
    hs:{l:'40.86%', t:'34.07%'},
    smoking:{
      stat:'1.5×', statDesc:'higher risk of liver cancer in smokers',
      warn:'Smoking impairs the liver\'s ability to detoxify chemicals and worsens existing liver conditions.',
      fx:['Promotes non-alcoholic fatty liver disease progression',
          'Reduces efficacy of liver medications through enzyme interference',
          'Increases risk of primary liver cancer and bile duct cancer',
          'Exacerbates hepatitis and cirrhosis outcomes significantly']
    },
    vaping:{
      warn:'Emerging evidence links vaping-related chemicals to hepatic stress.',
      fx:['Aerosol compounds including acrolein stress liver detoxification pathways',
          'May worsen pre-existing liver conditions with chronic use',
          'Animal studies show hepatotoxic effects; human long-term data still emerging']
    },
    rec:[{t:'1 month',  d:'Liver enzyme levels begin normalising'},
         {t:'3 months', d:'Detoxification function improves measurably'},
         {t:'1 year',   d:'Liver cancer risk begins declining'},
         {t:'5 years',  d:'Risk approaches that of a non-smoker'}]
  },
  {
    id:'stomach', name:'Stomach', icon:'🫃', sub:'Gastric & Digestive System',
    hs:{l:'54.86%', t:'34.85%'},
    smoking:{
      stat:'2×', statDesc:'higher risk of stomach ulcers and stomach cancer',
      warn:'Smoking weakens the oesophageal sphincter, worsening acid reflux and masking serious conditions.',
      fx:['Reduces protective mucus lining, making stomach vulnerable to acid erosion',
          'Significantly worsens gastro-oesophageal reflux disease (GORD)',
          'Slows bowel motility causing constipation and bloating',
          'Increased risk of Crohn\'s disease flares and colorectal cancer',
          'Impairs pancreatic enzyme function; increases pancreatitis risk']
    },
    vaping:{
      warn:'Nicotine directly affects gut motility and can trigger nausea and cramping.',
      fx:['Nausea and vomiting common, especially with high-nicotine products',
          'Aerosol chemicals irritate oesophageal lining when inhaled',
          'May worsen existing IBS or acid reflux symptoms']
    },
    rec:[{t:'1 month',  d:'Gastric mucosa begins healing; acid levels normalise'},
         {t:'3 months', d:'Bowel regularity and gut motility improve'},
         {t:'5 years',  d:'Stomach cancer risk approaches that of a non-smoker'},
         {t:'10 years', d:'Colorectal cancer risk significantly reduced'}]
  },
  {
    id:'kidneys', name:'Kidneys', icon:'🩺', sub:'Renal System',
    hs:{l:'50.00%', t:'41.81%'},
    smoking:{
      stat:'50%', statDesc:'higher risk of kidney cancer in long-term smokers',
      warn:'Smoking accelerates chronic kidney disease progression and doubles dialysis risk.',
      fx:['Reduces renal blood flow through persistent vasoconstriction',
          'Accelerates decline in glomerular filtration rate (kidney function)',
          'Increases proteinuria — an early marker of kidney damage',
          'Significantly raises the risk of renal cell carcinoma']
    },
    vaping:{
      warn:'Nicotine constricts renal blood vessels and may impair kidney function over time.',
      fx:['Nicotine reduces renal perfusion similar to cigarette smoking',
          'Heavy metals in some vaping products may accumulate in renal tissue',
          'Long-term effects on kidneys are still being actively studied']
    },
    rec:[{t:'3 months', d:'Renal blood flow begins improving'},
         {t:'6 months', d:'Proteinuria may reduce in early-stage disease'},
         {t:'5 years',  d:'Kidney cancer risk reduces significantly'},
         {t:'10 years', d:'Risk approaches that of a non-smoker'}]
  },
  {
    id:'intestines', name:'Intestines', icon:'🔄', sub:'Lower Digestive System',
    hs:{l:'50.00%', t:'50.33%'},
    smoking:{
      stat:'2×', statDesc:'increased risk of colorectal cancer in smokers',
      warn:'Smoking is a leading modifiable risk factor for inflammatory bowel disease.',
      fx:['Reduces blood supply to intestinal walls through vasoconstriction',
          'Alters intestinal microbiome, increasing pathogenic bacteria',
          'Triggers and worsens Crohn\'s disease flares significantly',
          'Associated with increased polyp formation and colorectal cancer risk']
    },
    vaping:{
      warn:'Nicotine affects gut motility, causing significant digestive disruption.',
      fx:['Alters gut transit time causing irregular bowel movements',
          'Nausea and cramping common with high-concentration nicotine',
          'May affect intestinal microbiome balance with chronic use']
    },
    rec:[{t:'1 month',  d:'Gut motility begins to normalise'},
         {t:'3 months', d:'Intestinal blood supply improves'},
         {t:'5 years',  d:'Colorectal cancer risk substantially reduced'},
         {t:'10 years', d:'Gut health comparable to a non-smoker'}]
  },
  {
    id:'bladder', name:'Bladder', icon:'💧', sub:'Urinary System',
    hs:{l:'50.00%', t:'58.41%'},
    smoking:{
      stat:'3×', statDesc:'higher risk of bladder cancer in smokers',
      warn:'The bladder concentrates excreted tobacco carcinogens — making it highly vulnerable to cancer.',
      fx:['Tobacco carcinogens concentrate in urine and repeatedly damage the bladder lining',
          'Bladder cancer risk is proportional to smoking duration and pack-years',
          'Impairs bladder muscle function causing urgency and incontinence',
          'Increases risk of urinary tract infections through immune suppression']
    },
    vaping:{
      warn:'Nitrosamines and other vaping aerosol carcinogens are excreted through the urinary system.',
      fx:['Carcinogenic compounds in aerosol are filtered through the bladder',
          'May irritate bladder lining with chronic use',
          'Risk of bladder malignancy from vaping is still being studied']
    },
    rec:[{t:'1 month',  d:'Urine carcinogen levels begin to decrease'},
         {t:'1 year',   d:'Bladder cancer risk starts declining noticeably'},
         {t:'5 years',  d:'Bladder cancer risk reduced by approximately 50%'},
         {t:'10 years', d:'Risk approaches that of a non-smoker'}]
  },
  {
    id:'muscles', name:'Muscles & Bones', icon:'💪', sub:'Musculoskeletal System',
    hs:{l:'33.71%', t:'63.61%'},
    smoking:{
      stat:'40%', statDesc:'lower bone density — dramatically increasing fracture risk',
      warn:'Smokers take 80% longer to heal from bone fractures and have much higher surgical complication rates.',
      fx:['Reduces blood supply to muscles causing fatigue and exercise pain',
          'Decreases bone density, leading to early osteoporosis',
          'Inhibits calcium absorption, weakening skeletal structure',
          'Impairs muscle recovery and growth after physical activity',
          'Dramatically slows healing of fractures and sports injuries']
    },
    vaping:{
      warn:'Nicotine impairs bone cell (osteoblast) function, reducing bone formation.',
      fx:['Nicotine reduces osteoblast activity and bone repair capability',
          'May worsen recovery time from musculoskeletal injuries',
          'Some aerosol metals may accumulate in bone tissue over time']
    },
    rec:[{t:'2 weeks',  d:'Muscle blood flow begins improving'},
         {t:'3 months', d:'Exercise tolerance increases; fatigue reduces'},
         {t:'1 year',   d:'Bone density loss stabilises and may reverse'},
         {t:'5 years',  d:'Fracture risk and bone health significantly improved'}]
  },
  {
    id:'blood', name:'Blood Vessels', icon:'🩸', sub:'Circulatory & Vascular System',
    hs:{l:'77.14%', t:'36.28%'},
    smoking:{
      stat:'3×', statDesc:'higher risk of DVT and dangerous blood clots',
      warn:'Carbon monoxide permanently reduces the blood\'s oxygen-carrying capacity after every cigarette.',
      fx:['CO binds haemoglobin 200× more readily than oxygen, starving tissues',
          'Increases blood viscosity (thickness), promoting dangerous clots',
          'Raises fibrinogen levels — a major clotting and stroke risk factor',
          'Constricts blood vessels throughout the body, raising blood pressure',
          'Damages vessel walls, triggering chronic inflammatory processes']
    },
    vaping:{
      warn:'Nicotine and vaping aerosols exert direct toxic effects on blood vessel walls.',
      fx:['Nicotine increases platelet aggregation, raising clotting risk',
          'Aerosol chemicals trigger oxidative stress in vascular endothelium',
          'Associated with elevated inflammatory markers in the bloodstream']
    },
    rec:[{t:'8 hours',  d:'CO levels halve; blood oxygen begins rising'},
         {t:'24 hours', d:'CO cleared; blood viscosity starts normalising'},
         {t:'3 months', d:'Blood pressure and circulation significantly improved'},
         {t:'1 year',   d:'Clotting risk substantially reduced'}]
  },
  {
    id:'bones', name:'Legs & Circulation', icon:'🦴', sub:'Peripheral Vascular & Skeletal',
    hs:{l:'64.29%', t:'71.90%'},
    smoking:{
      stat:'16×', statDesc:'higher risk of peripheral artery disease (PAD)',
      warn:'Severe PAD can lead to critical limb ischaemia, non-healing ulcers and amputation.',
      fx:['Arterial narrowing drastically reduces blood flow causing walking pain (claudication)',
          'Dramatically slows healing of leg wounds, sores and ulcers',
          'Raises risk of deep vein thrombosis (DVT) and pulmonary embolism',
          'Cold, discoloured toes and feet from restricted peripheral circulation',
          'Increases fracture risk through reduced bone density and poor healing']
    },
    vaping:{
      warn:'Nicotine causes peripheral vasoconstriction with every single vaping session.',
      fx:['Persistent vasoconstriction reduces blood flow to extremities',
          'Users report cold legs, feet and numbness after heavy use',
          'May worsen existing conditions such as Raynaud\'s phenomenon']
    },
    rec:[{t:'2 weeks',  d:'Peripheral circulation begins to improve'},
         {t:'3 months', d:'Walking pain reduces; exercise tolerance increases'},
         {t:'1 year',   d:'PAD risk and leg ulcer healing substantially improved'},
         {t:'5 years',  d:'Risk of peripheral arterial complications significantly reduced'}]
  }
];

/* ────── STATE ────── */
let filter    = 'smoking';
let activeId  = null;

/* ────── BUILD HOTSPOTS ────── */
function buildDots(){
  const wrap = document.getElementById('body-wrap');
  if(!wrap) return;
  ORGANS.forEach(o=>{
    const btn = document.createElement('button');
    btn.className = 'hs';
    btn.id = 'hs-'+o.id;
    btn.setAttribute('aria-label', o.name);
    btn.style.left = o.hs.l;
    btn.style.top  = o.hs.t;
    // icon
    const ic = document.createElement('span');
    ic.className = 'hs-icon';
    btn.appendChild(ic);
    // tooltip
    const tip = document.createElement('span');
    tip.className = 'hs-tip';
    tip.textContent = o.name;
    btn.appendChild(tip);
    btn.addEventListener('click',()=>select(o.id));
    wrap.appendChild(btn);
  });
}

/* ────── SELECT ────── */
async function select(id){
  activeId = id;
  document.querySelectorAll('.hs').forEach(h=>h.classList.toggle('on',h.id==='hs-'+id));
  let o = ORGANS.find(x=>x.id===id);
  
  if(o) {
    // Try to fetch supplemental info from backend
    try {
        const educationalContent = await apiRequest(`/api/EducationalContent/organ/${id}`);
        if (educationalContent && educationalContent.length > 0) {
            console.log(`✅ Loaded supplemental info for ${id}`);
            // Merge or replace logic here if desired
            // For now, we'll just log it. We could add a "Learn More" section.
        }
    } catch (err) {
        console.warn(`Could not load supplemental info for ${id}`);
    }
    render(o);
  }
}

/* ────── RENDER CARD ────── */
function render(o){
  document.getElementById('i-empty').style.display='none';
  const card = document.getElementById('i-card');
  card.classList.add('on');
  card.style.animation='none'; void card.offsetHeight; card.style.animation='';

  document.getElementById('i-hdr-icon').textContent = o.icon;
  document.getElementById('i-hdr-name').textContent = o.name;
  document.getElementById('i-hdr-sub').textContent  = o.sub;

  const showS = filter==='smoking'||filter==='both';
  const showV = filter==='vaping' ||filter==='both';

  // Build tabs
  const tabsEl = document.getElementById('i-tabs');
  tabsEl.innerHTML='';
  const addTab=(id,lbl)=>{
    const b=document.createElement('button');
    b.className='i-tab'; b.dataset.tab=id; b.textContent=lbl;
    b.addEventListener('click',()=>switchTab(id));
    tabsEl.appendChild(b);
  };
  if(showS) addTab('smoking','🚬 Smoking');
  if(showV) addTab('vaping', '💨 Vaping');
  addTab('recovery','💚 Recovery');

  buildSmoke(o.smoking);
  buildVape(o.vaping);
  buildRec(o.rec);
  switchTab(showS?'smoking':'vaping');

  // Mobile scroll
  if(window.innerWidth<900) card.scrollIntoView({behavior:'smooth',block:'start'});
}

function switchTab(id){
  document.querySelectorAll('.i-tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===id));
  document.querySelectorAll('.i-pane').forEach(p=>p.classList.toggle('on',p.id==='pane-'+id));
}

function buildSmoke(d){
  document.getElementById('pane-smoking').innerHTML=`
    <div class="stat"><div class="stat-n">${d.stat}</div><div class="stat-d">${d.statDesc}</div></div>
    <div class="warn"><span class="warn-ico">⚠️</span><div class="warn-txt"><div class="warn-ttl">Clinical Warning</div>${d.warn}</div></div>
    <div class="fx-ttl">Health Effects</div>
    <ul class="fx-list">${d.fx.map(e=>`<li>${e}</li>`).join('')}</ul>`;
}
function buildVape(d){
  document.getElementById('pane-vaping').innerHTML=`
    <div class="vape-badge">💨 Vaping-Specific Risks</div>
    <div class="warn"><span class="warn-ico">⚠️</span><div class="warn-txt"><div class="warn-ttl">Vaping Warning</div>${d.warn}</div></div>
    <div class="fx-ttl">Vaping Effects</div>
    <ul class="fx-list">${d.fx.map(e=>`<li>${e}</li>`).join('')}</ul>`;
}
function buildRec(r){
  document.getElementById('pane-recovery').innerHTML=`
    <div class="fx-ttl" style="margin-bottom:.75rem">Recovery After Quitting</div>
    <div class="rec-list">${r.map(x=>`
      <div class="rec-row"><span class="rec-time">${x.t}</span><span>${x.d}</span></div>`).join('')}
    </div>`;
}

/* ────── FILTERS ────── */
function initFilters(){
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      filter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));
      if(activeId){ const o=ORGANS.find(x=>x.id===activeId); if(o) render(o); }
    });
  });
}

/* ────── BOOT ────── */
document.addEventListener('DOMContentLoaded',()=>{
  Auth.sync();
  const ll=document.getElementById('logout-link');
  if(ll) ll.addEventListener('click',e=>{e.preventDefault();Auth.logout();});
  buildDots();
  initFilters();
});