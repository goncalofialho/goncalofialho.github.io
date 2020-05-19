const QUEUE_ENDPOINT = "http://94.63.79.78:8000/queue/";
mopidy = new Mopidy({
  webSocketUrl: "ws://85.242.148.70:8081/mopidy/ws/",
});

mopidy.on("state:online", (e) => {
  console.log('online!');
  mopidy.playback.getCurrentTrack().then(track => {
    console.log('got track', track);
    updateCurrent(track)
  });
})

const submitSpotifySong = document.querySelector('.spotifySubmit');
const spotifyInput = document.querySelector('.spotifyInput');

window.onload = () => {
  // document
  //   .querySelector("#refresh-button")
  //   .addEventListener("click", refreshData);
  // refreshData();

  // refreshing every 2 mins
  // window.setInterval(refreshData, 90000);

  document.getElementById('background-button').addEventListener('click', randomizeBackground)

  submitSpotifySong.addEventListener("click", (e) => {
    e.preventDefault();
    const value = spotifyInput.value;
    if (validSpotifyURI(value)) {
      spotifyInput.disabled = true;
      addToQueue(value);
      console.log('request New song');
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

  // WebSocket Events
  mopidy.on('event:trackPlaybackStarted', (e) => {
    updateCurrent(e.tl_track.track);
  })

};

const validSpotifyURI = (value) => {
  return /spotify:track:([a-zA-Z0-9]{22})/.test(value);
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

const addToQueue = (uri) => {
  mopidy.tracklist.add({uris: [uri]}).then( () => {
    spotifyInput.value = "";
    spotifyInput.disabled = false;
    submitSpotifySong.setAttribute("disabled", "true");
    alert("Song added to the queue!");
  }).catch(res => {
    alert("Something went wrong :(");
    spotifyInput.disabled = false;
  })
}

const updateCurrent = (track) => {
  const metadataContainer = document.querySelector(".metadata-container");
  const refreshButton = document.querySelector("#refresh-button");
  console.log(track);
  document.querySelector(
    `.metadata-container .current .name`
  ).innerHTML = `<a href="${`https://open.spotify.com/track/${track.uri.split(':')[2]}`}" target="_blank">${track.name}</a>`;
  document.querySelector(
    `.metadata-container .current .album`
  ).innerHTML = `<a href="${`https://open.spotify.com/album/${track.album.uri.split(':')[2]}`}" target="_blank">${track.album.name}</a>`;
  document.querySelector(
    `.metadata-container .current .artist`
  ).innerHTML = track.artists
    .map(
      (artist) =>
        `<a href="${`https://open.spotify.com/artist/${artist.uri.split(':')[2]}`}" target="_blank">${artist.name}</a>`
    )
    .join(", ");
  metadataContainer.classList.remove("loading");
  refreshButton.style.display = 'none';

  mopidy.library.getImages([[track.uri]]).then(res => {
    console.log(res);
    document.querySelector(`.metadata-container .current .album-cover`).src =
      res[track.uri][0].uri;
  })
}

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

const randomizeBackground = () => {
  document.body.style.backgroundImage = `url("./videos/gifs/gif${Math.floor(Math.random() * 6) + 1 }.gif")`;
}
