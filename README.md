# SVGA-AEConverter

本工具适用于 After Effects CC 系列，使用本工具可以将 AEP 文件转换为 SVGA 文件。

## 用法

clone 或 download 仓库

### windows

* 将 windows 目录复制到 aep 文件夹下；
* 打开 After Effects；
* 选择 菜单 > 文件 > 脚本 > 运行脚本文件；
* 选择刚才复制到的 windows 下的 svga.jsx 文件；
* 稍等片刻， aep 目录下就会出现 svga_works 文件夹；
* 打开 windows 目录，双击 script.bat 执行转换程序；
* 稍等片刻， aep 目录下就会出现 output.svga 文件，此文件即为最终 SVGA 源文件。

### mac 
* 将 mac 目录复制到 aep 文件夹下；
* 打开 After Effects；
* 选择 菜单 > 文件 > 脚本 > 运行脚本文件；
* 选择刚才复制到的 mac 下的 svga.jsx 文件；
* 稍等片刻， aep 目录下就会出现 svga_works 文件夹；
* 打开 mac 目录，双击 script.command（如果出现权限问题，先执行 sudo chmod 777 script.command）执行转换程序；
* 稍等片刻， aep 目录下就会出现 output.svga 文件，此文件即为最终 SVGA 源文件。

## 测试

要测试生成文件是否可以正常使用，使用浏览器，打开 http://legox.yy.com/svga/svgaplayer/ ，选择或拖入 SVGA 源文件，即可预览动画效果。