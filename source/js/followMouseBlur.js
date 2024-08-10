function loadFollow() {
    document.querySelectorAll('follow-mouse-blur').forEach((el) => {
        el.addEventListener('mousemove'), (e) => {
            el.style.setProperty('--x', e.offsetX / e.target.offsetWidth)
            el.style.setProperty('--y', e.offsetY / e.target.offsetHeight)
        }
    })
}