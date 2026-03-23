// Set an event handler on the dropdown to trigger anonymous function when an item changes.
// Use the provided event object to get the target (dropdown) value - i.e. the item name for load data 
document.getElementById('jokeType').addEventListener('change', (event) => showJokes(event.target.value))

// Button click triggers fetching jokes of current type
document.getElementById('bStyleId').addEventListener('click', () => {
    const type = document.getElementById('jokeType').value;
    showJokes(type);
});

// Load items calls the GET /products/{items} endpoint. Use an async function so we can use await
async function loadTypes() {
    const res = await fetch('/types')
    const types = await res.json()

    // Using the returned types list, create the dropdown content
    const select = document.getElementById('jokeType')
    select.innerHTML = '<option value="any">Any</option>' // Add the first option as it's fixed

    // Add the rest by iterating the items array
    types.forEach(type => {
        const option = document.createElement('option')
        option.value = type
        option.textContent = type
        select.appendChild(option) // Add the option element to the select parent
    })
}

let punchlineTimer;

// Request the data from the server based on item type or all of them if item is 'all'
async function showJokes(type) {
  if (!type) {
    alert("Pick a type");
    return;
  }

  let jokes;

  try {
    const res = await fetch(`/joke/${type}`);

    if (!res.ok) {
      alert(`Server error (${res.status})`);
      return;
    }

    jokes = await res.json();

  } catch (err) {
    alert("Network error. Is the server running?");
    console.error(err);
    return;
  }

  const jokeDiv = document.getElementById('jokeListDiv');

  // stop old punchline timer if button gets clicked again
  clearTimeout(punchlineTimer);

  // replace old joke with new setup
  jokeDiv.innerHTML = `<p class="setup">${jokes[0].setup}</p>`;

  punchlineTimer = setTimeout(() => {
    jokeDiv.innerHTML += `<p class="punchline">${jokes[0].punchline}</p>`;
  }, 3000);
}


/*
    function drawTable(num) {
        let html =
            `<table id= 'jokeTable'>
        <thead>
            <tr>
             
            </tr>
        </thead>
    <tbody>`

        for (let i = 0; i < num && i < jokeList.length; i++) {
            html +=
                `<tr>
            <td class = "setup">${jokeList[i].setup}</td>
            <td class = "punchline">${jokeList[i].punchline}</td>
        </tr>
        `
        }
        html += `</tbody></table>`
        document.getElementById("jokeListDiv").innerHTML = html
    }


    function showJokes() {
        const num = Number(document.getElementById("input1").value);

        if (num >= 1 && num <= 10) {
            drawTable(num);
        } else {
            alert("Enter a number between 1 and 10.");
        }
    }
*/

loadTypes(); 