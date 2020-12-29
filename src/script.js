const headerInput = document.querySelector(".header-input");
const headerInputButton = document.querySelector(".header-input__button");
const searchResults = document.querySelector(".search-results");
const searchResultsHistory = document.querySelector(".search-results-history");

const searchAPI = query => {
    return fetch(`/search?query=${query}`, { method: "GET" })
        .then(response => response.json())
        .catch(console.error);
};

const searchHistory = query => {
    const historyQueries = wrapLocalStorageException(readHistoryFromLocalStorage);
    return historyQueries.filter(historyQuery => historyQuery.toLowerCase().indexOf(query.toLowerCase()) !== -1);
};

const search = event => {
    searchAPI(event.target.value)
        .then(searchAPIResponse => {
            renderSearchResults(searchAPIResponse, searchHistory(event.target.value));
            addSearchResultsEventListeners();
        });
};

const readHistoryFromLocalStorage = localStorage => JSON.parse(localStorage.getItem("history"));

const writeQueryToLocalStorage = (localStorage, query) => {
    localStorage.setItem("history", JSON.stringify([query, ...JSON.parse(localStorage.getItem("history"))]));
};

const wrapLocalStorageException = (localStorageHandler) => {
    let localStorage;
    try {
        localStorage = window.localStorage;

        if (!localStorage.getItem("history")) {
            localStorage.setItem("history", "[]");
        }

        return localStorageHandler(localStorage, headerInput.value);
    } catch (error) {
        console.error(error);
        return [];
    }
}

const createHTMLElement = (tag, innerHTML, className) => {
    const HTMLElement = document.createElement(tag);

    HTMLElement.className = className;

    if (innerHTML) {
        HTMLElement.innerHTML = innerHTML;
    }

    return HTMLElement;
};

const renderSearchResults = (searchAPIResponse, historyQueries) => {
    const searchAPIFragment = document.createDocumentFragment();
    const searchHistoryFragment = document.createDocumentFragment();
    const searchHistoryTitle = createHTMLElement("div", "Вы искали ранее", "search-results__title");
    const searchAPITitle = createHTMLElement("div", "Фильмы", "search-results__title");

    for (let i = 0; (i < 5) && (i < historyQueries.length); i++) {
        const searchResultsItem = createHTMLElement("div", historyQueries[i], "search-results__item-history");
        searchHistoryFragment.appendChild(searchResultsItem);
    }

    if (searchAPIResponse && searchAPIResponse.results) {
        for (let j = 0; (j < 10 - searchHistoryFragment.childElementCount) && (j < searchAPIResponse.results.length); j++) {
            const searchResultsItem = createHTMLElement("div", searchAPIResponse.results[j].title, "search-results__item");
            const searchResultsImage = createHTMLElement("img", "", "search-results__item-image");

            if (searchAPIResponse.results[j].poster_path) {
                searchResultsImage.src = `https://image.tmdb.org/t/p/w94_and_h141_bestv2/${searchAPIResponse.results[j].poster_path}`;
            }

            searchResultsItem.appendChild(searchResultsImage);
            searchAPIFragment.appendChild(searchResultsItem);
        }
    }

    searchResults.innerHTML = "";

    if (historyQueries.length > 0) {
        searchResults.appendChild(searchHistoryTitle);
    }

    searchResults.appendChild(searchHistoryFragment);

    if (
        searchAPIResponse &&
        searchAPIResponse.results &&
        searchAPIResponse.results.length > 0 &&
        10 - searchHistoryFragment.childElementCount > 0
    ) {
        searchResults.appendChild(searchAPITitle);
    }

    searchResults.appendChild(searchAPIFragment);
};

const addSearchResultsEventListeners = () => {
    const searchResultsItem = document.querySelectorAll(".search-results__item");

    if (searchResultsItem) {
        Array.prototype.forEach.call(searchResultsItem, item => {
            item.addEventListener("mousedown", event => {
                headerInput.value = event.target.innerText;
                wrapLocalStorageException(writeQueryToLocalStorage);
                renderSearchResultsHistory();
            });
        });
    }
};

const renderSearchResultsHistory = () => {
    const searchResultsHistoryFragment = document.createDocumentFragment();
    const historyQueries = wrapLocalStorageException(readHistoryFromLocalStorage);

    for (let i = 0; (i < 3) && (i < historyQueries.length); i++) {
        const searchResultsHistoryItem = createHTMLElement("div", historyQueries[i], "search-results-history__item");

        searchResultsHistoryItem.addEventListener("click", event => {
            headerInput.value = event.target.innerText;
            headerInput.focus();
        });

        searchResultsHistoryFragment.appendChild(searchResultsHistoryItem);
    }

    if (historyQueries.length > 0) {
        document.querySelector(".search-results__header").style.display = "block";
    }

    searchResultsHistory.innerHTML = "";
    searchResultsHistory.append(searchResultsHistoryFragment);
};

headerInput.addEventListener("input", search);
headerInput.addEventListener("focus", search);
headerInput.addEventListener("blur", () => searchResults.innerHTML = "");

headerInput.addEventListener("keypress", event => {
    if (event.keyCode === 13 && headerInput.value !== "") {
        wrapLocalStorageException(writeQueryToLocalStorage);
        renderSearchResultsHistory();
        headerInput.blur();
    }
});

headerInputButton.addEventListener("mousedown", () => {
    if (headerInput.value !== "") {
        wrapLocalStorageException(writeQueryToLocalStorage);
        renderSearchResultsHistory();
    }
});

window.addEventListener("storage", () => renderSearchResultsHistory());

renderSearchResultsHistory();