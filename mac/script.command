#!/bin/bash
cd ${0%/*}
ls ../svga_works/*.png00000 |awk -F "00000" '{print "mv "$0" "$1$2""}'|bash
./pngquant ../svga_works/* --ext=.png --force
zip -q -r -j ../output.svga ../svga_works/*
rm -rf ../svga_works