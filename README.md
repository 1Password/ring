# ring

Release branch for 1Password fork of [ring](https://crates.io/crates/ring).

## Dependency

To specify this fork as a dependency, add `ring 0.17.0-alpha.11` normally and patch with a git dependency.

```toml
[dependencies]
ring = "0.17.0-alpha.11"

[patch.crates-io]
ring = { git = "https://github.com/1Password/ring", branch = "1p/release" }
```

Versions may be specified with the `tag`.

## Creating a release

Creating a release is only supported on **Windows**.

### Clone

The `ring` repository must be cloned with the following configuration in order to retain line endings.

```sh
git clone \
        --config core.eol=lf \
        --config core.autocrlf=false \
        --config 'diff.obj.textconv=node tools/obj-diff.js --normalize' \
    git@github.com:1password/ring.git
```

**Note**

In order for pregenerated files to match, `ring` *must* be checked out at the root of the drive (e.g., `C:/ring`).

### Prerequisites

* [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
  - C/C++
  - LLVM and Clang
* [Git Bash](https://git-scm.com/)
* [nasm](https://www.nasm.us/)

  ```ps1
  .\mk\install-build-tools.ps1
  .\target\tools\windows\mk\install-build-tools.ps1
  ```

### Build

```sh
rm -rf pregenerated
sh mk/package.sh
```

### Commit

The packaged build can be found at `target/package/ring-0.17.0-alpha.11.crate`. It should be extracted with `tar` and the contents of the `ring` subdirectory on the `1p/release` branch replaced. 

```sh
tar -xvf target/package/ring-0.17.0-alpha.11.crate
git checkout 1p/release
rm -rf ring
mv ring-0.17.0-alpha.11 ring
```

It is recommended to perform a `git diff` of any `.obj` files that have changed. They will always show as changed in `git status` because they include a build timestamp. However, [tools](#tools) are provided for performing the diff. If there are no changes, it is best practice to drop the change.

```sh
# Perform a diff on all `ring/pregenerated/*.obj` files and drop unchanged
./tools/reset-unchanged.sh
```

### Tag

The final step of a release is to create an git tag. The git tag both acts as a good reference to a specific version as well a parameter to force `cargo` to re-pull the dependency.

## Tools

### `obj-diff.js`

`obj-diff.js` is a small node script that acts as a Git [textconv driver](https://git.wiki.kernel.org/index.php/Textconv) for comparing Windows `obj` files. The script makes two changes to the file contents before printing it as hex:

1. Sets the compilation date in the COFF header to the unix epoch
2. Replaces build paths matching `[A-Z]:\ring` with `P:\ring`

The intent of `obj-diff.js` is to aid in reproducible builds by ignoring non-deterministic sections of the file.

By default, the contents are printed as hex with no change. The `--normalize` flag enable normalization.

```sh
node tools/obj-diff.js --normalize ring/pregenerated/aesni-gcm-x86_64-nasm.obj
```

### `reset-unchanged.sh`

Resets unchanged `obj` files.

```sh
./tools/reset-unchanged.sh
```
