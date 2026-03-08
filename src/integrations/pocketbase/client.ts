import PocketBase from 'pocketbase';

const POCKETBASE_URL = "https://api.facesmash.app";

const pb = new PocketBase(POCKETBASE_URL);

// Disable auto-cancellation so parallel requests don't cancel each other
pb.autoCancellation(false);

export { pb };