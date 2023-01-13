$(function () {
    request
        .get(`/api/medias`)
        .then((medias) => {
            const movies = medias
                .filter((m) => m.Type === "movie")
                .sort((a, b) => 0.5 - Math.random())
                .slice(0, 20);
            const series = medias
                .filter((m) => m.Type === "series")
                .sort((a, b) => 0.5 - Math.random())
                .slice(0, 20);
            const games = medias
                .filter((m) => m.Type === "game")
                .sort((a, b) => 0.5 - Math.random())
                .slice(0, 20);

            const arr = [
                { arr: movies, id: "movies" },
                { arr: series, id: "series" },
                { arr: games, id: "games" },
            ];

            for (const list of arr) {
                let html = ``;
                for (const media of list.arr) {
                    html += `<li>
                    <a class="uk-panel" title="${media.Title}" uk-tooltip href="/media/${media.imdbID}">
                        <img src="${media.Poster}" />
                    </a>
                </li>`;
                }
                $(`#${list.id}`).html(html);
            }
        })
        .catch((err) => {
            console.log(err);
        });
});
