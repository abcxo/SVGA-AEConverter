var csInterface = new CSInterface();

var outPutPath;
var inputPath;

var player;
var parser;

function selectPath() {

    csInterface.evalScript("searchCompositionDestination()", function (result) {

        if (result != 'undefined'){
            outPutPath = result;

            var startConvertBtn = document.getElementById("startConvertBtn");
            startConvertBtn.disabled = false;
        }
    });
}

function startConvert() {

    if(outPutPath == null || outPutPath == undefined || outPutPath == ''){
        alert("请先选择输出路径...");

    }else {
        var startConvertBtn = document.getElementById("startConvertBtn");
        startConvertBtn.disabled = true;

        csInterface.evalScript("startConvert('"+outPutPath +"');", function (result) {

            var imagePath = result;

            //获取图片资源列表
            csInterface.evalScript("getImageList();", function (result) {
                var imageList = JSON.parse(result);

                copyToZip(imagePath, imageList);
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

    if (videoItem.videoSize.width > videoItem.videoSize.height){

        scale = (videoItem.videoSize.height / videoItem.videoSize.width);
        moveY = ((400 - 400 * scale)) / 2;

    }else{

        scale = (videoItem.videoSize.width / videoItem.videoSize.height);
        moveX = ((400 - 400 * scale)) / 2;
    }

    player.setVideoItem(videoItem);
    player._stageLayer.setTransform(moveX, moveY, scale, scale);

    player.startAnimation();
}

function copyToZip(zipPath, imageList) {
    var zip = new JSZip();

    //判断是否有图片
    if (imageList.length){

        for (var item in imageList){

            var filename = zipPath + '/' + imageList[item];

            var imgFile = window.cep.fs.readFile(filename ,"Base64");

            var data = dataURLtoUint8(imgFile.data);

            var compressedData = pngquant(data, { quality: "0-100", speed: "2" }, function (message) {
            });
            var compressedBlob = new Blob([compressedData.data.buffer]);

            zip.file(imageList[item], compressedBlob);

            //删除本地文件
            window.cep.fs.deleteFile(filename);
        }
    }

    var movin = window.cep.fs.readFile(zipPath + '/movie.spec', 'Base64');

    var movinUTF8 = cep.encoding.convertion.b64_to_utf8(movin.data);

    zip.file("movie.spec", movinUTF8);

    window.cep.fs.deleteFile(zipPath + '/movie.spec', 'Base64');
    require("fs").rmdir(zipPath, function (err) {});

    zip.generateAsync({type:"Base64"})
        .then(function(content) {
            window.cep.fs.writeFile (outPutPath, content, "Base64");

            preview(outPutPath);
            outPutPath = undefined;
        });
}

function dataURLtoUint8(dataurl) {

    var bstr = atob(dataurl);

    var  n = bstr.length;

    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr;
}