#!/usr/bin/env bash

rm -rf ./updateInfo

varv=v
dated=$(date +%Y%m%d%H%M)
updateInfo=${varv}${dated}

echo "$updateInfo" >> updateInfo

rm -rf ./bin/com.errnull.SVGAConverter_AE

mkdir ./build/com.errnull.SVGAConverter_AE

cp -r ./source/CSXS ./build/com.errnull.SVGAConverter_AE
cp -r ./source/index.html ./build/com.errnull.SVGAConverter_AE
cp -r ./source/jsx ./build/com.errnull.SVGAConverter_AE
cp -r ./source/src ./build/com.errnull.SVGAConverter_AE
cp -r ./source/pngquant ./build/com.errnull.SVGAConverter_AE
cp -r ./source/node_modules ./build/com.errnull.SVGAConverter_AE
cp -f ./updateInfo ./build/com.errnull.SVGAConverter_AE

mv ./build/1.1.0/svga.jsx ./build/com.errnull.SVGAConverter_AE/jsx

cd ./source/ZXPSignCmd/

rm ../../build/1.1.0/SVGAConverter_AE.zxp

./ZXPSignCmd  -sign  "../../build/com.errnull.SVGAConverter_AE"  "../../build/1.1.0/SVGAConverter_AE.zxp"  "./errnull.p12"  "zhan"

cp -f ../../build/1.1.0/SVGAConverter_AE.zxp ../../mac
cp -f ../../build/1.1.0/SVGAConverter_AE.zxp ../../windows

cd ../../windows/
mkdir ./SVGAConverter_AE
mkdir ./SVGAConverter_AE/others

cp -f ../install.exe ./SVGAConverter_AE
cp -f ../install.bat ./SVGAConverter_AE/others
cp -f ../modify.reg ./SVGAConverter_AE/others
cp -f ../IMSLib.dll ./SVGAConverter_AE/others


unzip -o -d ./SVGAConverter_AE/sources/ ./SVGAConverter_AE.zxp
zip -r ./SVGAConverter_AE.zip ./SVGAConverter_AE/*

rm -rf ./SVGAConverter_AE
rm -rf ../build/com.errnull.SVGAConverter_AE
