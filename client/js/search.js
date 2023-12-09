let discordId = '';
document
  .getElementById('searchInput')
  .addEventListener('change', function (event) {
    event.preventDefault();

    const searchInput = event.target.value.trim().toLowerCase();

    displaySearchResults(searchInput);
  });

document
  .getElementById('searchForm')
  .addEventListener('submit', function (event) {
    event.preventDefault();
  });

async function displaySearchResults(search) {
  if (search.length < 1) {
    return;
  }
  const searchResultsElement = document.getElementById('searchResults');
  searchResultsElement.innerHTML = 'Loading...';
  const results = await fetch('/api/players/search/' + search)
    .then((res) => res.json())
    .catch((err) => console.error('error', err));

  searchResultsElement.innerHTML = '';
  console.log(results);
  if (results.length === 0) {
    searchResultsElement.innerHTML = '<p>No results found.</p>';
    return;
  }

  const resultList = document.createElement('ul');
  resultList.classList.add('list-group');

  results.forEach((user) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.style.cursor = 'pointer';
    listItem.innerHTML = `<strong>${user.name}</strong> (${user.discordId})`;

    resultList.addEventListener('click', function (event) {
      event.preventDefault();
      discordId = user.discordId;
      afterSearchListener(user);
    });
    resultList.appendChild(listItem);
  });

  searchResultsElement.appendChild(resultList);
}
