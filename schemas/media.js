const fs = require("fs"),
    path = require("path");

const pathToMedias = path.resolve(__dirname, "../", "medias.json");

const find = () => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(pathToMedias))
            return reject({ status: 404, message: "Database not found" });

        return resolve(JSON.parse(fs.readFileSync(pathToMedias, "utf-8")));
    });
};

const findOne = (imdbID) => {
    return new Promise((resolve, reject) => {
        find()
            .then((medias) => {
                const media = medias.find((m) => m.imdbID === imdbID);

                if (!media)
                    return reject({ status: 404, message: "Media not found" });

                resolve(media);
            })
            .catch(reject);
    });
};

const set = (newArr) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(pathToMedias)) return reject("Database not found");

        fs.writeFileSync(
            pathToMedias,
            JSON.stringify(newArr, null, 4),
            "utf-8"
        );

        return resolve();
    });
};

const push = (media) => {
    return new Promise((resolve, reject) => {
        find()
            .then((medias) => {
                const doesExist = medias.find((m) => m.imdbID === media.imdbID);
                if (doesExist)
                    return reject({
                        status: 409,
                        message: "Media already exists",
                    });
                let newArr = [...medias, media];

                set(newArr)
                    .then(() => {
                        resolve(media);
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
};

const deleteOne = (imdbID) => {
    return new Promise((resolve, reject) => {
        find()
            .then((medias) => {
                let newArr = medias.filter((m) => m.imdbID !== imdbID);

                set(newArr).then(resolve).catch(reject);
            })
            .catch(reject);
    });
};

const updateOne = (imdbID, data) => {
    return new Promise((resolve, reject) => {
        find()
            .then((medias) => {
                let i = medias.findIndex((m) => m.imdbID === imdbID);

                if (i < 0)
                    return reject({ status: 404, message: "Media not found" });
                console.log(medias);

                medias[i] = { ...medias[i], ...data };

                set(medias).then(resolve).catch(reject);
            })
            .catch(reject);
    });
};

class Media {
    constructor(imdbID, title, year, type, poster) {
        this.imdbID = imdbID;
        this.title = title;
        this.year = year;
        this.type = type;
        this.poster = poster;
    }

    get() {
        return {
            imdbID: this.imdbID,
            Title: this.title,
            Year: this.year,
            Type: this.type,
            Poster: this.poster,
        };
    }
    save() {
        return new Promise((resolve, reject) => {
            push({
                ...this.get(),
            })
                .then(resolve)
                .catch(reject);
        });
    }
}

module.exports = { find, set, push, deleteOne, updateOne, findOne, Media };
