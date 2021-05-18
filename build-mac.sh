npx electron-packager ./ --platform=darwin
cd "The Unus Annus Archive Downloader-darwin-x64/"
rm LICENSE
rm LICENSES.chromium.html
rm version
ln -s /Applications Applications
genisoimage -V "TUAA-Downloader" -D -R -apple -no-pad -o "The Unus Annus Archive Downloader.dmg" ./
mkdir ../dist/
mv "The Unus Annus Archive Downloader.dmg" ../dist/
cd ../
rm -rf "The Unus Annus Archive Downloader-darwin-x64/"