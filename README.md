# Midjourney Grid image downloader

### Usage

Start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

- It will be able to download an image from Midjourney (discord attachment url)
- It will also carve the image up in different pieces, depending on the gridsize

### Env

Create an .env file with the following environment variables:

```
ARTFOLDER="/Folder/Where/To/Store/The/Images/"
SEED=<number>
```

Add `REMOTE=1` to the environment variables to enable zip download
