rm -R -f out
rm -R -f dist
tsc
mv out/redux-state-branch dist
rm -R -f out