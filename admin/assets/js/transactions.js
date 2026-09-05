import { api, money } from './api.js';
import { backgroundRefresh, escapeHtml, handleAdminError, initAdminShell, loading, openLegacyModal, pageCache } from './shell.js?v=20260905-1';

initAdminShell('transactions');
const $ = (selector) => document.querySelector(selector);
const state = { status:new URLSearchParams(location.search).get('status') || 'all', page:1 };
const cache = pageCache('transactions');
let hasRendered = false;
const meta = (status) => String(status) === '1' ? ['Successful','success'] : String(status) === '2' ? ['Pending','warning'] : ['Failed','danger'];

function renderTransactions(out) {
  const pager = out.transactions || { data:[] };
  Object.entries(out.counts || {}).forEach(([key,value]) => document.querySelector(`[data-count="${key}"]`)?.replaceChildren(String(value)));
  $('#transactions-body').innerHTML = (pager.data || []).map((transaction,index) => {
    const [label,style] = meta(transaction.status);
    const number = index + 1 + ((pager.current_page || 1) - 1) * (pager.per_page || 25);
    return `<tr><td><input class="transaction-select" type="checkbox" value="${transaction.id}" aria-label="Select transaction ${escapeHtml(transaction.transid || transaction.id)}"></td><td>${number}.</td><td>${escapeHtml(transaction.username || '')}</td><td>${escapeHtml(transaction.transid || '')}</td><td>${escapeHtml(transaction.network || '')}</td><td>${escapeHtml(transaction.service || '')}</td><td>${escapeHtml(transaction.mobile || '')}</td><td>${escapeHtml(transaction.plans || '')}</td><td>${escapeHtml(transaction.type || '')}</td><td>${money(transaction.amount)}</td><td>${money(transaction.profit)}</td><td>${escapeHtml(transaction.date || '')}</td><td><span class="btn btn-${style} btn-sm">${label}</span></td><td><button class="btn btn-success btn-sm" data-view="${transaction.id}" title="View"><i class="fa fa-eye"></i></button> <button class="btn btn-warning btn-sm" data-status-update="${transaction.id}" title="Update status"><i class="fa fa-edit"></i></button> <button class="btn btn-danger btn-sm" data-delete="${transaction.id}" title="Delete"><i class="fa fa-trash"></i></button></td></tr>`;
  }).join('') || '<tr><td colspan="14" class="text-center py-4"><b>No Transaction Made Yet</b></td></tr>';
  $('#page-info').textContent = `Showing ${pager.from || 0} to ${pager.to || 0} of ${pager.total || 0} transactions`;
  $('#prev').disabled = !pager.prev_page_url; $('#next').disabled = !pager.next_page_url; $('#select-all-transactions').checked = false;
  updateSelection(); hasRendered = true;
}

async function loadTransactions(silent = false) {
  const params = new URLSearchParams({ status:state.status, page:state.page, per_page:25, search:$('#search').value, from:$('#from').value, to:$('#to').value });
  try { const out=await api(`/admin/transactions?${params}`);renderTransactions(out);cache.write(out); }
  catch (error) { if (!silent && !hasRendered) handleAdminError(error,'Unable to load transactions'); }
}

async function receipt(id) {
  loading('Loading transaction…');
  try {
    const transaction=(await api(`/admin/transactions/${id}`)).data,[label,style]=meta(transaction.status);Swal.close();
    const field=(name,value)=>`<div class="col-md-6"><div class="form-group"><label>${name}</label><div class="form-control legacy-readonly">${value}</div></div></div>`;
    openLegacyModal({title:'View Transaction',body:`<div class="row">${field('Username',escapeHtml(transaction.username||''))}${field('Transaction ID',escapeHtml(transaction.transid||''))}${field('Network',escapeHtml(transaction.network||''))}${field('Service',escapeHtml(transaction.service||''))}${field('Mobile Number',escapeHtml(transaction.mobile||''))}${field('Plan',escapeHtml(transaction.plans||''))}${field('Type',escapeHtml(transaction.type||''))}${field('Amount',money(transaction.amount))}${field('Profit',money(transaction.profit))}${field('Old Balance',money(transaction.oldbal))}${field('New Balance',money(transaction.newbal))}${field('Date',escapeHtml(transaction.date||''))}${field('Status',`<span class="badge badge-${style}">${label}</span>`)}${field('API Response',escapeHtml(transaction.api_response||''))}</div>`,confirmText:'Update Status',onConfirm:(_host,close)=>{close();manageStatus(id)}});
  } catch (error) { handleAdminError(error); }
}

async function manageStatus(id) {
  const choice=await Swal.fire({title:'Update transaction',input:'select',inputOptions:{success_only:'Mark successful only',success_debit:'Mark successful and debit user',failed_only:'Mark failed only',failed_refund:'Mark failed and refund user'},inputPlaceholder:'Select an action',showCancelButton:true,confirmButtonColor:'#132b86',inputValidator:(value)=>!value&&'Select an action'});if(!choice.isConfirmed)return;
  const confirmation=await Swal.fire({icon:'warning',title:'Confirm balance action',text:'Some status actions change the customer wallet balance.',showCancelButton:true,confirmButtonText:'Proceed',confirmButtonColor:'#d97706'});if(!confirmation.isConfirmed)return;
  loading('Updating transaction…');try{const out=await api(`/admin/transactions/${id}/status`,{method:'PATCH',body:JSON.stringify({action_type:choice.value})});await Swal.fire('Completed',out.message,'success');await loadTransactions()}catch(error){handleAdminError(error)}
}

async function deleteTx(id) { const confirmation=await Swal.fire({icon:'warning',title:'Delete transaction?',text:'The transaction record will be permanently removed.',showCancelButton:true,confirmButtonText:'Delete',confirmButtonColor:'#d33'});if(!confirmation.isConfirmed)return;loading('Deleting…');try{const out=await api(`/admin/transactions/${id}`,{method:'DELETE'});await Swal.fire('Deleted',out.message,'success');await loadTransactions()}catch(error){handleAdminError(error)} }
function selectedIds(){return [...document.querySelectorAll('.transaction-select:checked')].map((box)=>Number(box.value))}
function updateSelection(){const ids=selectedIds(),boxes=document.querySelectorAll('.transaction-select');$('#selected-count').textContent=ids.length;$('#bulk-delete').disabled=!ids.length;$('#select-all-transactions').checked=boxes.length>0&&ids.length===boxes.length;$('#select-all-transactions').indeterminate=ids.length>0&&ids.length<boxes.length}
async function bulkDelete(){const ids=selectedIds();if(!ids.length)return;const confirmation=await Swal.fire({icon:'warning',title:'Delete selected transactions?',text:`You are about to permanently delete ${ids.length} transaction${ids.length===1?'':'s'}.`,showCancelButton:true,confirmButtonText:'Delete Selected',confirmButtonColor:'#d33'});if(!confirmation.isConfirmed)return;loading('Deleting transactions…');try{const out=await api('/admin/transactions/bulk-delete',{method:'DELETE',body:JSON.stringify({ids})});await Swal.fire({icon:'success',title:out.title||'Deleted',text:out.message,confirmButtonColor:'#132b86'});await loadTransactions()}catch(error){handleAdminError(error)}}

document.querySelectorAll('[data-status]').forEach((button)=>button.onclick=()=>{document.querySelectorAll('[data-status]').forEach((item)=>item.className='btn btn-light btn-sm');button.className=`btn btn-${button.dataset.status==='all'?'secondary':button.dataset.status==='1'?'success':button.dataset.status==='2'?'warning':'danger'} btn-sm active`;state.status=button.dataset.status;state.page=1;loadTransactions()});
$('#filter-transactions').onclick=()=>loadTransactions();$('#reset-transactions').onclick=()=>{$('#search').value='';$('#from').value='';$('#to').value='';loadTransactions()};$('#prev').onclick=()=>{state.page--;loadTransactions()};$('#next').onclick=()=>{state.page++;loadTransactions()};$('#select-all-transactions').onchange=(event)=>{document.querySelectorAll('.transaction-select').forEach((box)=>box.checked=event.target.checked);updateSelection()};$('#bulk-delete').onclick=bulkDelete;$('#transactions-body').onchange=(event)=>{if(event.target.matches('.transaction-select'))updateSelection()};
$('#transactions-body').onclick=(event)=>{const view=event.target.closest('[data-view]'),status=event.target.closest('[data-status-update]'),remove=event.target.closest('[data-delete]');if(view)receipt(view.dataset.view);if(status)manageStatus(status.dataset.statusUpdate);if(remove)deleteTx(remove.dataset.delete)};

const saved=cache.read();if(saved)renderTransactions(saved);loadTransactions(Boolean(saved));backgroundRefresh(()=>loadTransactions(true),30000);
