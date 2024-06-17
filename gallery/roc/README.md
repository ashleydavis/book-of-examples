# Roc implementation

Roc implementation of the photo gallery layout algorithm.

## Pre-reqs

You need [the Roc compiler](https://www.roc-lang.org/install) installed to run this.

## Installing Roc

- For Windows, run it under WSL2 Ubuntu.
- Instructions for instaling under Linux: https://www.roc-lang.org/install/linux_x86_64

Example installation:

```bash
wget https://github.com/roc-lang/roc/releases/download/nightly/roc_nightly-linux_x86_64-latest.tar.gz
tar -xf roc_nightly-linux_x86_64-latest.tar.gz
export PATH=$PATH:<full-path>/roc_nightly-linux_x86_64-2024-06-14-5d09479
```

## Setup

Open a terminal and change to the `roc` directory:

```bash
cd roc
```

##  Build and run

```bash
./build.sh
./main
```

## Run it for development (with live reload)

```bash
./dev.sh
```

## Run tests

TODO

## Run tests with live reload

TODO