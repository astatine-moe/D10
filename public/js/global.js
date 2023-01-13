const uri = `http://127.0.0.1:1000`;

const opts = {};

const request = {
    get: (url) => {
        return new Promise((resolve, reject) => {
            fetch(url, { ...opts })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    },
    post: (url, data) => {
        return new Promise((resolve, reject) => {
            fetch(url, {
                headers: {
                    ...opts.headers,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(data),
            })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    },
    put: (url, data) => {
        return new Promise((resolve, reject) => {
            fetch(url, {
                headers: {
                    ...opts.headers,
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify(data),
            })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    },
    delete: (url) => {
        return new Promise((resolve, reject) => {
            fetch(url, {
                ...opts,
                method: "DELETE",
            })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    },
};

$("#search2").on("keyup", function (e) {
    console.log(e.key);
    if (e.key === "Enter") {
        request
            .post("/api/imdb/search", {
                search: $("#search2").val(),
            })
            .then((data) => {
                if (data.err) {
                    UIkit.notification({
                        message: "Could not find media",
                        status: "danger",
                    });
                } else {
                    window.location.href = `/media/${data.imdbID}`;
                }
            })
            .catch((err) => {
                console.log(err);
                UIkit.notification({
                    message: "Could not find media",
                    status: "danger",
                });
            });
    }
});
