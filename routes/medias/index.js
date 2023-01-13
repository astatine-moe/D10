const express = require("express"),
    multer = require("multer"),
    PdfPrinter = require("pdfmake"),
    axios = require("axios"),
    upload = multer({ dest: "uploads/" }),
    fs = require("fs"),
    router = express.Router(),
    { ImgurClient } = require("imgur"),
    { pipeline } = require("stream");

const printer = new PdfPrinter({
    Roboto: {
        normal: "Helvetica",
        bold: "Helvetica",
        italics: "Helvetica",
    },
});

const client = new ImgurClient({ clientId: process.env.IMGUR_CLIENT });
const media = require("../../schemas/media");
const { Media } = media;

router.get("/", (req, res) => {
    media
        .find()
        .then((medias) => {
            res.send(medias);
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
router.get("/:imdbID", (req, res) => {
    const { imdbID } = req.params;

    media
        .findOne(imdbID)
        .then((m) => {
            res.send(m);
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
router.get("/:imdbID/pdf", (req, res) => {
    const { imdbID } = req.params;

    media
        .findOne(imdbID)
        .then(async (m) => {
            //download poster as base64 using axios
            let image = await axios.get(m.Poster, {
                responseType: "arraybuffer",
            });
            let b64 = Buffer.from(image.data).toString("base64");

            const blob = `data:image/png;base64,${b64.toString()}`;

            const dd = {
                content: [
                    {
                        image: blob,
                        margin: [0, 20],
                        fit: [100, 100],
                        alignment: "center",
                    },
                    {
                        text: m.Title,
                        style: "header",
                        alignment: "center",
                    },
                    {
                        text: [
                            { text: m.Year, italics: true },
                            " - ",
                            { text: m.Type, italics: true },
                        ],
                        alignment: "center",
                    },
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                    },
                },
            };
            var pdfDoc = printer.createPdfKitDocument(dd, {});
            pdfDoc.pipe(fs.createWriteStream("document.pdf"));
            pdfDoc.end();

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=test.pdf"
            );
            pipeline(pdfDoc, res, (err) => {
                if (err) {
                    console.log(err);
                }
            });
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

router.post("/", async (req, res) => {
    const { title, year, imdbID, type, poster } = req.body;

    if (!title || !year || !imdbID || !type || !poster)
        return res.status(400).send({ err: "Missing required fields" });

    const m = new Media(imdbID, title, year, type, poster);

    m.save()
        .then((newMedia) => {
            res.send(newMedia);
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
router.post("/:imdbID/poster", upload.single("image"), (req, res) => {
    const { imdbID } = req.params;
    const { path: filepath } = req.file;

    //if exists, upload to imgur
    media
        .findOne(imdbID)
        .then(async (m) => {
            //exists, let's upload to imgur
            const response = await client.upload({
                image: fs.createReadStream(filepath),
                type: "stream",
            });

            const { id, link, deletehash } = response.data;

            const newMedia = { ...m, Poster: link };

            media
                .updateOne(imdbID, newMedia)
                .then(() => {
                    res.send(newMedia);
                })
                .catch((err) => {
                    if (err.status) {
                        res.status(err.status).send({ err: err.message });
                    } else {
                        console.log(err);
                        res.status(500).send(err);
                    }
                });
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
