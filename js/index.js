document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('github-form');
    const searchInput = document.getElementById('search');
    const userList = document.getElementById('user-list');
    const reposList = document.getElementById('repos-list');
    const toggleButton = document.getElementById('toggle-search');
    const errorMessage = document.getElementById('error-message');
    const loadingMessage = document.getElementById('loading-message');
    const pagination = document.getElementById('pagination');
    let searchType = 'users';
    let currentPage = 1;
    const resultsPerPage = 10;

    toggleButton.addEventListener('click', () => {
        if (searchType === 'users') {
            searchType = 'repos';
            toggleButton.textContent = 'Switch to User Search';
            searchInput.placeholder = 'Search for repositories';
        } else {
            searchType = 'users';
            toggleButton.textContent = 'Switch to Repo Search';
            searchInput.placeholder = 'Search for users';
        }
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            currentPage = 1;
            search(query, currentPage);
        }
    });

    function search(query, page) {
        if (searchType === 'users') {
            searchUsers(query, page);
        } else {
            searchRepos(query, page);
        }
    }

    function searchUsers(query, page) {
        showLoading();
        fetch(`https://api.github.com/search/users?q=${query}&page=${page}&per_page=${resultsPerPage}`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.items && data.items.length > 0) {
                displayUsers(data.items);
                errorMessage.textContent = '';
                setupPagination(query, data.total_count, searchUsers);
            } else {
                errorMessage.textContent = 'No users found.';
                pagination.innerHTML = '';
            }
        })
        .catch(error => {
            hideLoading();
            errorMessage.textContent = 'Error fetching users.';
            console.error('Error fetching users:', error);
        });
    }

    function searchRepos(query, page) {
        showLoading();
        fetch(`https://api.github.com/search/repositories?q=${query}&page=${page}&per_page=${resultsPerPage}`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.items && data.items.length > 0) {
                displayRepos(data.items);
                errorMessage.textContent = '';
                setupPagination(query, data.total_count, searchRepos);
            } else {
                errorMessage.textContent = 'No repositories found.';
                pagination.innerHTML = '';
            }
        })
        .catch(error => {
            hideLoading();
            errorMessage.textContent = 'Error fetching repositories.';
            console.error('Error fetching repositories:', error);
        });
    }

    function displayUsers(users) {
        userList.innerHTML = '';
        reposList.innerHTML = '';
        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.className = 'user';
            userItem.innerHTML = `
                <img src="${user.avatar_url}" alt="${user.login}">
                <a href="${user.html_url}" target="_blank">${user.login}</a>
            `;
            userItem.addEventListener('click', () => {
                fetchUserRepos(user.login);
            });
            userList.appendChild(userItem);
        });
    }

    function fetchUserRepos(username) {
        showLoading();
        fetch(`https://api.github.com/users/${username}/repos`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            displayRepos(data);
        })
        .catch(error => {
            hideLoading();
            errorMessage.textContent = 'Error fetching repositories.';
            console.error('Error fetching repos:', error);
        });
    }

    function displayRepos(repos) {
        reposList.innerHTML = '';
        userList.innerHTML = '';
        repos.forEach(repo => {
            const repoItem = document.createElement('li');
            repoItem.className = 'repo';
            repoItem.innerHTML = `
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                <p>${repo.description || 'No description'}</p>
            `;
            reposList.appendChild(repoItem);
        });
    }

    function showLoading() {
        loadingMessage.textContent = 'Loading...';
    }

    function hideLoading() {
        loadingMessage.textContent = '';
    }

    function setupPagination(query, totalCount, searchFunction) {
        const totalPages = Math.ceil(totalCount / resultsPerPage);
        pagination.innerHTML = '';

        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.addEventListener('click', () => {
                    searchFunction(query, i);
                });
                pagination.appendChild(pageButton);
            }
        }
    }
});
