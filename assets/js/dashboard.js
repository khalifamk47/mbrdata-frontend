import { APP_CONFIG } from './config.js';
import { api, clearSession, getSession, loadBrand, money, notify, requireAuth } from './api.js';

requireAuth(); loadBrand();
const { user } = getSession();
const name = user.username || user.name || 'User';
document.querySelector('#user-name').textContent = name;
document.querySelector('#avatar').textContent = name[0].toUpperCase();
const hour = new Date().getHours();
document.querySelector('#greeting').textContent = `${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, ${name}!`;
document.querySelector('#ref-link').value = `${location.origin}${location.pathname.replace(/dashboard\.html$/, '')}register.html?ref=${encodeURIComponent(user.username || '')}`;

const cashbackStat = document.querySelector('#earning-balance').closest('article');
cashbackStat.classList.add('clickable-stat'); cashbackStat.tabIndex = 0; cashbackStat.setAttribute('role', 'link');
cashbackStat.querySelector('small').textContent = 'Cashback Balance';
cashbackStat.insertAdjacentHTML('beforeend', '<i class="bi bi-chevron-right stat-arrow"></i>');
const openWithdrawal = () => location.href = './withdraw.html';
cashbackStat.addEventListener('click', openWithdrawal);
cashbackStat.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') openWithdrawal(); });

const services = [['wifi','Buy Data'],['telephone','Buy Airtime'],['tv','Cable TV'],['lightning-charge','Electricity'],['ticket-perforated','Exam Pins'],['emoji-smile','Smile Data'],['person-vcard','NIN Verify'],['fingerprint','BVN Verify'],['broadcast','Alpha Topup'],['router','Ratel Topup'],['telephone-outbound','Kirani Minutes']];
document.querySelector('#service-grid').innerHTML = services.map(([icon,label]) => `<a class="service" data-soon><i class="ico bi bi-${icon}"></i>${label}</a>`).join('');
const txStatus = (value) => { value=String(value??'').toLowerCase(); return ['1','success','successful'].includes(value)?['Successful','success']:['2','pending'].includes(value)?['Pending','pending']:['Failed','failed']; };
function renderTransactions(rows){document.querySelector('#transaction-list').innerHTML=rows.length?rows.map(t=>{const[s,c]=txStatus(t.status);return`<article class="transaction"><i class="ico bi bi-receipt"></i><div><h4>${String(t.service||t.network||t.type||'Transaction').toUpperCase()}</h4><p>${[t.mobile,t.plans,t.date].filter(Boolean).join(' · ')||'Transaction record'}</p></div><div class="amount">${money(t.amount)}<br><span class="status ${c}">${s}</span></div></article>`}).join(''):'<article class="transaction"><i class="ico bi bi-receipt"></i><div><h4>No transactions yet</h4><p>Your latest payments will appear here.</p></div></article>'}
function renderAccounts(data){const accounts=data.accounts||{},rows=[];if(accounts.palmpay)rows.push(['PALMPAY',accounts.palmpay]);if(accounts.paga)rows.push(['PAGA MFB',accounts.paga]);if(accounts.safehaven)rows.push(['SAFEHAVEN',accounts.safehaven]);if(accounts.fallback?.account_number)rows.push([accounts.fallback.bank_name||'BANK',accounts.fallback.account_number]);if(!rows.length)return;document.querySelector('#accounts').hidden=false;document.querySelector('#bank-tabs').innerHTML=rows.map((x,i)=>`<button class="tab ${i?'':'active'}" data-tab="${i}">${x[0]}</button>`).join('');document.querySelector('#bank-panels').innerHTML=rows.map((x,i)=>`<div class="bank" data-panel="${i}" ${i?'hidden':''}><small>Fund Wallet via ${x[0]}</small><div class="number">${x[1]}</div></div>`).join('');document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('[data-panel]').forEach(x=>x.hidden=true);button.classList.add('active');document.querySelector(`[data-panel="${button.dataset.tab}"]`).hidden=false})}
async function boot(){try{const[summary,transactions,accounts]=await Promise.all([api('/dashboard/summary'),api('/transactions?limit=5'),api('/virtual-accounts')]);document.querySelector('#wallet-balance').textContent=money(summary.wallet_balance??user.bal);document.querySelector('#earning-balance').textContent=money(summary.cashback??user.cashback);document.querySelector('#tx-count').textContent=summary.transactions?.total||0;renderTransactions(Array.isArray(transactions.transactions)?transactions.transactions:[]);renderAccounts(accounts)}catch(error){if(error.status===401){clearSession();location.replace(APP_CONFIG.LOGIN_PAGE)}else{notify(error.message,'error');renderTransactions([])}}}
document.querySelector('#logout').onclick=()=>{clearSession();location.replace(APP_CONFIG.LOGIN_PAGE)};document.querySelector('#menu').onclick=()=>document.body.classList.toggle('nav-open');document.querySelector('#scrim').onclick=()=>document.body.classList.remove('nav-open');document.querySelector('#copy-ref').onclick=async()=>{await navigator.clipboard.writeText(document.querySelector('#ref-link').value);notify('Referral link copied.')};document.querySelectorAll('[data-soon]').forEach(link=>link.onclick=event=>{event.preventDefault();notify('This service page will be migrated next.')});boot();
