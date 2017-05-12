#!/usr/bin/env bash

mv ./build/1.1.0/svga.jsx ./source/com.zhan.SVGAConverter/jsx

cd ./source/ZXPSignCmd/

rm ../../build/1.1.0/SVGAConverter.zxp

./ZXPSignCmd  -sign  "../com.zhan.SVGAConverter"  "../../build/1.1.0/SVGAConverter.zxp"  "./errnull.p12"  "zhan"

cp -f ../../build/1.1.0/SVGAConverter.zxp ../../windows

cp -f ../../build/1.1.0/SVGAConverter.zxp ../../mac
