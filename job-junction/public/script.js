/* Lightweight client JS to power pages.
   Works with endpoints:
   GET /jobs
   POST /register
   POST /login
   POST /apply
*/
const apiRoot = '';

/* helper for DOM */
const qs = s => document.querySelector(s);
const qsa = s => (document.querySelectorAll(s) || []);

/* ---------- featured on index ---------- */
async function loadFeatured(){
  const box = qs('#featured-list');
  if(!box) return;
  try{
    const res = await fetch(`${apiRoot}/jobs`);
    const jobs = await res.json();
    box.innerHTML = jobs.slice(0,3).map(j => `
      <div class="card">
        <h4>${escapeHtml(j.title)}</h4>
        <div class="meta">${escapeHtml(j.company)} · ${escapeHtml(j.location)}</div>
        <p>${escapeHtml(truncate(j.description,100))}</p>
        <div style="margin-top:10px"><a class="btn ghost" href="/job-details.html?id=${j.id}">View</a></div>
      </div>`).join('');
  }catch(e){ box.innerHTML = '<div class="card">Unable to load jobs</div>'; }
}
loadFeatured();

/* ---------- jobs page ---------- */
async function loadJobs(q){
  const list = qs('#jobs-list');
  if(!list) return;
  list.innerHTML = '<div>Loading…</div>';
  try{
    const res = await fetch(`${apiRoot}/jobs`);
    const jobs = await res.json();
    const filtered = q ? jobs.filter(j => (j.title+ j.company + j.location).toLowerCase().includes(q.toLowerCase())) : jobs;
    if(filtered.length===0) list.innerHTML = '<div>No jobs found</div>';
    else list.innerHTML = filtered.map(j => `
      <div class="job">
        <h4>${escapeHtml(j.title)}</h4>
        <div class="meta">${escapeHtml(j.company)} • ${escapeHtml(j.location)}</div>
        <p>${escapeHtml(truncate(j.description,180))}</p>
        <div class="apply">
          <a class="btn" href="/job-details.html?id=${j.id}">Details</a>
        </div>
      </div>`).join('');
  }catch(err){ list.innerHTML = '<div>Error loading jobs</div>'; }
}
if(qs('#searchBtn')){
  qs('#searchBtn').addEventListener('click',()=> loadJobs(qs('#q').value));
  loadJobs();
}

/* ---------- job details page ---------- */
async function loadJobDetails(){
  const el = qs('#job-detail');
  if(!el) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) { el.innerHTML = '<p>No job id</p>'; return; }
  try{
    const res = await fetch(`${apiRoot}/jobs`);
    const jobs = await res.json();
    const job = jobs.find(x=>String(x.id)===String(id));
    if(!job) { el.innerHTML = '<p>Job not found</p>'; return; }
    el.innerHTML = `
      <div class="job-detail">
        <h2>${escapeHtml(job.title)}</h2>
        <div class="meta">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</div>
        <p>${escapeHtml(job.description)}</p>
        <div style="margin-top:12px">
          <label>User ID to apply (enter your user id):</label>
          <input id="applyUserId" placeholder="1" />
          <button id="applyBtn" class="btn primary">Apply</button>
          <p id="applyMsg" class="msg"></p>
        </div>
      </div>`;
    qs('#applyBtn').addEventListener('click', async ()=>{
      const uid = qs('#applyUserId').value.trim();
      if(!uid){ qs('#applyMsg').textContent='Enter user id to apply'; return; }
      try{
        const r = await fetch(`${apiRoot}/apply`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({user_id:uid, job_id: job.id})});
        const j = await r.json();
        if(r.ok) qs('#applyMsg').textContent='Applied successfully!';
        else qs('#applyMsg').textContent = j.error || j.message || 'Failed';
      }catch(e){ qs('#applyMsg').textContent='Network error'; }
    });
  }catch(e){ el.innerHTML = '<p>Failed to load job</p>'; }
}
loadJobDetails();

/* ---------- auth pages ---------- */
const regForm = qs('#registerForm');
if(regForm){
  regForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const data = { name: regForm.name.value.trim(), email: regForm.email.value.trim(), password: regForm.password.value };
    try{
      const res = await fetch('/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
      const j = await res.json();
      if(res.ok) qs('#regMsg').textContent='Account created. You can login.';
      else qs('#regMsg').textContent = j.error || j.message || 'Error';
    }catch(err){ qs('#regMsg').textContent='Network error'; }
  });
}

const loginForm = qs('#loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const data = { email: loginForm.email.value.trim(), password: loginForm.password.value };
    try{
      const res = await fetch('/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
      const j = await res.json();
      if(res.ok){ qs('#loginMsg').textContent='Login successful'; localStorage.setItem('jobj_user', JSON.stringify(j.user)); setTimeout(()=> location.href='/jobs.html',600);}
      else qs('#loginMsg').textContent = j.error || j.message || 'Invalid credentials';
    }catch(err){ qs('#loginMsg').textContent='Network error'; }
  });
}

/* ---------- small helpers ---------- */
function truncate(s,n=120){ if(!s) return ''; return s.length>n ? s.slice(0,n)+'...' : s; }
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));}

/* ---------- mobile nav ---------- */
const hamb = qs('.hamburger');
if(hamb){
  hamb.addEventListener('click', ()=> {
    const nav = document.querySelector('.nav-links');
    if(nav.style.display==='flex') nav.style.display='none'; else nav.style.display='flex';
  });
}
