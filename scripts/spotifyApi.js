const QUEUE_ENDPOINT = "http://94.63.79.78:8000/queue/";

window.onload = () => {
  document
    .querySelector("#refresh-button")
    .addEventListener("click", refreshData);
  refreshData();
};

const fetchAndPopulateMusicMetadata = (type) => {
  document.querySelector(".metadata-container").classList.remove("error");
  document.querySelector(".metadata-container").classList.add("loading");
  document.querySelector("#refresh-button").disabled = true;
  console.log("ehee");
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
