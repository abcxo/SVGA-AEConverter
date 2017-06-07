regedit /s ./others\modify.reg

del /s/q "C:\Program Files\Common Files\Adobe\CEP\extensions\com.errnull.SVGAConverter_AE"

mkdir "C:\Program Files\Common Files\Adobe\CEP\extensions\com.errnull.SVGAConverter_AE"

xcopy/s/q .\sources\*  "C:\Program Files\Common Files\Adobe\CEP\extensions\com.errnull.SVGAConverter_AE"


del /s/q "C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.errnull.SVGAConverter_AE"

mkdir "C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.errnull.SVGAConverter_AE"

xcopy/s/q .\sources\*  "C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.errnull.SVGAConverter_AE"
