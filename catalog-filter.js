document.addEventListener('DOMContentLoaded', () => {
  const filterBar = document.querySelector('.filter-bar');
  if (!filterBar) return;

  const buttons = Array.from(filterBar.querySelectorAll('.filter-btn'));
  const cards = Array.from(document.querySelectorAll('.product-card'));

  function applyFilter(filter) {
    cards.forEach(card => {
      const cat = card.dataset.cat || 'otros';
      if (filter === 'all' || filter === cat) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter || 'all';
      applyFilter(filter);
    });
  });

  // Initialize: set active on the first button and apply 'all'
  const active = buttons.find(b => b.classList.contains('active')) || buttons[0];
  if (active) active.classList.add('active');
  applyFilter((active && active.dataset.filter) || 'all');
});


