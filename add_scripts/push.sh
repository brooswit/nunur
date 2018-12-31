node ./add_scripts/common/incrementVersion
git add .
git commit -m 'squash! Automated Development Deployment'
git pull origin $(git symbolic-ref --short -q HEAD) --rebase
git push origin $(git symbolic-ref --short -q HEAD)
