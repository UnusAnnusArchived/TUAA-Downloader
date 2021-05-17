npx electron-packager ./ --platform=darwin
cd "The Unus Annus Archive Downloader-darwin-x64/"
rm LICENSE
rm LICENSES.chromium.html
rm version
ln -s /Applications Applications
genisoimage -V "TUAA-Downloader" -D -R -apple -no-pad -o "The Unus Annus Archive Downloader.dmg" ./
rm Applications
rm -rf "The Unus Annus Archive Downloader.app"