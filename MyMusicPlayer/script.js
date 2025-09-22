// ====== Data ======
const songs = [
  {title: "Dhaga", artist: "Nilotpal Bora", file: "songs/Dhaga.mp3", image: "images/photo1.jpg"},
  {title: "Dheema", artist: "Anirudha 2", file: "songs/Dheema.mp3", image: "images/photo2.jpg"},
  {title: "Inthandham", artist: "Krishna Khante", file: "songs/Inthandham.mp3", image: "images/photo3.jpg"},
  {title: "Kali Zulfe", artist: "Mahur Sharma", file: "songs/Kali Zulfe.mp3", image: "images/photo4.jpg"},

];

// ====== State ======
let currentIndex = 0;
let audio = new Audio(songs[currentIndex].file);
let isPlaying = false;
let isShuffle = JSON.parse(localStorage.getItem("isShuffle")) || false;
let isRepeat = JSON.parse(localStorage.getItem("isRepeat")) || false;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let recents = JSON.parse(localStorage.getItem("recents")) || [];

// ====== Elements ======
const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const repeatBtn = document.getElementById("repeat");
const shuffleBtn = document.getElementById("shuffle");
const favBtn = document.getElementById("fav-btn");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const volumeControl = document.getElementById("volume");
const muteBtn = document.getElementById("mute");
const playlistEl = document.getElementById("playlist");
const favoritesEl = document.getElementById("favorites");
const recentEl = document.getElementById("recently-played");
const albumArt = document.getElementById("album-art");
const songTitle = document.getElementById("song-title");
const songArtist = document.getElementById("song-artist");
const searchInput = document.getElementById("search");
const voiceBtn = document.getElementById("voice-search");
const nowPlaying = document.querySelector(".now-playing");
const miniPrev = document.getElementById("mini-prev");
const miniPlay = document.getElementById("mini-play");
const miniNext = document.getElementById("mini-next");
const miniTitle = document.getElementById("mini-title");
const miniArtist = document.getElementById("mini-artist");
const themeToggle = document.getElementById("theme-toggle");
const coverBadge = document.getElementById("cover-badge");

// ====== Utilities ======
const formatTime = (sec=0) => {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
};

const saveLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ====== Load Song ======
function loadSong(index) {
  currentIndex = (index + songs.length) % songs.length;
  const song = songs[currentIndex];
  audio.src = song.file;
  albumArt.src = song.image;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  miniTitle.textContent = song.title;
  miniArtist.textContent = song.artist;
  updateFavBtn();
  highlightActive();
}

// ====== Playback ======
function playSong() {
  audio.play().then(() => {
    isPlaying = true;
    playBtn.textContent = "⏸";
    miniPlay.textContent = "⏸";
    nowPlaying.classList.add("playing");
    coverBadge.hidden = false;
  }).catch(() => {
    // Autoplay may be blocked
    isPlaying = false;
    playBtn.textContent = "▶️";
    miniPlay.textContent = "▶️";
  });
}
function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.textContent = "▶️";
  miniPlay.textContent = "▶️";
  nowPlaying.classList.remove("playing");
  coverBadge.hidden = true;
}

function nextSong() {
  if (isShuffle) {
    const rand = Math.floor(Math.random() * songs.length);
    loadSong(rand);
  } else {
    loadSong(currentIndex + 1);
  }
  playSong();
  addRecent(songs[currentIndex]);
}

function prevSong() {
  loadSong(currentIndex - 1);
  playSong();
  addRecent(songs[currentIndex]);
}

// ====== Progress / Time ======
audio.addEventListener("timeupdate", () => {
  progress.max = audio.duration || 0;
  progress.value = audio.currentTime || 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
});

progress.addEventListener("input", () => {
  audio.currentTime = Number(progress.value);
});

audio.addEventListener("loadedmetadata", () => {
  progress.max = audio.duration || 0;
  durationEl.textContent = formatTime(audio.duration);
});

// ====== Volume / Mute ======
const savedVol = Number(localStorage.getItem("volume") ?? 0.9);
audio.volume = savedVol;
volumeControl.value = savedVol;
localStorage.setItem("volume", savedVol);

volumeControl.addEventListener("input", () => {
  audio.volume = Number(volumeControl.value);
  localStorage.setItem("volume", audio.volume);
  if (audio.volume === 0) {
    audio.muted = true;
  } else {
    audio.muted = false;
  }
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? "🔈" : "🔇";
});

// ====== Controls ======
playBtn.addEventListener("click", () => isPlaying ? pauseSong() : playSong());
miniPlay.addEventListener("click", () => isPlaying ? pauseSong() : playSong());
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
miniNext.addEventListener("click", nextSong);
miniPrev.addEventListener("click", prevSong);

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.setAttribute("aria-pressed", String(isShuffle));
  saveLS("isShuffle", isShuffle);
});
repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.setAttribute("aria-pressed", String(isRepeat));
  saveLS("isRepeat", isRepeat);
});

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    nextSong();
  }
});

// ====== Keyboard Shortcuts ======
window.addEventListener("keydown", (e) => {
  const tag = document.activeElement.tagName.toLowerCase();
  if (tag === "input") return; // don't intercept typing
  if (e.code === "Space") { e.preventDefault(); isPlaying ? pauseSong() : playSong(); }
  if (e.key === "ArrowRight") { e.preventDefault(); nextSong(); }
  if (e.key === "ArrowLeft") { e.preventDefault(); prevSong(); }
  if (e.key.toLowerCase() === "m") { muteBtn.click(); }
  if (e.key.toLowerCase() === "l") { favBtn.click(); }
  if (e.key === "/") { e.preventDefault(); searchInput.focus(); }
});

// ====== Playlist Render ======
function renderPlaylist(list = songs) {
  playlistEl.innerHTML = "";
  list.forEach((song) => {
    const index = songs.findIndex(s => s.title === song.title && s.artist === song.artist);
    const li = document.createElement("li");
    li.className = "media";
    li.dataset.index = index;

    const img = document.createElement("img");
    img.src = song.image;
    img.alt = "";
    img.className = "media__thumb";

    const main = document.createElement("div");
    main.className = "media__main";
    const title = document.createElement("div");
    title.className = "media__title";
    title.textContent = song.title;
    const sub = document.createElement("div");
    sub.className = "media__sub";
    sub.textContent = song.artist;
    main.append(title, sub);

    const meta = document.createElement("div");
    meta.className = "media__meta";
    meta.textContent = "—:—";

    // Load duration asynchronously
    const probe = new Audio(song.file);
    probe.addEventListener("loadedmetadata", () => {
      meta.textContent = formatTime(probe.duration);
    });

    li.append(img, main, meta);
    li.addEventListener("click", () => { loadSong(index); playSong(); addRecent(songs[index]); });
    playlistEl.appendChild(li);
  });
  highlightActive();
}

function highlightActive() {
  [...playlistEl.children].forEach(li => li.classList.remove("is-active"));
  const active = [...playlistEl.children].find(li => Number(li.dataset.index) === currentIndex);
  if (active) active.classList.add("is-active");
}

// ====== Favorites ======
function updateFavBtn() {
  const song = songs[currentIndex];
  const liked = favorites.includes(song.title);
  favBtn.setAttribute("aria-pressed", String(liked));
  favBtn.innerHTML = liked ? "💖 Favorited" : "⭐ Favorite";
}

function renderFavorites() {
  favoritesEl.innerHTML = "";
  favorites.forEach(title => {
    const song = songs.find(s => s.title === title);
    if (!song) return;
    const li = document.createElement("li");
    li.textContent = title;
    li.addEventListener("click", () => {
      const i = songs.findIndex(s => s.title === title);
      loadSong(i);
      playSong();
      addRecent(songs[i]);
    });
    favoritesEl.appendChild(li);
  });
}

favBtn.addEventListener("click", () => {
  const song = songs[currentIndex];
  const idx = favorites.indexOf(song.title);
  if (idx >= 0) favorites.splice(idx, 1);
  else favorites.push(song.title);
  saveLS("favorites", favorites);
  updateFavBtn();
  renderFavorites();
});

// ====== Recents ======
function addRecent(song) {
  recents = [song.title, ...recents.filter(t => t !== song.title)].slice(0, 7);
  saveLS("recents", recents);
  renderRecents();
}

function renderRecents() {
  recentEl.innerHTML = "";
  recents.forEach(title => {
    const li = document.createElement("li");
    li.textContent = title;
    li.addEventListener("click", () => {
      const i = songs.findIndex(s => s.title === title);
      if (i >= 0) { loadSong(i); playSong(); }
    });
    recentEl.appendChild(li);
  });
}

// ====== Search ======
function doSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) { renderPlaylist(songs); return; }
  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
  );
  renderPlaylist(filtered);
}

let searchDebounce;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => doSearch(searchInput.value), 120);
});

// Voice Search (with fallback)
voiceBtn.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice search is not supported in this browser.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    searchInput.value = text;
    doSearch(text);
  };
  recognition.start();
});

// ====== Theme Toggle ======
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme") || "dark";
if (savedTheme === "light") root.classList.add("light");
themeToggle.addEventListener("click", () => {
  root.classList.toggle("light");
  localStorage.setItem("theme", root.classList.contains("light") ? "light" : "dark");
});

// ====== Init ======
function init() {
  renderPlaylist();
  renderFavorites();
  renderRecents();
  loadSong(currentIndex);
}
init();
