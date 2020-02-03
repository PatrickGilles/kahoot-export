## Kahoot! Exporter

Simple NodeJS terminal tool to export any Kahoot! that you have created to a `.xlsx` file that conforms to the Kahoot! import template.

## Installation

1. Clone this repo

```sh
git clone https://github.com/flynnwebdev/kahoot-export.git
```

2. Install dependencies

```sh
cd kahoot-export && npm install
```

3. Create a `.env` file with these keys. Substitute your credentials in place of the values.

```conf
KAHOOT_EMAIL=<your-kahoot-email>
KAHOOT_PASSWORD=<your-kahoot-password>
```

## Usage

1. Log in to <http://create.kahoot.it> and view one of your Kahoots!
2. Get the UUID of the Kahoot! from the address bar of your browser. It will look similar to `64f95e00-18f7-4ce7-9c8d-0fe8d13787ca`
3. Run the app with `yarn start` or `npm start` and pass the UUID, eg.

```sh
npm start 64f95e00-18f7-4ce7-9c8d-0fe8d13787ca
```

4. If everything worked, the exported file should be found in the `kahoots` folder. The filename will be the same as the title of the Kahoot!
