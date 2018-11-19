import { Profile } from "./Profile";



import  leveldown = require('leveldown');
import  levelup = require('levelup');
// this is for local leveldb in node

// use this for indexdb storage in browser
// const browsedown = require('browsedown');

export const db = levelup(leveldown('./my_secret_keys'));