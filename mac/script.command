#!/bin/bash
cd ${0%/*}
./pngquant ../svga_works/* --ext=.png --force
zip -q -r -j ../output.svga ../svga_works/*
rm -rf ../svga_works