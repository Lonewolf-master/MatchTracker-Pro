import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
// import { isSpoofedBot } from "@arcjet/inspect";
import "dotenv/config";

const arcjetKey = process.env.ARCJET_KEY;
if(!arcjetKey) throw new Error("Arcjet_Key is not set")
const mode =  process.env.ARCJET_ENV === "production"? "LIVE" : "DRY_RUN"
// Create an ArcJet client instance with your



export const httpArcjet = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: arcjetKey,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode }),
    // Create a bot detection rule
    // detectBot({
    //   mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
    //   // Block all bots except the following
    //   allow: [
    //     "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
    //     // Uncomment to allow these other common bot categories
    //     // See the full list at https://arcjet.com/bot-list
    //     //"CATEGORY:MONITOR", // Uptime monitoring services
    //     "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
    //   ],
    // }),
    slidingWindow({
       // mode: "LIVE",
       mode,
        // Tracked by IP address by default, but this can be customized
        // See https://docs.arcjet.com/fingerprints
        //characteristics: ["ip.src"],
        max:50, //100 request for every time inerval : 60 (1min)
        interval: '10s', // Refill every 10 seconds
        // capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

export const wsArcjet = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: arcjetKey,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    slidingWindow({
       // mode: "LIVE",
       mode,
        // Tracked by IP address by default, but this can be customized
        // See https://docs.arcjet.com/fingerprints
        //characteristics: ["ip.src"],
        max:5, //100 request for every time inerval : 60 (1min)
        interval: '2s', // Refill every 10 seconds
        // capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

