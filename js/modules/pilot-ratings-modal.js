export function initPilotRatingsModal() {



  const btnView = document.getElementById('pilot-ratings-btn-view');
  const btnClose = document.getElementById('pilot-ratings-btn-close');
  const btnMenu = document.getElementById('pilot-ratings-btn-close-inmenu');
  const list = document.getElementById('pilot-dir-modal');

btnView.addEventListener('click', () => {
  list.hidden = false;      // show list
  btnClose.hidden = false;  // show Close
  btnView.hidden = true;    // hide View
});

btnClose.addEventListener('click', () => {
  btnClose.hidden = true;   // hide Close
  btnView.hidden = false;   // show View
  list.hidden = true;       // hide list
});

btnMenu.addEventListener('click', () => {
  btnClose.hidden = true;   // hide Close
  btnView.hidden = false;   // show View
  list.hidden = true;       // hide list
});
}
