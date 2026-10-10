// Everything on /content-creation. The videos all live on OnetapTV, my own
// channel, cut from public streams. Thumbnails are the channel's own, pulled
// from YouTube into public/images/content/ (16:9 for videos, 9:16 for Shorts).

export const CHANNEL_URL = "https://www.youtube.com/@onetaptv3324w";
export const EMAIL = "peter.business.203@gmail.com";
export const X_URL = "https://x.com/203Peter";
// Shown as a copy-to-clipboard button in the contact block. Leave empty to
// hide the button.
export const DISCORD = "";

export type Video = {
  id: string; // YouTube video id
  title: string;
  streamer: string;
  game: string;
  duration: string;
  thumb: string;
};

export const VIDEOS: Video[] = [
  {
    id: "Wucp0SfTHnU",
    title: "Aceu with an insane game on Irelia",
    streamer: "Aceu",
    game: "League of Legends",
    duration: "09:54",
    thumb: "/images/content/aceu-irelia.webp",
  },
  {
    id: "-sfyZHYeu2U",
    title: "Caedral smurfing with Lee Sin",
    streamer: "Caedral",
    game: "League of Legends",
    duration: "11:57",
    thumb: "/images/content/caedral-lee.webp",
  },
  {
    id: "jhZ7GN09Ufc",
    title: "Lemonhead with the easiest game of his life",
    streamer: "Lemonhead",
    game: "Apex Legends",
    duration: "06:27",
    thumb: "/images/content/lemonhead-easiest-game.webp",
  },
  {
    id: "zXd7Axbw7a4",
    title: "Genburten tries Battlefield 6",
    streamer: "Genburten",
    game: "Battlefield 6",
    duration: "10:10",
    thumb: "/images/content/genburten-bf6.webp",
  },
];

export const SHORTS: Video[] = [
  {
    id: "kyOBqcW8sD4",
    title: "Lemonhead's insane PK",
    streamer: "Lemonhead",
    game: "Apex Legends",
    duration: "00:09",
    thumb: "/images/content/short-lemonhead-pk.webp",
  },
  {
    id: "5qAUuKs3Ybo",
    title: "What a teammate",
    streamer: "Baus",
    game: "League of Legends",
    duration: "00:09",
    thumb: "/images/content/short-what-a-teammate.webp",
  },
];

export const GAMES = ["League of Legends", "Apex Legends", "Battlefield 6"];

export const TOOLS = ["DaVinci Resolve", "CapCut"];

export const PROCESS = [
  {
    title: "Send the VOD",
    body: "A link to the stream is all I need. Tell me anything you want in or out.",
  },
  {
    title: "I find the moments",
    body: "I watch the whole thing and send back a list of timestamps worth cutting.",
  },
  {
    title: "Cut and brand",
    body: "Clean cuts, pacing that holds attention, your logo, intro and outro.",
  },
  {
    title: "Review and deliver",
    body: "You watch it first. Changes go in, then it's ready to upload.",
  },
];

export const SERVICES = [
  {
    title: "VOD review and highlights",
    body: "I go through your stream and pull out the best moments, delivered as a list of timestamps.",
  },
  {
    title: "YouTube highlight videos",
    body: "Polished 8–12 minute videos with clean cuts and transitions, built to keep people watching.",
  },
  {
    title: "Shorts, TikToks and Reels",
    body: "Vertical clips under 60 seconds, cut for YouTube Shorts, TikTok and Instagram Reels.",
  },
  {
    title: "Channel branding",
    body: "Your logo, intro, outro and on-screen alerts worked in, so every upload looks like yours.",
  },
  {
    title: "Thumbnails",
    body: "A clear, clickable thumbnail for each video, made to stand out in the feed.",
  },
];

// The featured offer, shown as the wide last cell of the services grid.
export const STARTER = {
  title: "Content starter package",
  items: [
    "1 YouTube highlight video",
    "2 Shorts / TikToks",
    "A custom thumbnail, free",
  ],
};
