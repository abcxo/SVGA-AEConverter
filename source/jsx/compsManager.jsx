var alertMessage = function (message) {
    alert(message);
}

var confirmMessage = function (message) {
    return confirm(message);
}

function getActiveInfo() {

    app.project.save();
    var path = app.project.file.fsName + '_and_' + app.project.activeItem.name;
    return path;
}

function correctMessage(path) {

    var file = new File(path)
    app.project.save(file)
    app.open(file)

    var myItems = app.project.items;

    if(app.project.activeItem.workAreaDuration != app.project.activeItem.duration){
        var newDuration = parseFloat(app.project.activeItem.workAreaStart.toFixed(2)) + parseFloat(app.project.activeItem.workAreaDuration.toFixed(2));
        if (confirmMessage("动画时长与工作区时长不同。                                                                               是否按照工作区将动画时长设置为：" + newDuration + "  秒 ？")){
            app.project.activeItem.duration = newDuration;
        }
    }

    var legalFPS = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60];
    var lastSum = 0;
    var lastCorrectSum = 0;

    for (var i = 1; i <= myItems.length; i++) {
        if (myItems[i] instanceof CompItem) {
            // $.writeln("i="+i+"---"+"lastSum="+lastSum + "lastCorrectSum=" + lastCorrectSum);
            // $.writeln("frameRate:" + myItems[i].frameRate);
            if (myItems[i].frameRate > 60 || (60 % myItems[i].frameRate) == 0) continue;
            if (i != 0 && myItems[i].frameRate == lastSum) {
                myItems[i].frameRate = lastCorrectSum;
                // $.writeln("-------comtinue");
                continue;
            }
            for (var j = 1; j < legalFPS.length; j++) {
                if (legalFPS[j] > myItems[i].frameRate) {
                    lastSum = myItems[i].frameRate;
                    if (Math.abs(legalFPS[j - 1] - i) > Math.abs(legalFPS[j] - i)) {
                        // $.writeln("set FPS:" + legalFPS[j]);
                        myItems[i].frameRate = legalFPS[j];
                        lastCorrectSum = legalFPS[j];
                    } else {
                        // $.writeln("set FPS:" + legalFPS[j - 1])
                        myItems[i].frameRate = legalFPS[j - 1];
                        lastCorrectSum = legalFPS[j - 1];
                    }
                    break;
                }
            }
        }
    }
    app.project.save();
}

function openProject(path) {

    app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
    app.open(new File(path));
}

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
