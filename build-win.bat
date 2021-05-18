@echo off
call npx electron-builder -w
rmdir dist\win-unpacked /S /q
del dist\builder-debug.yml /q
del dist\builder-effective-config.yaml /q