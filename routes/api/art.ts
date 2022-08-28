import { HandlerContext } from "$fresh/server.ts";
import { config } from "dotenv/mod.ts";
import { join } from "path/mod.ts";
import { Buffer } from "io/buffer.ts";
import { snakeCase } from "case/mod.ts";
import { decode, Image } from "imagescript/mod.ts";
import { ZipWriter, Uint8ArrayReader, Uint8ArrayWriter } from "zipjs/index.js";

const { ARTFOLDER, SEED, REMOTE } = config();

type RequestBody = {
  prompt: string;
  imageURL: string;
  carveGrid: boolean;
  gridSize: number;
};

type File = {
  fileName: string;
  content: Uint8Array;
};

const returnBody = (ok: boolean, arr?: Uint8Array) =>
  new Response(JSON.stringify({ ok, content: arr && Array.from(arr) }));

const fetchImage = async (url: string) => {
  const res = await fetch(url);
  console.log(`${res.ok ? "OK" : "FAILED"} :: Download ${url}`);
  const body = await res.blob();
  return body;
};

const carveGrid = async (
  imageName: string,
  data: Uint8Array,
  gridSize = 2
): Promise<Array<File>> => {
  const fileArr: Array<File> = [];
  const image = (await decode(data)) as Image;
  const newBlockSize = {
    w: image.width / gridSize,
    h: image.height / gridSize,
  };
  let n = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const blockNum = n++;
      console.log(
        `Carving ${blockNum} - (${imageName}): ${i * newBlockSize.w},${
          j * newBlockSize.h
        } - ${newBlockSize.w}x${newBlockSize.h}`
      );
      const gridImage = image
        .clone()
        .crop(
          i * newBlockSize.w,
          j * newBlockSize.h,
          newBlockSize.w,
          newBlockSize.h
        );
      const fileName = imageName + `-block${blockNum}.png`;
      const filePath = join(ARTFOLDER, fileName);
      const uint8arr = await gridImage.encode(9);
      fileArr.push({ fileName, content: uint8arr });
      if (typeof REMOTE === "undefined") {
        await Deno.writeFile(filePath, uint8arr);
        console.log(`Written: ${filePath}`);
      }
    }
  }
  return fileArr;
};

const createImages = async (
  imageName: string,
  blob: Blob,
  carve = 0
): Promise<Array<File>> => {
  let fileArr: Array<File> = [];
  if (blob.type === "image/png") {
    const fileName = imageName + ".png";
    const filePath = join(ARTFOLDER, fileName);
    const buffer = await blob.arrayBuffer();
    const uint8arr = new Buffer(buffer).bytes();
    if (carve) {
      fileArr = await carveGrid(imageName, uint8arr, carve);
    }
    fileArr.push({ fileName, content: uint8arr });
    if (typeof REMOTE === "undefined") {
      await Deno.writeFile(filePath, uint8arr);
      console.log(`Written: ${filePath}`);
    }
  }
  return fileArr;
};

const generateZip = async (files: Array<File>) => {
  const blobWriter = new Uint8ArrayWriter();
  const writer = new ZipWriter(blobWriter);

  await Promise.all(
    files.map((file) =>
      writer.add(file.fileName, new Uint8ArrayReader(file.content))
    )
  );

  await writer.close(null);
  const data = await blobWriter.getData();
  return data;
};

export const handler = async (
  req: Request,
  _ctx: HandlerContext
): Promise<Response> => {
  const json = (await req.json()) as RequestBody;
  try {
    const img = await fetchImage(json.imageURL);
    const fileName = snakeCase(`${json.prompt}-${SEED}`);
    const fileArr = await createImages(
      fileName,
      img,
      json.carveGrid ? json.gridSize : 0
    );
    if (typeof REMOTE !== "undefined") {
      const zip = await generateZip(fileArr);
      return returnBody(false, zip);
    }
    return returnBody(true);
  } catch (error) {
    console.error(error);
  }
  return returnBody(false);
};
