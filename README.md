
# Cyberwright-App
![Tauri](https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=%23FFFFFF) ![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
--- 

This is the Cyberwright desktop app source code. Built using Tauri, this app enables users to upload their code directories via the app and receive feedback on possible code vulnerabilities.

The UI was implemented using TailwindCSS, with NextJS as the driving React framework. 

## To Run
In order to use the Cyberwright app, you must first have the [Cyberwright backend](https://github.com/TheCyberwrightProject/cyberwright-backend) running as well. 
1. Modify the contents of [src-tauri/constants.rs](src-tauri/constants.rs) to ensure the app uses the correct API and Google Client ID (which is used for Google authentication).
>In order to obtain a **Google Client ID**, you must create OAuth credentials via the Google Cloud Console.
2.   Run the app by running `npm run tauri dev`.
>For best performance, run `npm run tauri build`. This will generate an optimized binary of our app.


## Example App Views
![Login Page](imgs/login.png)

![Home Page](imgs/home.png)

![View Page](imgs/view.png)

![Code Loaded Page](imgs/view2.png) 