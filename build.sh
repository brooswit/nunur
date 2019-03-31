ENV=$1

# compile
echo COMPILING
rm -rf ./compiled
mkdir compiled
cp -r ./src/ ./compiled/
rm -rf ./compiled/configs/

rm ./compiled/front-end/config.js
rm ./compiled/back-end/config.js

rm ./compiled/front-end/config.mustache
rm ./compiled/back-end/config.mustache

mustache ./src/configs/front-end/$ENV.json ./src/front-end/config.mustache > ./compiled/front-end/config.js
mustache ./src/configs/back-end/$ENV.json ./src/back-end/config.mustache > ./compiled/back-end/config.js

# build
echo BUILDING
rm -rf ./build
mkdir build
cd build
mkdir public
cd ..

cp -r ./compiled/back-end/ ./build/
parcel build ./compiled/front-end/index.html --out-dir ./build/public/ --out-file index.html
