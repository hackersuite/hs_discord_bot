import { HackathonClient } from './HackathonClient';
import { loadConfig } from './util/config-loader';

const config = loadConfig();

const client = new HackathonClient(config);

client.start();
