window.onload = () => {
  if ("serviceWorker" in navigator) {
    var iceworker = navigator.serviceWorker
      .register("./js/worker.min.js")
      .then(function (reg) {
        console.log("Icecast service worker registered");
      })
      .catch(function (error) {
        console.warn("Error " + error);
      });
  }
  navigator.serviceWorker.addEventListener("message", (event) => {
    console.log(event);
    console.log(event.data.msg);
  });

  const submitSpotifySong = document.querySelector('.spotifySubmit');
  const spotifyInput = document.querySelector('.spotifyInput');

  submitSpotifySong.addEventListener('click', (e) => {
    e.preventDefault();
    const value = spotifyInput.value;
    if (validSpotifyURI(value)) {
      fetch('http://94.63.79.78:8000/queue/add', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "uri": value
        })
      }).then( res => {
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
}