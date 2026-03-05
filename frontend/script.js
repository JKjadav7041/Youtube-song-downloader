const API = "http://localhost:5000";
const REFRESH_MS = 5000;

const fileInput = document.getElementById("file");
const fileNameEl = document.getElementById("fileName");
const downloadBtn = document.getElementById("downloadBtn");
const statusEl = document.getElementById("status");
const spinnerEl = document.getElementById("spinner");
const songsEl = document.getElementById("songs");
const gridBtn = document.getElementById("gridBtn");
const listBtn = document.getElementById("listBtn");

let currentView = "grid";
let lastSongSignature = "";

fileInput.addEventListener("change", onFileSelected);
downloadBtn.addEventListener("click", uploadExcel);
gridBtn.addEventListener("click", () => setView("grid"));
listBtn.addEventListener("click", () => setView("list"));

function onFileSelected() {
  const file = fileInput.files[0];
  fileNameEl.textContent = file ? file.name : "No file selected";
}

function setStatus(text, loading = false) {
  statusEl.textContent = text;
  spinnerEl.classList.toggle("hidden", !loading);
}

function setView(mode) {
  currentView = mode;

  const isGrid = mode === "grid";
  songsEl.classList.toggle("songs-grid", isGrid);
  songsEl.classList.toggle("songs-list", !isGrid);

  gridBtn.classList.toggle("active", isGrid);
  listBtn.classList.toggle("active", !isGrid);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function encodeFilePath(fileName) {
  return encodeURIComponent(fileName).replace(/%2F/g, "/");
}

async function uploadExcel() {
  const file = fileInput.files[0];

  if (!file) {
    setStatus("Please upload an Excel file first.");
    fileInput.focus();
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  downloadBtn.disabled = true;
  setStatus("Downloading started... Please wait.", true);

  try {
    const response = await fetch(`${API}/upload`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed (${response.status})`);
    }

    setStatus("Download finished. Library updated.");
    await loadSongs(true);
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  } finally {
    downloadBtn.disabled = false;
    spinnerEl.classList.add("hidden");
  }
}

function renderSongs(songs, forceAnimate = false) {
  if (!Array.isArray(songs) || songs.length === 0) {
    songsEl.innerHTML = '<div class="empty-state">No songs downloaded yet.</div>';
    return;
  }

  const cards = songs
    .map((song, index) => {
      const safeName = escapeHtml(song);
      const src = `${API}/downloads/${encodeFilePath(song)}`;
      const delay = forceAnimate ? index * 0.05 : 0;

      return `
      <article class="song-card" style="animation-delay:${delay}s">
        <div class="song-top">
          <h3 class="song-name" title="${safeName}">${safeName}</h3>
          <span class="downloaded-badge">Downloaded</span>
        </div>
        <audio controls preload="none" src="${src}"></audio>
      </article>`;
    })
    .join("");

  songsEl.innerHTML = cards;
}

async function loadSongs(forceAnimate = false) {
  try {
    const response = await fetch(`${API}/songs`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Fetch failed (${response.status})`);
    }

    const songs = await response.json();
    const normalizedSongs = Array.isArray(songs) ? songs : [];
    const signature = normalizedSongs.join("|");
    const changed = signature !== lastSongSignature;

    if (changed || forceAnimate) {
      lastSongSignature = signature;
      renderSongs(normalizedSongs, changed);
    }
  } catch (error) {
    setStatus(`Unable to fetch songs: ${error.message}`);
  }
}

setView("grid");
loadSongs(true);
setInterval(() => loadSongs(false), REFRESH_MS);
