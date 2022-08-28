/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { tw } from "@twind";
import { snakeCase } from "case/mod.ts";

export default function Form() {
  const [imageURL, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [carveGrid, setCarveGrid] = useState(true);
  const [gridSize, setGridSize] = useState(2);
  const [hasError, setHasError] = useState(false);
  const [zipData, setZipData] = useState<Array<number> | null>(null);

  const disabled = imageURL === "" || prompt === "" || hasError;

  const onSubmit = async () => {
    setZipData(null);
    if (imageURL === "" || prompt === "") {
      return;
    }
    const data = (await fetch("/api/art", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageURL, prompt, carveGrid, gridSize }),
    }).then((r) => r.json())) as { ok: boolean; content?: Array<number> };

    if (data.content) {
      setZipData(data.content);
    } else {
      setZipData(null);
    }
    if (data.ok) {
      setImageUrl("");
      setPrompt("");
      setHasError(false);
    }
  };

  const downloadZip = () => {
    if (zipData) {
      console.log(Uint8Array.from(zipData));
      const link = document.createElement("a");
      link.style.display = "none";
      link.download = `${snakeCase(prompt)}.zip`;
      document.body.appendChild(link);

      const blob = new Blob([Uint8Array.from(zipData)], {
        type: "application/zip",
      });
      link.href = URL.createObjectURL(blob);
      link.click();

      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }
  };

  return (
    <div class={tw`flex flex-col gap-2 w-full`}>
      <span class={tw`text-xl`}>Midjourney Art Style generator</span>
      <p class={tw`text-sm`}>
        Fill in the form so we can generate midjourney art styles in your
        ARTFOLDER:
      </p>
      <div class={tw`mt-10`}>
        <div class={tw`grid gap-6`}>
          <div class={tw`relative z-0`}>
            <input
              type="text"
              class={tw`peer block w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0`}
              value={prompt}
              onChange={(e) => setPrompt((e.target as HTMLInputElement).value)}
            />
            <label
              class={tw`absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:dark:text-blue-500`}
            >
              Prompt
            </label>
          </div>
          <div class={tw`relative z-0`}>
            <input
              type="url"
              class={tw`peer block w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0`}
              value={imageURL}
              onChange={(e) =>
                setImageUrl((e.target as HTMLInputElement).value)
              }
            />
            <label
              class={tw`absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:dark:text-blue-500`}
            >
              ImageURL
            </label>
          </div>
          <div class="flex items-center items-start mb-4">
            <div class={tw`flex-none mr-10 py-2.5`}>
              <input
                id="checkbox-1"
                aria-describedby="checkbox-1"
                type="checkbox"
                class={tw`bg-gray-50 border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded`}
                checked={carveGrid}
                onChange={(e) =>
                  setCarveGrid((e.target as HTMLInputElement).checked)
                }
              />
              <label
                for="checkbox-1"
                class={tw`text-sm ml-3 font-medium text-gray-900`}
              >
                Carve Grid
              </label>
            </div>
            <div
              class={tw`relative z-0 flex-grow ${carveGrid ? "" : "hidden"}`}
            >
              <input
                type="number"
                class={tw`peer block w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0`}
                value={gridSize}
                onChange={(e) =>
                  setGridSize(parseInt((e.target as HTMLInputElement).value))
                }
              />
              <label
                class={tw`absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:dark:text-blue-500`}
              >
                Grid size
              </label>
            </div>
          </div>
          <div
            class={tw`flex w-full flex-row relative z-0 justify-items-center justify-center`}
          >
            {imageURL !== "" ? (
              <div>
                <img
                  class={tw`block w-64 m-3`}
                  src={imageURL}
                  onError={() => setHasError(true)}
                  onLoad={() => setHasError(false)}
                />
              </div>
            ) : null}
          </div>
        </div>
        <button
          type="submit"
          class={tw`mt-5 mr-5 rounded-md bg-black px-10 py-2 text-white focus:outline-none focus:ring-0 ${
            disabled ? "opacity-20 cursor-not-allowed" : ""
          }`}
          disabled={disabled}
          onClick={() => {
            onSubmit();
          }}
        >
          Send to backend
        </button>
        {zipData !== null ? (
          <button
            class={tw`mt-5 rounded-md bg-black px-10 py-2 text-white focus:outline-none focus:ring-0 ${
              disabled ? "opacity-20 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              downloadZip();
            }}
          >
            Download zip
          </button>
        ) : null}
      </div>
    </div>
  );
}
