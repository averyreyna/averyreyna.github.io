const dcTimeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
});

function setDcTime() {
    const el = document.getElementById('dc-time');
    if (!el) return;
    el.textContent = dcTimeFormatter.format(new Date());
}

document.addEventListener('DOMContentLoaded', () => {
    setDcTime();
    setInterval(setDcTime, 30000);
});
