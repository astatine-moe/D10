const express = require("express"),
    router = express.Router();

const axios = require("axios").default;

const key = process.env.OMDB_KEY;

const media = require("../../../schemas/media");

router.get("/:imdbid", (req, res) => {
    const { imdbid } = req.params;

    axios
        .get(`http://www.omdbapi.com/?apikey=${key}&i=${imdbid}`)
        .then(({ data }) => {
            const { Response } = data;

            if (Response === "True") {
                res.send({ status: true, data });
            } else {
                res.status(500).send({ status: false, err: data.Error });
            }
        })
        .catch((err) => {
            res.status(500).send({ err: "Error fetching from OMDB" });
        });
});

router.post("/search", (req, res) => {
    const { search } = req.body;
    console.log(req.body);

    media
        .find()
        .then((medias) => {
            const results = medias.filter((m) => m.Title.includes(search));

            if (results.length) {
                res.send(results[0]);
            } else {
                //no results locally, try the API
                const url = `http://www.omdbapi.com/?apikey=${key}&t=${encodeURIComponent(
                    search.trim().toLowerCase()
                )}`;
                console.log(url);
                axios
                    .get(url)
                    .then(({ data }) => {
                        const { Response } = data;

                        if (Response === "True") {
                            //we got em
                            const newItem = {
                                Title: data.Title,
                                Year: data.Year,
                                Type: data.Type,
                                Poster: data.Poster,
                                imdbID: data.imdbID,
                            };

                            media.push(newItem).then((m) => {
                                res.send(newItem);
                            });
                        } else {
                            console.log(data.Error);
                            res.status(500).send({
                                status: false,
                                err: data.Error,
                            });
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send({
                            status: false,
                            err: err,
                        });
                    });
            }
        })
        .catch((err) => {
            if (err.status) {
                res.status(err.status).send({ err: err.message });
            } else {
                console.log(err);
                res.status(500).send(err);
            }
        });
});

module.exports = router;
