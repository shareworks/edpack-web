# Edpack-web

This repository contains generic Vue JS and SCSS code to reduce duplicate code in educational frontend apps.

## How to initialize the submodule after cloning an Edpack-enabled project
```
git submodule update --init
```

## How to add the Edpack submodule to a new project
```
git submodule add https://www.github.com/shareworks/edpack-web src/edpack-web
```

## How to remove the Edpack submodule:
```
// 1. Delete the relevant section from the .gitmodules file.
nano .gitmodules

// 2. Stage the .gitmodules changes.
git add .gitmodules

// 3. Delete the relevant section from .git/config.
nano .git/config

// 4. clear cache
git rm --cached src/edpack-web

// 5. remove from modules
rm -rf .git/modules/src/edpack-web

// 6. Commit changes
git commit -m "Removed submodule "

// 7. Delete the now untracked submodule files
rm -rf src/edpack-web
