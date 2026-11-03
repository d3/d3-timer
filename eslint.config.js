import js from "@eslint/js";
import globals from "globals";
import {defineConfig} from "eslint/config";

export default defineConfig([
  {files: ["**/*.{js,ts,jsx,tsx}"], plugins: {js}, extends: ["js/recommended"]},
  {files: ["**/*.{js,ts,jsx,tsx}"], languageOptions: {globals: globals.browser}},
  {files: ["test/**/*.js"], languageOptions: {globals: {setTimeout: "writable"}}}, // tests spy on setTimeout
  {languageOptions: {ecmaVersion: 2019, sourceType: "module"}}
]);
