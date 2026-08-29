let loaderPromise;

export function loadSweetAlert() {
  if (window.Swal) return Promise.resolve(window.Swal);
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.onload = () => resolve(window.Swal);
    script.onerror = () => reject(new Error('Unable to load the alert interface.'));
    document.head.append(script);
  });
  return loaderPromise;
}

export async function confirmAction({ title, text, confirmText = 'Continue', icon = 'question' }) {
  const Swal = await loadSweetAlert();
  const result = await Swal.fire({ icon, title, text, showCancelButton: true, confirmButtonText: confirmText, cancelButtonText: 'Cancel', reverseButtons: true, focusCancel: true, confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#132b86', customClass: { popup: 'mbr-alert' } });
  return result.isConfirmed;
}

export async function showProcessing(title = 'Processing...', text = 'Please wait while we complete your request.') {
  const Swal = await loadSweetAlert();
  Swal.fire({ title, text, allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading(), customClass: { popup: 'mbr-alert' } });
  return Swal;
}

export async function showResult({ success, title, message }) {
  const Swal = await loadSweetAlert();
  return Swal.fire({ icon: success ? 'success' : 'error', title, text: message, confirmButtonText: 'Okay', confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#132b86', customClass: { popup: 'mbr-alert' } });
}

export async function runAction(action, { loadingTitle = 'Processing...', loadingText, successTitle = 'Successful', successMessage } = {}) {
  await showProcessing(loadingTitle, loadingText);
  try {
    const response = await action();
    window.Swal.close();
    await showResult({ success: true, title: successTitle, message: response?.message || successMessage || 'Request completed successfully.' });
    return response;
  } catch (error) {
    window.Swal?.close();
    await showResult({ success: false, title: 'Request Failed', message: error.message || 'Unable to complete the request.' });
    throw error;
  }
}

export async function showReceipt(tx, money) {
  const Swal = await loadSweetAlert();
  const ref = String(tx.transid || tx.reference || 'N/A');
  const service = String(tx.service || tx.network || tx.type || 'Transaction').replaceAll('_', ' ').toUpperCase();
  const details = [tx.network, tx.mobile, tx.plans].filter(Boolean).join(' • ') || 'Transaction record';
  const html = `<div class="receipt-sheet"><div class="receipt-total"><small>TRANSACTION AMOUNT</small><strong>${money(tx.amount)}</strong></div><div class="receipt-line"><span>Transaction ID</span><b>${ref}</b></div><div class="receipt-line"><span>Date & Time</span><b>${tx.date || 'N/A'}</b></div><div class="receipt-line"><span>Service</span><b>${service}</b></div><div class="receipt-line"><span>Details</span><b>${details}</b></div><div class="receipt-line"><span>Old Balance</span><b>${money(tx.oldbal)}</b></div><div class="receipt-line"><span>New Balance</span><b>${money(tx.newbal)}</b></div><div class="receipt-line"><span>Status</span><b>${tx.status || 'Successful'}</b></div><div class="receipt-tools"><button id="receipt-copy" type="button"><i class="bi bi-copy"></i> Copy Ref</button><button id="receipt-print" type="button"><i class="bi bi-printer"></i> Print</button></div></div>`;
  return Swal.fire({ title: 'Transaction Receipt', html, width: 520, confirmButtonText: 'Close', confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#132b86', customClass: { popup: 'mbr-alert receipt-popup' }, didOpen: () => { document.querySelector('#receipt-copy').onclick = async () => { await navigator.clipboard.writeText(ref); Swal.showValidationMessage('Transaction reference copied.'); }; document.querySelector('#receipt-print').onclick = () => window.print(); } });
}
