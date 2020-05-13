const QUEUE_ENDPOINT = "http://94.63.79.78:8000/queue/";

window.onload = () => {
  document
    .querySelector("#refresh-button")
    .addEventListener("click", refreshData);
  refreshData();

  // refreshing every 2 mins
  window.setInterval(refreshData, 90000);

  const submitSpotifySong = document.querySelector(".spotifySubmit");
  const spotifyInput = document.querySelector(".spotifyInput");

  submitSpotifySong.addEventListener("click", (e) => {
    e.preventDefault();
    const value = spotifyInput.value;
    if (validSpotifyURI(value)) {
      spotifyInput.disabled = true;
      fetch(`${QUEUE_ENDPOINT}${"add"}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uri: value,
        }),
      })
        .then((res) => {
          spotifyInput.value = "";
          spotifyInput.disabled = false;
          submitSpotifySong.setAttribute("disabled", "true");
          alert("Song added to the queue!");
        })
        .catch((res) => {
          alert("Something went wrong :(");
          spotifyInput.disabled = false;
        });
    } else {
      console.log("regex failed");
    }
  });

  spotifyInput.addEventListener("input", (e) => {
    const input = e.target.value;
    if (!validSpotifyURI(input)) {
      submitSpotifySong.setAttribute("disabled", "true");
    } else {
      submitSpotifySong.removeAttribute("disabled");
    }
  });

  const validSpotifyURI = (value) => {
    return /spotify:track:([a-zA-Z0-9]{22})/.test(value);
  };
};

const fetchAndPopulateMusicMetadata = (type) => {
  const metadataContainer = document.querySelector(".metadata-container");
  const refreshButton = document.querySelector("#refresh-button");

  refreshButton.disabled = true;
  metadataContainer.classList.remove("error");
  metadataContainer.classList.add("loading");

  fetch(`${QUEUE_ENDPOINT}${type}`)
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(
        `.metadata-container .${type} .name`
      ).innerHTML = `<a target="_blank" href="${data.item.external_urls.spotify}">${data.item.name}</a>`;
      document.querySelector(
        `.metadata-container .${type} .album`
      ).innerHTML = `<a target="_blank" href="${data.item.album.external_urls.spotify}">${data.item.album.name}</a>`;
      document.querySelector(
        `.metadata-container .${type} .artist`
      ).innerHTML = data.item.artists
        .map(
          (artist) =>
            `<a target="_blank" href="${artist.external_urls.spotify}">${artist.name}</a>`
        )
        .join(", ");
      document.querySelector(`.metadata-container .${type} .album-cover`).src =
        data.item.album.images[1].url;

      metadataContainer.classList.remove("loading");
      refreshButton.disabled = false;
    })
    .catch((err) => {
      metadataContainer.classList.add("error");
      metadataContainer.classList.remove("loading");
      refreshButton.disabled = false;
      console.log(err);
    });
};

const fetchListeners = () => {
  fetch(
    "https://proxy.zeno.fm/api/stations/f8aqkae5bzzuv/stats/live?include_outputs=true"
  )
    .then((res) => res.json())
    .then((data) => {
      let count = 0;
      domListeners = document.querySelector(".current-listeners");
      data.data.forEach((country) => (count += country.count));
      domListeners.innerText = `${count} currently listening`;
    });
};

const refreshData = () => {
  fetchAndPopulateMusicMetadata("current");
  fetchListeners();
  // fetchAndPopulateMusicMetadata("next");
};
