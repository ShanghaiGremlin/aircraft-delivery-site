
//export function initThoughtButton() {
//const btn = document.querySelector('.join-thought-btn');
//const btna = document.querySelector('.join-thought-btna');
//const panel = document.querySelector('.thought-dropdown-panel');

//btn.addEventListener('click', () => {
//  panel.classList.toggle('is-hidden');
//  btna.classList.toggle('is-hidden');
//  btn.classList.toggle('is-hidden');
//})

//btna.addEventListener('click', () => {
//  panel.classList.toggle('is-hidden');
//  btna.classList.toggle('is-hidden');
//  btn.classList.toggle ('is-hidden');
//})

//}
 //initThoughtButton();

 export function initReqButton() {
const btn = document.querySelector('.join-requirements-btn');
const btna = document.querySelector('.join-requirements-btna');
const panel = document.querySelector('.join-requirements-content');

btn.addEventListener('click', () => {
  panel.classList.toggle('is-hidden');
  btna.classList.toggle('is-hidden');
  btn.classList.toggle('is-hidden');
})

btna.addEventListener('click', () => {
  panel.classList.toggle('is-hidden');
  btna.classList.toggle('is-hidden');
  btn.classList.toggle ('is-hidden');
})

}
 initReqButton();

 
function initCopyText() {

    const templit = document.getElementById('copy-template-text').innerText;
    const btn = document.querySelector('#join-copy-button');


    btn.addEventListener('click', () => {
    try {
        // Create a ClipboardItem with both 'text/html' and 'text/plain' MIME types
        const clipboardItem = new ClipboardItem({
            'text/plain': new Blob([templit], { type: 'text/plain' })
        });

        // Write the ClipboardItem to the clipboard
        navigator.clipboard.write([clipboardItem]).then(() => {
            console.log('Template successfully copied to clipboard!');
            alert('Template copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy template: ', err);
            alert('Failed to copy template.');
        });
    } catch (err) {
        console.error('Clipboard API not available or error: ', err);
        // Fallback or user notification can go here if the API isn't supported
        alert('Your browser does not support the Clipboard API for rich text copying. Try manually selecting and copying.');
    }
})
}

 initCopyText();



function initSetEmailContent() {
  const emailBodyEl = document.getElementById('join-email-body');
  const btn = document.getElementById('emailLink');

  // Guard clauses: bail if required elements are missing
  if (!emailBodyEl || !btn) {
    return;
  }

  const emailBodyText = emailBodyEl.textContent.trim();
  const recipient = 'akahn28@gmail.com';
  const subject = 'Joining your pilot roster';

  btn.addEventListener('click', (event) => {
    // If this is an <a>, prevent the default '#' or whatever
    event.preventDefault();

    const mailtoUrl =
      'mailto:' + encodeURIComponent(recipient) +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(emailBodyText);

    window.location.href = mailtoUrl;
  });
}

initSetEmailContent();

