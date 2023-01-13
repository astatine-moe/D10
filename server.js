const express = require("express"),
    fs = require("fs"),
    bodyParser = require("body-parser"),
    path = require("path"),
    cors = require("cors"),
    morgan = require("morgan"),
    http = require("http"),
    env = process.env.NODE_ENV || "development";
const expressListRoutes = require("express-list-routes");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(morgan(env === "development" ? "dev" : "combined"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static(path.resolve(__dirname, "public")));
app.use("/", express.static(path.resolve(__dirname, "favicon")));
app.use(
    "/static/modules/jquery",
    express.static(path.resolve(__dirname, "node_modules/jquery/dist"))
);
app.use(
    "/static/modules/uikit",
    express.static(path.resolve(__dirname, "node_modules/uikit/dist"))
);

server.listen(3000);

async function* walk(dir) {
    //walk a directory to get all child folders
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}
var isWin = process.platform === "win32";
(async () => {
    //run async function when server.js is run
    let paths = [path.resolve(__dirname, "medias.json")];

    for (const path of paths) {
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify([]), "utf-8");
        }
    }

    for await (const p of walk("./routes/")) {
        const route = require(path.resolve(__dirname, p));
        let dirs;
        if (isWin) {
            dirs = p.split("\\");
        } else {
            dirs = p.split("/");
        }
        dirs.shift(); //remove base dir
        const fileName = dirs.pop(); //get filename;
        let routeName;
        if (fileName === "index.js") {
            routeName = `/${dirs.join("/")}`;
        } else {
            routeName = `/${dirs.join("/")}/${fileName.replace(".js", "")}`;
        }

        app.use(routeName, route);

        console.log(`Loaded route ${routeName}`);
    }

    console.log("Ready @ http://127.0.0.1:3000");
    console.table(expressListRoutes(app));
})();
