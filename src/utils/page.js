export function paginate(data, currentPage, itemsPerPage) {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
}

export function renderPagination(totalItems, itemsPerPage, currentPage, onPageChange) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationLinks = document.getElementById("pagination-links");
    paginationLinks.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('li');
        pageLink.classList.add('page-item');
        if (i === currentPage) {
            pageLink.classList.add('active');
        }

        const pageButton = document.createElement('a');
        pageButton.classList.add('page-link');
        pageButton.href = '#';
        pageButton.textContent = i;

        pageButton.addEventListener('click', function (e) {
            e.preventDefault();
            onPageChange(i);
        });

        pageLink.appendChild(pageButton);
        paginationLinks.appendChild(pageLink);
    }
}