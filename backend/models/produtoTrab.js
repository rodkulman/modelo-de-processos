const path = "/produtoTrabalho";

function validaBody(reqBody, allGoodCallback, notGoodCallback) {
    if (reqBody.nome == null) {
        notGoodCallback('nome não informado');
    } else {
        allGoodCallback();
    }
}

function montaJson(reqBody) {
    return { nome: reqBody.nome };
}

module.exports = {
    init: function (db, app, gcs) {
        var ref = db.ref('/produtoTrab');
        var transform = require('./../transform.js');
        var fs = require('fs');

        app.get(path, function (req, res) {
            ref.once('value', function (snapshot) {
                res.send(transform.toArray(snapshot.val()));
            });
        });

        app.get(path + "/:key", function (req, res) {
            ref.child(req.params.key).once('value', function (snap) {
                var obj = snap.val();

                if (obj == null) {
                    res.status(404).send();
                } else {
                    res.send(obj);
                }
            });
        });

        app.post(path, function (req, res) {
            validaBody(req.body, () => ref.push(montaJson(req.body)).then(snap => res.status(201).send(snap.key)), error => res.status(400).send(error));
        });

        app.post(path + "/:key", function (req, res) {
            ref.once('value', function (snap) {
                if (!snap.hasChild(req.params.key)) {
                    res.status(404).send();
                } else {
                    // fs.readFile(req.files.template.path, (err, data) => {
                    //     var bucket = gcs.bucket('produtoTrab');                        
                    //     storage.child(req.params.key).put(data, req.files.template.type).then(storageSnap => {
                    //         var updloadInfo = { "template": storageSnap.metadata.downloadURLs[0] };
                    //         ref.child(req.params.key).update(updloadInfo).then(() => res.status(200).send(updloadInfo.template));
                    //     }).catch(error => res.status(400).send(error));
                    // });

                    res.status(400).send('Não implementado');
                }
            });
        });

        app.put(path + "/:key", function (req, res) {
            validaBody(req.body, function () {
                ref.once('value', function (snap) {
                    if (!snap.hasChild(req.params.key)) {
                        res.status(404).send();
                    } else {
                        ref.child(req.params.key).set(montaJson(req.body)).then(() => res.status(200).send())
                    }
                });
            }, error => res.status(400).send(error));
        });

        app.delete(path + "/:key", function (req, res) {
            ref.once('value', function (snap) {
                if (!snap.hasChild(req.params.key)) {
                    res.status(404).send();
                } else {
                    ref.child(req.params.key).remove().then(() => res.status(200).send())
                }
            });
        });
    }
}
