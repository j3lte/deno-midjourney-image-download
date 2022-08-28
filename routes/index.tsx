/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";

import { config } from "dotenv/mod.ts";
import Form from "../islands/Form.tsx";
const { ARTFOLDER, SEED, REMOTE } = config();

export default function Home() {
  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      {!ARTFOLDER &&
      typeof REMOTE === "undefined" &&
      typeof SEED === "undefined" ? (
        <span>
          Please define an SEED and ARTFOLDER or 'REMOTE=1' in your .env file
        </span>
      ) : (
        <Form />
      )}
    </div>
  );
}
