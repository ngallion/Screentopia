"use strict";

const fetch = require("node-fetch");
const download = require("image-downloader");
const schedule = require("node-schedule");
const fs = require("fs");
const uuid = require("uuid/v4");
const _ = require("lodash");
const moment = require("moment");

function getCategoryByTimeOfDay() {
  const currentHour = moment().hour();
  switch(true) {
    case (currentHour > 5 && currentHour <= 9):
      return "sunrise";
    case (currentHour > 9 && currentHour <= 13):
      return "spring";
    case (currentHour > 13 && currentHour <= 16):
      return "nature";
    case (currentHour > 16 && currentHour <= 19):
      return "sunset";
    case (currentHour > 19 && currentHour <= 23):
      return "night";
    default:
      return "stars";
  }
}

const imageDirectory = "./images";
const imageDirectoryCapacity = 10;
const imageResolution = process.argv[2];
let imageCategory = process.argv[3] || getCategoryByTimeOfDay();

function updateCategory() {
    imageCategory = process.argv[3] || getCategoryByTimeOfDay();
    console.log(`Updated category to ${imageCategory}.`);
}

updateBackgroundDirectory(imageCategory);

schedule.scheduleJob(`*/${imageDirectoryCapacity} * * * * `, async () => {
  updateBackgroundDirectory(imageCategory);
});

schedule.scheduleJob("0 6 * * * ", () => {
  updateCategory();
});

schedule.scheduleJob("0 12 * * * ", () => {
  updateCategory();
});

schedule.scheduleJob("0 17 * * * ", () => {
  updateCategory();
});

schedule.scheduleJob("0 20 * * * ", () => {
  updateCategory();
});

async function updateBackgroundDirectory(imageCategory) {
    console.log(`Getting new background images of ${imageCategory}`)
    await ensureImagesFolder();
    await deleteCurrentPhotos();
    _.times(imageDirectoryCapacity, async () => {
        _.delay(fetchPhoto, 3000, imageCategory);
    });
}

async function fetchPhoto(imageCategory) {
    console.log("Fetching image ...");

    try {
        const imageResponse = await fetch(`https://source.unsplash.com/featured/${imageResolution}?${imageCategory}`);
        await download.image({ url: imageResponse.url, dest: `${imageDirectory}/${uuid()}.jpg` });

        console.log("Image fetched successfully!");
    } catch (e) {
        console.error("Failed to fetch an image!", e);
    }
}

async function deleteCurrentPhotos() {
    const images = fs.readdirSync(imageDirectory);
    console.log("Nuking current images ...")
    try {
        images.forEach(img =>
            _.delay(fs.unlinkSync, 2000, imageDirectory + "/" + img)
        );
    } catch (e) {
        console.error("Nuking failed!", e);
    }
}

async function ensureImagesFolder() {
    if (!fs.existsSync(imageDirectory)) {
        console.log("Creating folder for image storage ...");

        fs.mkdirSync(imageDirectory);
    }
}
