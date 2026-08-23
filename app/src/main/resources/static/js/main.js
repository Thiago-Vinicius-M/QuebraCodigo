// quanto vai andar a cada clique da seta (em pixels)
const SCROLL_AMOUNT = 300;

document.querySelectorAll('.arrow-btn').forEach(btn => {
    const direction = btn.dataset.scroll;        // "left" ou "right"
    const targetId = btn.dataset.target;        // ex: "cursosRow"
    const container = document.getElementById(targetId);

    if (!container) return;

    btn.addEventListener('click', () => {
        const delta = direction === 'right' ? SCROLL_AMOUNT : -SCROLL_AMOUNT;
        container.scrollBy({
            left: delta,
            behavior: 'smooth'
        });
    });
});