
# Wikiracer

This script finds the path between two Wikipedia pages using internal links. It provides a path of Wikipedia links with the start page as the first link, the end page as the final link, and each link occurring in the article body of the previous link.

## Prerequisites

- Node.js (version 14 or higher recommended)
- npm (version 6 or higher recommended)

## Installation

First, clone this repository and install the dependencies:

```sh
git clone https://github.com/Andrewsnobre/wikiracer.git
cd wikiracer
npm install 
```

## Usage

To run the script, use the following command, replacing `<startPage>` and `<endPage>` with the URLs of the Wikipedia pages you want to use as the start and end, respectively:

```sh
npx ts-node src\wikiracer.ts --start <startPage> --end <endPage>
```

or

```sh
npm start -- --start <startPage> --end <endPage>
```

### Example

```sh
npx ts-node src\wikiracer.ts --start "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy" --end "https://en.wikipedia.org/wiki/Wehrmacht"
```

or

```sh
npm start -- --start "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy" --end "https://en.wikipedia.org/wiki/Wehrmacht"
```

### Finding the Shortest Path

To find the shortest path between the pages, add the `--shortest` or `-S` flag:

```sh
npx ts-node src\wikiracer.ts --start <startPage> --end <endPage> --shortest
```

or

```sh
npm start -- --start <startPage> --end <endPage> -S
```

### Example

```sh
npx ts-node src\wikiracer.ts --start "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy" --end "https://en.wikipedia.org/wiki/Wehrmacht" --shortest
```

or

```sh
npm start -- --start "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy" --end "https://en.wikipedia.org/wiki/Wehrmacht" -S
```

## Script Description

- `import axios from 'axios';`: Imports the `axios` module to make HTTP requests.
- `import cheerio, { load } from 'cheerio';`: Imports the `cheerio` module to manipulate the returned HTML.
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

## Output

The script will return the path between the two pages, or an error message if no valid path is found.

### Example Output

```sh
Path found: [
'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy',
'https://en.wikipedia.org/wiki/Scorched_earth',
'https://en.wikipedia.org/wiki/Wehrmacht'
]
Execution Time: 0m 7.123s
```

## Common Errors

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

## Running Tests

To run tests, use the following command:

```sh
npm test
```

## Test Coverage

The tests include checks for the following functionalities:

### getLinks

Verifies that links are correctly extracted from a Wikipedia page.

- Should fetch and parse links from a Wikipedia page.
- Should return an empty array if no links are found.
- Should handle errors and return an empty array.

### checkPages

Verifies that the provided Wikipedia pages are valid and in the same language.

- Should return `false` for invalid Wikipedia pages.
- Should return `true` for valid Wikipedia pages in the same language.
- Should return `false` if the pages are in different languages.
- Should return `false` if the start page has no links.
- Should return `false` if the end page is an orphan page.
- Should return `false` if the response status is not 200.

### redirected

Handles redirections on the ending Wikipedia page.

- Should handle redirection for the ending Wikipedia page.
- Should handle errors gracefully.

### findShortestPath

Finds the shortest path between two Wikipedia pages.

- Should find the shortest path between two Wikipedia pages.
- Should return `null` if no path is found.
- Should handle visited pages correctly.
- Should handle errors gracefully.

### findFirstPath

Finds the first path between two Wikipedia pages.

- Should find the first path between two Wikipedia pages.
- Should return `null` if no path is found.
- Should handle visited pages correctly.
- Should handle errors gracefully.

## License

This project is licensed under the terms of the MIT license.
