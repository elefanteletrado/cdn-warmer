# cdn-warmer
> A CLI tool to pre-warm your CloudFront CDN.

## Requirements
* node.js >= 4.0.0

## Setup
```sh
$ git clone https://github.com/elefanteletrado/cdn-warmer.git && cd cdn-warmer
$ npm install
$ npm link
```

## Usage
cdn-warmer performs a series of GET requests to the CDN based upon on the files from the current working directory. In other words, you must have a local copy of the content you want to pre-warm on the CDN and it must match the path on the CDN.

```sh
$ cdn-warmer <your CDN address> [options]
```

### Options
* `-c, --chunk`: Chunk size. Represents how many files will be downloaded in parallel
* `-r, --report`: Save a report with file status and hit/miss rates
* `-v, --verbose`: Set verbosity

### Example
```sh
$ cd /path/to/my/project/content/cdn
$ cdn-warmer https://yourcdn.cloudfront.com/content/cdn
```

## TODO
* Publish a npm module
* Customize date format
* Improve test coverage
* Add a CI

## License
MIT
