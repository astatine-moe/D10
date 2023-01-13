let curr = null;

$(function () {
    request
        .get(`/api/medias`)
        .then((medias) => {
            for (const media of medias) {
                const deleteButton = $("<button>");

                deleteButton
                    .addClass("uk-button uk-button-danger")
                    .attr("uk-icon", "trash")
                    .attr("title", "Delete media")
                    .attr("uk-tooltip", "")
                    .attr("data-id", media.imdbID)
                    .attr("data-action", "delete");
                let html = `<div class="item ${media.Type}" id="${
                    media.imdbID
                }">
                    <div class="uk-card uk-card-secondary uk-card-warning uk-card-body uk-flex uk-flex-column uk-flex-between uk-text-center">
                        <div>
                            <div class="card-img-container">
                                <img src="${media.Poster}" />
                            </div>
                            <h3 class="uk-card-title">${media.Title}</h3>
                            <p class="uk-text-meta">${media.Year} - ${
                    media.Type
                }</p>
                        </div>
                        <div>
                            <a class="uk-button uk-button-primary" title="Download PDF" uk-tooltip="" href="/api/medias/${
                                media.imdbID
                            }/pdf" uk-icon="file-pdf"></a>
                            <button class="uk-button uk-button-secondary" title="" uk-tooltip="Change Poster" uk-icon="image" data-action="change-poster" data-id="${
                                media.imdbID
                            }"></button>
                            ${deleteButton.prop("outerHTML")}
                        </div>
                    </div>
                </div>`;

                $("#cards").append(html);
            }

            $('[data-action="delete"]').on("click", function (e) {
                const id = $(this).data("id");
                UIkit.modal
                    .confirm("Are you sure you want to delete this?")
                    .then(
                        () => {
                            request
                                .delete("/api/medias/" + id)
                                .then((data) => {
                                    $("#" + id).remove();
                                })
                                .catch((err) => {
                                    UIkit.modal.alert(
                                        "Failed to delete " +
                                            id +
                                            ". Check console."
                                    );
                                    console.log(err);
                                });
                        },
                        () => {
                            console.log("reject");
                        }
                    );
            });
            $('[data-action="change-poster"]').on("click", function (e) {
                const id = $(this).data("id");
                console.log(id);

                curr = id;

                UIkit.modal("#poster").show();
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

let timeout;

$("#imdbid").on("keyup", function (e) {
    $('[data-action="save"]').prop("disabled", true);
    clearTimeout(timeout);
    const text = $(this).val().trim();

    if (!text) return;

    timeout = setTimeout(function () {
        //search
        request
            .get(`/api/imdb/${text}`)
            .then((data) => {
                if (data.status) {
                    $('[data-action="save"]').prop("disabled", false);
                    console.log(data);
                    UIkit.notification({
                        message: "Successfully fetched!",
                        status: "success",
                    });

                    $("#title").val(data.data.Title);
                    $("#year").val(data.data.Year);
                    $("#type").val(data.data.Type);
                    $("#poster").val(data.data.Poster);
                } else {
                    UIkit.notification({
                        message: data.err,
                        status: "danger",
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                UIkit.notification({
                    message: "Unknown error, check console",
                    status: "danger",
                });
            });
    }, 500);
});

$('[data-action="save"]').on("click", function () {
    const title = $("#title").val();
    const year = $("#year").val();
    const type = $("#type").val();
    const poster = $("#poster").val();
    const imdbID = $("#imdbid").val();

    if (!title || !year || !type || !poster || !imdbID)
        return UIkit.notification({
            message: "All fields need to be filled",
            status: "danger",
        });

    request
        .post("/api/medias", {
            title,
            year,
            type,
            poster,
            imdbID,
        })
        .then((data) => {
            if (data.err) {
                console.log(data.err);
                UIkit.notification({
                    message: "Unknown error, check console",
                    status: "danger",
                });
            } else {
                location.reload();
            }
        })
        .catch((err) => {
            console.log(err);
            UIkit.notification({
                message: "Unknown error, check console",
                status: "danger",
            });
        });
});

document.querySelector("#image").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();

    formData.append("image", file, file.name);

    await fetch("/api/medias/" + curr + "/poster", {
        method: "POST",
        body: formData,
    });
    location.reload();
});
