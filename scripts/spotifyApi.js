const QUEUE_ENDPOINT = "http://94.63.79.78:8000/queue/";

window.onload = () => {
  document
    .querySelector("#refresh-button")
    .addEventListener("click", refreshData);
  refreshData();

  // refreshing every 2 mins
  window.setTimeout(refreshData, 120000);

  const submitSpotifySong = document.querySelector('.spotifySubmit');
  const spotifyInput = document.querySelector('.spotifyInput');

  submitSpotifySong.addEventListener('click', (e) => {
    e.preventDefault();
    const value = spotifyInput.value;
    if (validSpotifyURI(value)) {
      fetch(`${QUEUE_ENDPOINT}${'add'}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "uri": value
        })
      }).then( res => {
        spotifyInput.value = '';
        alert('Song added to the queue!')
      }).catch( res => {
        alert('Something went wrong :(')
      });
    } else {
      console.log('regex failed');
    }
  })

  spotifyInput.addEventListener("input", (e) => {
    const input = e.target.value;
    if (!validSpotifyURI(input)) {
      submitSpotifySong.setAttribute('disabled', 'true');
    } else {
      submitSpotifySong.removeAttribute('disabled');
    }
  });

  const validSpotifyURI = (value) => {
    return /spotify:track:([a-zA-Z0-9]{22})/.test(value);
  }
};

const fetchAndPopulateMusicMetadata = (type) => {
  document.querySelector(".metadata-container").classList.remove("error");
  document.querySelector(".metadata-container").classList.add("loading");
  document.querySelector("#refresh-button").disabled = true;
  fetch(`${QUEUE_ENDPOINT}${type}`)
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(`.metadata-container .${type} .name`).textContent =
        data.item.name;
      document.querySelector(
        `.metadata-container .${type} .album`
      ).textContent = data.item.album.name;
      document.querySelector(
        `.metadata-container .${type} .artist`
      ).textContent = data.item.artists.map((artist) => artist.name).join(", ");
      document.querySelector(`.metadata-container .${type} .album-cover`).src =
        data.item.album.images[1].url;
      document.querySelector(".metadata-container").classList.remove("loading");
      document.querySelector("#refresh-button").disabled = false;
    })
    .catch((err) => {
      document.querySelector(".metadata-container").classList.add("error");
      document.querySelector(".metadata-container").classList.remove("loading");
      document.querySelector("#refresh-button").disabled = false;
      console.log(err);
    });
};

const refreshData = () => {
  fetchAndPopulateMusicMetadata("current");
  fetchAndPopulateMusicMetadata("next");
};
