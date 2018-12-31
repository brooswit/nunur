node ./add_scripts/common/incrementVersion
git add .
git commit -m 'squash! Automated Development Deployment'
git pull -s recursive -X theirs origin $(git symbolic-ref --short -q HEAD)
git push origin $(git symbolic-ref --short -q HEAD)