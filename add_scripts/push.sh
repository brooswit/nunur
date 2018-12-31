node ./add_scripts/common/incrementVersion
git add .
git commit -m 'squash! Automated Development Deployment'
git pull origin HEAD --rebase
git push origin HEAD
