# scburke30.github.io
Just a personal resume website written as a Single-Page Application.

Taken from abelss0n.github.io.

## Front-page rotating photo gallery

The Home page gallery is populated from:

- `assets/photos/frontpage-pics/manifest.json`

When you add/remove images in `assets/photos/frontpage-pics/`, regenerate the manifest:

- PowerShell: `powershell -ExecutionPolicy Bypass -File .\scripts\generate-frontpage-manifest.ps1`

Commit the updated `manifest.json` and your new images; the gallery will automatically rotate through everything listed in the manifest.
