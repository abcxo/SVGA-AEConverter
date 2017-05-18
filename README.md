# SVGA-AEConverter

本工具适用于 After Effects CC 系列，使用本工具可以将 AEP 文件转换为 SVGA 文件。

## 用法

clone 或 download 仓库
在项目目录下使用命令行：

```
$ npm install
$ npm start
```


### windows

* 安装 windows/ZXPInstaller.Setup.exe;
* 打开安装后的 ZXPInstaller;
* 将 windows/SVGAConverter.zxp 拖进 ZXPInstaller 安装插件;
* 打开 After Effects 将 **被转换文件** 保存;
* 选择菜单 > 窗口 > 扩展 > SVGAConverter_AE;
* 选择 输出路径 > 开始转换 稍等片刻，svga 文件就会生成在您所输出的目录并开始播放;
* 您也可以直接点击 选择播放文件 直接播放本地的 *.svga文件;
* 使用鼠标右键可以 开始/暂停播放。

### mac 
* 安装 mac/ZXPInstaller;
* 打开安装后的 ZXPInstaller;
* 将 mac/SVGAConverter.zxp 拖进 ZXPInstaller 安装插件;
* 打开 After Effects 将 **被转换文件** 保存;
* 选择菜单 > 窗口 > 扩展 > SVGAConverter_AE;
* 选择 输出路径 > 开始转换 稍等片刻，svga 文件就会生成在您所输出的目录并开始播放;
* 稍等片刻， aep 目录下就会出现 output.svga 文件，此文件即为最终 SVGA 源文件。
* 您也可以直接点击 选择播放文件 直接播放本地的 *.svga文件;
* 使用鼠标右键可以 开始/暂停播放。

## 测试

要测试生成文件是否可以正常使用：
1. 使用 菜单 > 窗口 > 扩展 > SVGAConverter_AE 直接播放本地 svga 文件;
2. 使用浏览器，打开 http://legox.yy.com/svga/svgaplayer/ ，选择或拖入 SVGA 源文件，即可预览动画效果。
