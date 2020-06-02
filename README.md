# hs_discord_bot

![CI](https://github.com/unicsmcr/hs_discord_bot/workflows/CI/badge.svg)

A Discord bot to assist with online Hackathons.

## Current Features

- Can setup a Discord guild (create roles and channels) for Hackathon usage
- Links Discord user accounts to HS accounts
- Creates private text and voice channels for teams
- Creates a private area for organisers and volunteers to communicate
- Integration with twitter to fetch tweets about the event, applies hackathon logo to images
- Basic moderation; automatic profanity filter, and manual mute/unmute commands

## Usage

### For development

1. First set up [`hs_discord_bot_api`](https://github.com/unicsmcr/hs_discord_bot)
2. Install dependencies - `npm i`
3. Create a valid `.env` file (see `.env.example`)
4. Update the `assets/` directory
5. Start the bot - `make up-dev` (runs without Docker)

### For a hackathon

_Requires Docker_

1. First set up [`hs_discord_bot_api`](https://github.com/unicsmcr/hs_discord_bot)
2. Create a valid `.env` file (see `.env.example`)
3. Update the `assets/` directory to be relevant to the Hackathon
4. Start the bot - `make up` (runs in a Docker container)

## License

> Copyright 2020 UniCS
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
