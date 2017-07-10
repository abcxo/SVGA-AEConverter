var alertMessage = function (message) {
    alert(message);
}

var confirmMessage = function (message) {
    return confirm(message);
}

function searchCompositionDestination() {

    var uri;

    uri = app.project.file.path + app.project.activeItem.name;
    uri += '.svga';

    var f = new File(uri);
    var saveFileData = f.saveDlg();
    if (saveFileData !== null) {

        var compositionDestinationData = {
            absoluteURI: saveFileData.absoluteURI,
            destination: saveFileData.fsName,
            // id: id
        }

        return compositionDestinationData.destination;
    }
    f.close();
}

//Opens folder where json is rendered
function browseFolder() {
    var uri;

    uri = Folder.desktop.absoluteURI;

    var f = new File(uri);
    var openFileData = f.openDlg();

    if (openFileData !== null) {

        var compositionDestinationData = {
            absoluteURI: openFileData.absoluteURI,
            destination: openFileData.fsName,
            // id: id
        }

        return compositionDestinationData.destination;
    }
    f.close();
}
