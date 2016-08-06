pngquant.exe ../svga_works/* --ext=.png --force
zip.exe -q -r -j ../output.svga ../svga_works/*
rmdir /s /q ../svga_works