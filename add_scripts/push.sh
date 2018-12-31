node ./add_scripts/common/incrementVersion
git add .
git commit -m 'squash! AUTOMATED DEVELOPMENT DEPLOYMENT'
git rebase 
git push origin HEAD
