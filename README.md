## Available Scripts

In the project directory, you can run:

### `yarn install`
Edit \node_modules\zilswap-sdk\lib\constants.js
api.zilliqa.com -> sn.zillacracy.com/api
and for the websocket sn.zillacracy.com/ws

Run this command to begin.

### `yarn start`

Runs the agent as node config.\
You will also see any lint errors in the console.

### `yarn master`

Runs the agent as master config.\
will try to become the master of the decentrallized network of your agent pool.\
You will also see any lint errors in the console.

### `.env`

Copy .env.example.\
\
Always\
PUBLIC_IP=\
PUBLIC_PORT=\
\
If pool then add these\
POOL_LOCATION=\
POOL_API_KEY=\
\
If standalone or first node\
DB_PASS=\
DB_URI=\
DB_USER=\
\