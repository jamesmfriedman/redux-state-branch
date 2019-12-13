rm -R -f out
rm -R -f dist
tsc -p ./tsconfig-build.json
mv out/redux-state-branch dist
rm -R -f out
#flowgen dist/index.d.ts -o dist/index.js.flow