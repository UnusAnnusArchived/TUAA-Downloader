[ ! -d "./dist/" ] && mkdir ./dist/

echo "Building .app file..."
npx electron-packager ./ --platform=darwin
cd "The Unus Annus Archive Downloader-darwin-x64/"

echo "Packing app into asar..."
npx asar pack "./The Unus Annus Archive Downloader.app/Contents/Resources/app/" "./The Unus Annus Archive Downloader.app/Contents/Resources/app.asar"
rm -rf "./The Unus Annus Archive Downloader.app/Contents/Resources/app/"

echo "Cleaning up..."
rm LICENSE
rm LICENSES.chromium.html
rm version

echo "Building .dmg file..."
ln -s /Applications Applications
if [[ $(uname) == 'Darwin' ]]
then
    hdiutil makehybrid -o "../dist/The Unus Annus Archive Downloader.dmg" -hfs -default-volume-name TUAA-Downloader ./
else
    genisoimage -V "TUAA-Downloader" -D -R -apple -no-pad -o "../dist/The Unus Annus Archive Downloader.dmg" ./
fi

echo "Cleaning up..."
cd ../
rm -rf "The Unus Annus Archive Downloader-darwin-x64/"

echo "Finished"