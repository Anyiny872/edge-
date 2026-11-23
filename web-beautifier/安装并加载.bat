@echo off
chcp 65001 >nul
title 网页美化师 · 一键加载安装
setlocal

set "EXTDIR=C:\Users\Administrator\Documents\deepseek-harness\default-workspace\web-beautifier"

echo ============================================================
echo  网页美化师 WebBeautifier - 浏览器扩展加载助手
echo ============================================================
echo  扩展目录: %EXTDIR%
echo  检测到的浏览器:
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe"  echo    [1] Google Chrome
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" echo    [2] Microsoft Edge
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe"  echo    [2] Microsoft Edge
echo.
echo  方式A: 直接带参启动（自动加载，重启浏览器后失效，适合快速体验）
echo  方式B: 打开扩展管理页，手动加载（永久生效，需点一次"开发者模式"）
echo.
set /p CHOICE=  请选择方案编号 (A 或 B) 或直接回车用A:
if /i "%CHOICE%"=="B" goto planB
goto planA

:planA
echo  正在用 Chrome 启动并加载扩展...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --load-extension="%EXTDIR%"
    echo  Chrome 已启动，扩展已自动加载。请在地址栏访问任意网页查看美化效果。
    echo  提示：工具栏会出现一个 ✦ 图标，点它可打开控制面板。
    goto done
)
echo  未找到 Chrome，尝试 Edge...
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --load-extension="%EXTDIR%"
    echo  Edge 已启动，扩展已自动加载。
    goto done
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --load-extension="%EXTDIR%"
    echo  Edge 已启动，扩展已自动加载。
    goto done
)
echo  没有找到支持的浏览器。
goto done

:planB
echo  正在打开 Chrome 扩展管理页...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "chrome://extensions/"
    echo  请在新开的页面里：
    echo    1) 打开右上角"开发者模式"
    echo    2) 点击"加载已解压的扩展程序"
    echo    3) 选择文件夹: %EXTDIR%
    goto done
)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" "edge://extensions/"
    echo  请在新开的页面里：打开"开发人员模式"再"加载解压缩的扩展"并选择上面文件夹。
    goto done
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" "edge://extensions/"
    echo  请在新开的页面里：打开"开发人员模式"再"加载解压缩的扩展"并选择上面文件夹。
    goto done
)
echo  没有找到支持的浏览器。

:done
echo.
echo  完成。
timeout /t 6 >nul
endlocal