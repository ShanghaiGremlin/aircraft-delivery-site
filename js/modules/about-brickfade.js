export function initAboutBrickfade() {

  const brick = document.getElementById('aboutbrick');
  const badge = document.getElementById('leatherbadge');
  const track = document.getElementById('slidetrack');
  if (!brick || !badge) return;

  const DURATION = 1500; // ms
  const DELAY = 3000;    // ms
  
   badge.style.opacity = '0';

  setTimeout(() => {
    brick.style.display = "none";
    badge.style.transition = `opacity ${DURATION}ms ease`;
    badge.style.opacity = '1';
    badge.style.position = 'relative'
    track.style.marginTop = '0'

  }, 
  DELAY);

   
};
