const sidebarBoxLeft = document.querySelector('#box-left'),
		sidebarBtnLeft = document.querySelector('#btn-left'),
		pageWrapper = document.querySelector('#page-wrapper'),
		sidebarBoxRight = document.querySelector('#box-right'),
		sidebarBtnRight = document.querySelector('#btn-right');


sidebarBtnLeft.addEventListener('click', event => {
		sidebarBtnLeft.classList.toggle('active');
		sidebarBoxLeft.classList.toggle('active');
});

sidebarBtnRight.addEventListener('click', event => {
		sidebarBtnRight.classList.toggle('active');
		sidebarBoxRight.classList.toggle('active');
});


pageWrapper.addEventListener('click', event => {
    if (sidebarBtnLeft.classList.contains('active')) {
            sidebarBtnLeft.classList.remove('active');
            sidebarBoxLeft.classList.remove('active');
    }

    if (sidebarBtnRight.classList.contains('active')) {
            sidebarBtnRight.classList.remove('active');
            sidebarBoxRight.classList.remove('active');
    }

});

window.addEventListener('keydown', event => {

    if (sidebarBtnLeft.classList.contains('active') && event.keyCode === 27) {
            sidebarBtnLeft.classList.remove('active');
            sidebarBoxLeft.classList.remove('active');
    }

    if (sidebarBtnRight.classList.contains('active') && event.keyCode === 27) {
            sidebarBtnRight.classList.remove('active');
            sidebarBoxRight.classList.remove('active');
    }
});