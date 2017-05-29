#!/usr/bin/env bash

mkdir ./build/com.errnull.SVGAConverter_AE

cp -r ./source/CSXS ./build/com.errnull.SVGAConverter_AE
cp -r ./source/index.html ./build/com.errnull.SVGAConverter_AE
cp -r ./source/jsx ./build/com.errnull.SVGAConverter_AE
cp -r ./source/src ./build/com.errnull.SVGAConverter_AE

mv ./build/1.1.0/svga.jsx ./build/com.errnull.SVGAConverter_AE/jsx

cd ./source/ZXPSignCmd/

rm ../../build/1.1.0/SVGAConverter_AE.zxp

./ZXPSignCmd  -sign  "../../build/com.errnull.SVGAConverter_AE"  "../../build/1.1.0/SVGAConverter_AE.zxp"  "./errnull.p12"  "zhan"

cp -f ../../build/1.1.0/SVGAConverter_AE.zxp ../../windows

cp -f ../../build/1.1.0/SVGAConverter_AE.zxp ../../mac

rm -rf ../../build/com.errnull.SVGAConverter_AE
