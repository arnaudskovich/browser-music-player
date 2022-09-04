const player = document.getElementById("player"),
	cover = document.getElementById("cover"),
	title = document.getElementById("title"),
	artist = document.getElementById("artistName"),
	album = document.getElementById("albumName"),
	now = document.getElementById("now"),
	timer = document.getElementById("timer"),
	duration = document.getElementById("duration"),
	list = document.getElementById("list"),
	prev = document.getElementById("prev"),
	playPause = document.getElementById("play"),
	next = document.getElementById("next"),
	items = document.getElementById("items"),
	repeatRandom = document.getElementById("repeat"),
	audioPlayer = new Audio(),
	playlist = document.getElementById("playlist"),
	closeList = document.getElementById("closeList"),
	fileSelector = document.getElementById("select-file"),
	filePicker = document.getElementById("filePicker");

let currentPlaying = 0;

const playerOptions = {
	repeatRandom: "random", //repeat, no-repeat
	showingPlaylist: false,
	songs: [],
};

audioPlayer.addEventListener(
	"loadeddata",
	function () {
		duration.innerText = renderDurationString(this.duration);
		timer.setAttribute("max", this.duration);
	},
	false
);

audioPlayer.addEventListener(
	"timeupdate",
	function () {
		now.innerText = renderDurationString(this.currentTime);
		timer.value = this.currentTime;
	},
	false
);

audioPlayer.addEventListener("ended", function (e) {
	audioPlayer.currentTime = 0;
	playPause.innerHTML = '<i class="fa fa-play"></i>';
	cover.classList.remove("playing");
});

timer.addEventListener("input", function () {
	if (audioPlayer.src != "") {
		audioPlayer.currentTime = Number(timer.value);
	}
});

next.addEventListener("click", function () {
	let n = Number(currentPlaying) + 1;
	if (n >= playerOptions.songs.length) return;
	playThis(n);
});

prev.addEventListener("click", function () {
	let n = Number(currentPlaying) - 1;
	if (n < 0) return;
	playThis(n);
});

playPause.onclick = function () {
	if (audioPlayer.src != "") {
		if (audioPlayer.paused) {
			playPause.innerHTML = '<i class="fa fa-pause"></i>';
			audioPlayer.play();
			cover.classList.add("playing");
			return;
		}
		playPause.innerHTML = '<i class="fa fa-play"></i>';
		audioPlayer.pause();
		cover.classList.remove("playing");
	}
};

list.onclick = function () {
	if (playerOptions.showingPlaylist) {
		playlist.classList.add("hidden");
		player.classList.remove("hidden");
	} else {
		playlist.classList.remove("hidden");
		player.classList.add("hidden");
	}
	playerOptions.showingPlaylist = !playerOptions.showingPlaylist;
};

closeList.onclick = function () {
	if (playerOptions.showingPlaylist) {
		playlist.classList.add("hidden");
		player.classList.remove("hidden");
	}
	playerOptions.showingPlaylist = false;
};

fileSelector.onclick = function () {
	filePicker.click();
};

filePicker.onchange = function (e) {
	let files = e.target.files;
	for (let i = 0; i < files.length; i++) {
		const audioFileReader = new FileReader();
		const file = files[i];
		let vAudio = new Audio();
		audioFileReader.onloadend = function () {
			const itemInfos = {};
			itemInfos.src = audioFileReader.result;
			jsmediatags.read(file, {
				onSuccess: (m) => {
					const t = m.tags;
					vAudio.src = itemInfos.src;
					itemInfos.title = t.title;
					itemInfos.artist = t.artist;
					itemInfos.album = t.album;
					itemInfos.picture = t.picture;
					itemInfos.pictureDataUrl = renderTrackCoverAsDataUrl(t.picture);
					itemInfos.id = playerOptions.songs.length;
					itemInfos.year = t.year;
					playerOptions.songs.push(itemInfos);
					items.innerHTML += createItem(itemInfos);
				},
				onError: (error) => {
					console.error(error);
				},
			});
		};
		audioFileReader.readAsDataURL(file);
	}
};

function renderTrackCoverAsDataUrl({ data, format }) {
	let dataStr = "";
	for (let i = 0; i < data.length; i++) {
		const element = data[i];
		dataStr += String.fromCharCode(element);
	}
	const dataUrl = `data:${format};base64,${window.btoa(dataStr)}`;
	return dataUrl;
}

function createItem({ title, artist, year, id, pictureDataUrl }) {
	return `<div class="item" id="item_${id}">
				<div class="item_main">
					<div class="item_cover" style="background-image:url(${pictureDataUrl})"></div>
					<div class="item_infos">
						<div class="item_title">${title}</div>
						<div class="item_extra">
							<span class="item_artist">
								<i class="fa fa-user"></i> ${artist}
							</span>
							<span class="item_duration">
								<i class="fa fa-calendar"></i>
								${year}
							</span>
						</div>
					</div>
				</div>
				<div class="item_actions">
					<button class="btn" onclick="javascript:playThis(${id})">
						<i class="fa fa-play"></i>
					</button>
					<button class="btn" onclick="javascript:deleteThis(${id})">
						<i class="fa fa-trash"></i>
					</button>
				</div>
			</div>`;
}

function playThis(id) {
	setPlayingInfo(playerOptions.songs[id]);
	currentPlaying = id;
	playPause.click();
}

function deleteThis(id) {
	if (currentPlaying == id) {
		if (!audioPlayer.paused) {
			playPause.click();
		}
		cover.style.backgroundImage = "url(../img/default.jpeg)";
		audioPlayer.src = "";
		title.innerText = "Aucun titre";
		album.innerText = "Aucun album";
		artist.innerText = "Aucun artiste";
	}
	document.getElementById("item_" + id).remove();
}

function setPlayingInfo(i) {
	cover.style.backgroundImage = `url(${i.pictureDataUrl})`;
	audioPlayer.src = i.src;
	title.innerText = i.title;
	album.innerText = i.album;
	artist.innerText = i.artist;
}

function renderDurationString(duration) {
	const d = Math.ceil(Number(duration));
	const s = d % 60;
	const m = (d - s) / 60;
	return m + ":" + (s < 10 ? "0" + s : s);
}
