"use strict";

const fetch = require("node-fetch");
const download = require("image-downloader");
const wallpaper = require("wallpaper");
const schedule = require("node-schedule");
const fs = require("fs");

const imageDirectory = "./images";
const imageDirectoryCapacity = 10;
const imageResolution = "1920x1020";
const imageCategories = ["nature"];

schedule.scheduleJob("0 * * * *", async () => {
    await ensureImagesFolder();
    await cleanupImages();
    await updateBackground();
});

async function updateBackground() {
    console.log("Starting wallpaper change procedure ...");
    try {
        let imageResponse = await fetch(`https://source.unsplash.com/featured/${imageResolution}?${imageCategories.join(",")}`);
        let image = await download.image({ url: imageResponse.url, dest: imageDirectory });
        await wallpaper.set(image.filename);

        console.log("Wallpaper changed successfully!");
    } catch (e) {
        console.log("Failed to fetch an image and set it as a background!");
        console.error(e);
    }
}

async function cleanupImages() {
    const images = fs.readdirSync(imageDirectory);
    if (images.length >= imageDirectoryCapacity) {
        console.log("Cleaning up space ...");
        fs.unlinkSync(imageDirectory + "/" + images.pop());
    }
}

async function ensureImagesFolder() {
    if (!fs.existsSync(imageDirectory)) {
        console.log("Creating folder for image storage ...");
        fs.mkdirSync(imageDirectory);
    }
}
