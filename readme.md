
# Wikiracer 🚀

This script finds the path between two Wikipedia pages using internal links. It provides a path of Wikipedia links with the start page as the first link, the end page as the final link, and each link occurring in the article body of the previous link.

<details>

<summary>Table of Contents 📚</summary>

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Example](#example)
  - [Optional Flag: Finding the Shortest Path](#optional-flag-finding-the-shortest-path)
  - [Example Finding the Shortest Path](#example-finding-the-shortest-path)
- [Script Description](#script-description)
  - [Main Functions](#main-functions)
  - [Command-Line Variables](#command-line-variables)
- [Output](#output)
  - [Example Output](#example-output)
- [Common Errors](#common-errors)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
  - [getLinks](#getlinks)
  - [checkPages](#checkpages)
  - [redirected](#redirected)
  - [findShortestPath](#findshortestpath)
  - [findFirstPath](#findfirstpath)
- [License](#license)

</details>

## Wikiracer Architecture

[![Untitled-diagram-2024-06-02-182717.png](https://i.postimg.cc/rmSHLxSW/Untitled-diagram-2024-06-02-182717.png)]

## Prerequisites✅

✔️ Node.js (version 14 or higher recommended)

✔️ npm (version 6 or higher recommended)

## Installation📥

First, clone this repository and install the dependencies:

```sh
git clone https://github.com/Andrewsnobre/wikiracer.git
cd wikiracer
npm install 
```

## Usage💻

To run the script, use the following command, replacing `<startPage>` and `<endPage>` with the URLs of the Wikipedia pages you want to use as the start and end, respectively:

```sh
npx ts-node src/index.ts --start <startPage> --end <endPage>
```

or

```sh
npm start -- --start <startPage> --end <endPage>
```

### Example

```sh
npx ts-node src/index.ts --start "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy" --end "https://en.wikipedia.org/wiki/Wehrmacht"
```

or

```sh
npm start -- --start "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy" --end "https://en.wikipedia.org/wiki/Wehrmacht"
```

### Optional Flag: Finding the Shortest Path

To find the shortest path between the pages, add the `--shortest` or `-S` flag:

⚠️ Warning: This option may take longer to run.

```sh
npx ts-node src/index.ts --start <startPage> --end <endPage> --shortest
```

or

```sh
npm start -- --start <startPage> --end <endPage> -S
```

### Example Finding the Shortest Path

```sh
npx ts-node src/index.ts --start "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy" --end "https://en.wikipedia.org/wiki/Wehrmacht" --shortest
```

or

```sh
npm start -- --start "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy" --end "https://en.wikipedia.org/wiki/Wehrmacht" -S
```

## Script Description📝

- `import axios from 'axios';`: Imports the `axios` module to make HTTP requests.
- `import cheerio, { load } from 'cheerio';`: Imports the `cheerio` module to manipulate the returned HTML.
- `import pLimit from 'p-limit';`: Imports the p-limit module to limit the number of concurrent promises.
- `import yargs from 'yargs';`: Imports the `yargs` module to handle command-line arguments.
- `import { hideBin } from 'yargs/helpers';`: Imports the helper to handle process arguments.

### Main Functions

- `findShortestPath(start: string, endSet: RedirectSet): Promise<string[] | null>`: Finds the shortest path between two Wikipedia pages.
- `findFirstPath(start: string, endSet: RedirectSet): Promise<string[] | null>`: Finds the first path found between two Wikipedia pages.
- `getLinks(page: string): Promise<string[]>`: Retrieves all links from a Wikipedia page.
- `checkPages(start: string, end: string): Promise<boolean>`: Checks if the pages are valid and if they are in the same language.
- `redirected(end: string): Promise<RedirectSet>`: Checks if the destination page is a redirected page.

### Command-Line Variables

- `--start`: URL of the starting Wikipedia page.
- `--end`: URL of the ending Wikipedia page.
- `--shortest` or `-S`: Optional flag to find the shortest path between the pages.

## Output📄

The script will return the path between the two pages, or an error message if no valid path is found.

### Example Output

```sh
Success! Path found:
1. https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy
2. https://en.wikipedia.org/wiki/Scorched_earth
3. https://en.wikipedia.org/wiki/Wehrmacht
Execution Time: 0m 7.123s
```

## Common Errors🚨

- If the pages are not valid:

  ```sh
  <startPage> does not appear to be a valid Wikipedia page.
  ```

- If the pages are in different languages:

  ```sh
  Pages are in different languages.
  ```

- If the starting page has no links:

  ```sh
  Start page is a dead-end page with no Wikipedia links.
  ```

- If the ending page is an orphan page:

  ```sh
  End page is an orphan page with no Wikipedia pages linking to it.
  ```

## Running Tests🧪

To run tests, use the following command:

```sh
npm test
```

## Test Coverage🧩

The tests include checks for the following functionalities:

### checkPages

Verifies that the provided Wikipedia pages are valid and in the same language.

- **Should return `true` for valid Wikipedia pages in the same language:**
  - Mocks a valid Wikipedia response for pages in the same language.
  - Verifies that the function returns `true` for valid pages in the same language.

- **Should return `false` for invalid Wikipedia URLs:**
  - Mocks an invalid Wikipedia URL.
  - Verifies that the function returns `false` for invalid URLs.

- **Should return `false` if the pages are in different languages:**
  - Mocks pages in different languages.
  - Verifies that the function returns `false` for pages in different languages.

- **Should return `false` if the start page has no links:**
  - Mocks a start page with no links.
  - Verifies that the function returns `false` when the start page has no links.

- **Should return `false` if the end page is an orphan page:**
  - Mocks an end page that is an orphan page.
  - Verifies that the function returns `false` when the end page is an orphan page.
  - Verifies that the correct error message is logged.

- **Should return `false` if the response status is not 200:**
  - Mocks a response with a status other than 200.
  - Verifies that the function returns `false` when the response status is not 200.

- **Should return `false` if the start page is invalid even if end page is valid:**
  - Mocks an invalid start page but a valid end page.
  - Verifies that the function returns `false` when the start page is invalid.

### findFirstPath

Finds the first path between two Wikipedia pages.

- **Should find the first path between two Wikipedia pages:**
  - Mocks the response of Wikipedia pages to find the first path.
  - Verifies that the function correctly finds the first path between two pages.

- **Should return `null` if no path is found:**
  - Mocks a scenario where there is no path between the pages.
  - Verifies that the function returns `null` when no path is found.

### findShortestPath

Finds the shortest path between two Wikipedia pages.

- **Should find the shortest path between two Wikipedia pages:**
  - Mocks the response of Wikipedia pages to find the shortest path.
  - Verifies that the function correctly finds the shortest path between two pages.

- **Should return `null` if no path is found:**
  - Mocks a scenario where there is no path between the pages.
  - Verifies that the function returns `null` when no path is found.

### getLinks

Verifies that links are correctly extracted from a Wikipedia page.

- **Should return a list of Wikipedia links:**
  - Mocks the response of a Wikipedia page containing links.
  - Verifies that the function correctly returns the found links.

- **Should return an empty list if request fails:**
  - Mocks a network failure.
  - Verifies that the function returns an empty list when the request fails.

### redirected

Handles redirections on the ending Wikipedia page.

- **Should return a set with the original and redirected URLs:**
  - Mocks the response of a Wikipedia page with redirection.
  - Verifies that the function correctly returns the original and redirected URLs.

- **Should return a set with only the original URL if request fails:**
  - Mocks a network failure.
  - Verifies that the function handles errors and returns only the original URL.

## License

Copyright © 2024 MIT licensed

✨ Developed by Andrews Rodrigues
