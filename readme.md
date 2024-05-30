
# Wikipedia Shortest Path Finder

This script finds the shortest path between two Wikipedia pages using internal links.

## Prerequisites

- Node.js
- npm

## Installation

First, clone this repository and install the dependencies:

```sh
git clone https://github.com/Andrewsnobre/wikiracer.git
cd wikiracer
npm install axios cheerio yargs
```

## Usage

To run the script, use the following command, replacing `<startPage>` and `<endPage>` with the URLs of the Wikipedia pages you want to use as the start and end, respectively:

```sh
node wikiracer4.js --start <startPage> --end <endPage>
```

### Example

```sh
node wikiracer4.js --start "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy" --end "https://en.wikipedia.org/wiki/Wehrmacht"
```

## Script Description

- `const axios = require('axios');`: Imports the `axios` module to make HTTP requests.
- `const cheerio = require('cheerio');`: Imports the `cheerio` module to manipulate the returned HTML.
- `const { argv } = require('yargs')`: Imports the `yargs` module to handle command-line arguments.

### Main Functions

- `findShortestPath(start, end)`: Finds the shortest path between two Wikipedia pages.
- `getLinks(page)`: Retrieves all links from a Wikipedia page.
- `checkPages(start, end)`: Checks if the pages are valid and if they are in the same language.
- `redirected(end)`: Checks if the destination page is a redirected page.

### Command-Line Variables

- `--start`: URL of the starting Wikipedia page.
- `--end`: URL of the ending Wikipedia page.

## Output

The script will return the shortest path between the two pages, or an error message if no valid path is found.

### Example Output

```sh
[
   'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy',
  'https://en.wikipedia.org/wiki/Scorched_earth',
  'https://en.wikipedia.org/wiki/Wehrmacht'
]
Execution Time: 0m 3.123s

```

## Common Errors

- If the pages are not valid:
  ```sh
  <startPage> does not appear to be a valid Wikipedia page.
  ```

- If the pages are in different languages:

  ```sh
  Pages are in different languages.
- If the starting page has no links:
  ```sh
  Start page is a dead-end page with no Wikipedia links.
- If the ending page is an orphan page:
    ```sh
   End page is an orphan page with no Wikipedia pages linking to it.
    ```

## License

This project is licensed under the terms of the MIT license.
