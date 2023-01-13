const express = require("express"),
    router = express.Router();

const media = require("../schemas/media");

router.get("/", (req, res) => {
    res.render("index", {
        link: "/",
    });
});

router.get("/admin", (req, res) => {
    res.render("admin", {
        link: "/admin",
    });
});

router.get("/media/:id", (req, res) => {
    media
        .findOne(req.params.id)
        .then((m) => {
            res.render("media", {
                link: "/media",
                media: m,
            });
        })
        .catch((err) => {
            res.redirect("/");
        });
});

module.exports = router;
