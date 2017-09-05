var csInterface = new CSInterface();
var nodePath = require("path");
var fs = require('fs');
var spawn = require("child_process");
var request = require('request');
var unzip = require("unzip");

var outPutPath;
var inputPath;

var player;
var parser;

var workPath;

var CURRENT_SOURCE_PATH;
var CURRENT_SOURCE_NAME;
var CURRENT_FILE_PATH;
var CURRENT_PROJECT_PATH = csInterface.getSystemPath(SystemPath.APPLICATION);
var TEMP_SOURCE_PATH = nodePath.join(csInterface.getSystemPath(SystemPath.MY_DOCUMENTS), '_WORKINGTEMP_');

// 关闭窗口的时候关闭服务器
window.onunload = function()
{
    // 删除临时文件目录
    deleteFlider(TEMP_SOURCE_PATH, true, true, function () {});
}

function updateInfo(callback) {
    csInterface.evalScript("getActiveInfo()", function (result) {

        var infoArr = result.split('_and_');
        CURRENT_FILE_PATH = infoArr[0];
        var pathArr = infoArr[0].split(nodePath.sep);
        pathArr.pop();
        CURRENT_SOURCE_PATH = pathArr.join(nodePath.sep);
        CURRENT_SOURCE_NAME = infoArr[1];

        callback();
    });
}

function selectPath() {

    updateInfo(function () {
        var result = window.cep.fs.showSaveDialogEx ("选择保存目录", CURRENT_SOURCE_PATH, ["svga"], CURRENT_SOURCE_NAME + '.svga', '');

        if (result.data){
            outPutPath = result.data;

            var startConvertBtn = document.getElementById("startConvertBtn");
            startConvertBtn.disabled = false;
        }
    });
}

function startConvert() {

    if(outPutPath == null || outPutPath == undefined || outPutPath == ''){
        alertMessages("请先选择输出路径...");

    }else {
        createTempFolder(function () {
            var startConvertBtn = document.getElementById("startConvertBtn");
            startConvertBtn.disabled = true;

            var tempPath =  nodePath.join(TEMP_SOURCE_PATH, 'Temp.aep');
            var OSVersion = csInterface.getOSInformation();
            if (OSVersion.indexOf("Windows") >= 0){

                tempPath =  tempPath.split("\\").join("\\\\");
                CURRENT_FILE_PATH =  CURRENT_FILE_PATH.split("\\").join("\\\\");
            }
            csInterface.evalScript("correctMessage('"+ tempPath +"');", function (result) {

                csInterface.evalScript("startConvert('"+nodePath.join(TEMP_SOURCE_PATH, 'svga_works') +"');", function (result) {

                    csInterface.evalScript("openProject('"+ CURRENT_FILE_PATH +"');");
                    var imagePath = result;
                    workPath = result;

                    //获取图片资源列表
                    fs.readdir(imagePath, function(err,files){

                        for (var i = 0; i < files.length; i++) {
                            if(files[i] == "movie.spec"){
                                files.splice(i, 1);
                            }
                        }
                        var imageList = files;
                        copyToZip(imagePath, imageList);
                    });
                });
            });

        });
    }
}

function selectFile() {

    csInterface.evalScript("browseFolder()", function (result) {

        if (result != 'undefined'){
            inputPath = result;

            preview(result);
        }
    });
}

function createTempFolder(callback) {

    // 删除临时文件目录
    deleteFlider(TEMP_SOURCE_PATH, true, true, function () {

        // 创建 temp 文件夹
        fs.mkdir(TEMP_SOURCE_PATH, function () {
            callback();
        });
    });
}

function preview(filePath) {

    var fileName = filePath;

    var file = window.cep.fs.readFile(fileName, "Base64");

    parser.load("data:image/svga;base64," + file.data, function (videoItem) {

        previewWithVideoItems(videoItem);
    });
}

function previewWithVideoItems(videoItem) {
    var scale = 1;
    var moveX = 0;
    var moveY = 0;

    if (videoItem.videoSize.width <= 400 && videoItem.videoSize.height <= 400){

    }else{

        if (videoItem.videoSize.width > videoItem.videoSize.height){

            moveY = (400 - (videoItem.videoSize.height / videoItem.videoSize.width) * 400) / 2;

        }else{

            scale = (videoItem.videoSize.width / videoItem.videoSize.height);
            moveX = ((400 - 400 * scale)) / 2;
        }
    }

    player.setVideoItem(videoItem);
    player._stageLayer.setTransform(moveX, moveY, scale, scale);

    player.startAnimation();
}

function copyToZip(zipPath, imageList) {
    var zip = new JSZip();

    // 判断是否有图片
    if (imageList.length){

        stepToZip(zip, 0, imageList, zipPath);
    }else{

        // 没有图片
        var movin = window.cep.fs.readFile(zipPath + '/movie.spec', 'Base64');

        var movinUTF8 = cep.encoding.convertion.b64_to_utf8(movin.data);

        zip.file("movie.spec", movinUTF8);

        zip.generateAsync({ type: "Base64", compression: "DEFLATE" })
            .then(function(content) {

                // 将文件写入本地
                fs.writeFile(outPutPath, content, 'Base64', function (err) {

                    // 删除 temp 目录
                    deleteFlider(TEMP_SOURCE_PATH, true, true, function () {});
                    preview(outPutPath);
                    outPutPath = undefined;
                });
            });
    }
}

function stepToZip(zip, currentIndex, imageList, zipPath, callback) {

    var  imageName = imageList[currentIndex].toString();
    var imagePath = nodePath.join(zipPath, imageName);

    var pngquantAndZip = function (imagePath) {

        pngquantImage(imagePath, imagePath, function () {

            waitForFileIfExist(imagePath, function () {

                fs.readFile(imagePath, 'Base64', function (err, data) {

                    zip.file(imageName, data, {base64: true});

                    if (currentIndex == imageList.length - 1){

                        var movin = window.cep.fs.readFile(zipPath + '/movie.spec', 'Base64');

                        var movinUTF8 = cep.encoding.convertion.b64_to_utf8(movin.data);

                        zip.file("movie.spec", movinUTF8);

                        zip.generateAsync({ type: "Base64", compression: "DEFLATE" })
                            .then(function(content) {

                                // 将文件写入本地
                                fs.writeFile(outPutPath, content, 'Base64', function (err) {

                                    deleteFlider(TEMP_SOURCE_PATH, true, true, function () {});
                                    preview(outPutPath);
                                    outPutPath = undefined;

                                });
                            });

                    }else {
                        stepToZip(zip, ++currentIndex, imageList, zipPath);
                    }
                });
            });
        });
    };

    // 判断照片中是否有 jpg 图片
    if (imageName.split('.').pop() == 'jpg'){

        convertJPGToPNG(imagePath, null, pngquantAndZip(imagePath));

    }else if (imageName.split('.').pop() == 'png'){

        pngquantAndZip(imagePath);
    }else {

        if (currentIndex == imageList -1){
            var movin = window.cep.fs.readFile(zipPath + '/movie.spec', 'Base64');

            var movinUTF8 = cep.encoding.convertion.b64_to_utf8(movin.data);

            zip.file("movie.spec", movinUTF8);

            zip.generateAsync({ type: "Base64", compression: "DEFLATE" })
                .then(function(content) {

                    // 将文件写入本地
                    fs.writeFile(outPutPath, content, 'Base64', function (err) {

                        deleteFlider(TEMP_SOURCE_PATH, true, true, function () {});
                        preview(outPutPath);
                        outPutPath = undefined;

                    });
                });
        }else {
            stepToZip(zip, ++currentIndex, imageList, zipPath);
        }
    }

}

function deleteFlider(path, isFirstFolder, delFirstFolder, callback) {

    if(fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {

            var curPath = nodePath.join(path, file);
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFlider(curPath, false, true);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        if (!isFirstFolder || delFirstFolder) {
            fs.rmdirSync(path);
        }
    }
    if (isFirstFolder){
        callback();
    }
}

function waitForFileIfExist(filePath, callback) {

    // 判断是否有这个文件
    fs.exists(filePath, function(exists) {
        if (exists){
            callback();
        }else{
            // 如果没有 500 ms 后重新查看
            setTimeout("waitForFileIfExist(filePath, callback)", 500);
        }
    });
}

function convertJPGToPNG(imageInputPath, imageOutputPath, callback) {

    var img = new Image();
    img.onload = function () {

        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);

        if (imageOutputPath == null){

            callback(canvas.toDataURL("image/png").split(',').pop(), nodePath.basename(result, '.jpg'));

        }else{
            fs.writeFile(imageOutputPath, canvas.toDataURL("image/png").split(',').pop(), "Base64", function (err) {
                callback(imageOutputPath);
            });
        }
    };
    img.src = imageInputPath;

}

function pngquantImage(inImgPath, outImgPath, callback) {

    var program;

    // 判断当前系统
    var OSVersion = csInterface.getOSInformation();
    if (OSVersion.indexOf("Windows") >= 0) {

        program = nodePath.join(CURRENT_PROJECT_PATH, 'pngquant', 'WINDOWS', 'pngquant.exe');
        program = '\"' + program + '\"';

    } else if (OSVersion.indexOf("Mac") >= 0) {

        program = nodePath.join(CURRENT_PROJECT_PATH, 'pngquant', 'OSX', 'pngquant').replace('Application ', 'Application\\ ');
    }

    var args = [

        '--quality=0-100',
        '--speed 2',
        inImgPath,
        '--output',
        outImgPath,
        '--force'
    ];

    spawn.exec(program + ' ' + args.join(' '), function () {
        callback();
    });
}
