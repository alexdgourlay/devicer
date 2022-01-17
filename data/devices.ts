import { devices as puppeteerDevices } from "puppeteer";
import Device from "../models/Device";
import { addIDs } from "../utils";

/**
 * Puppeteer device list: https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts
 */

type DevicesById = Record<Device["id"], Device>;

const devices: DevicesById = addIDs({
  "apple-iPhone-11-pro-max": {
    imageUri: "assets/Apple iPhone 11 Pro Max Space Grey.png",
    puppeteerDevice: puppeteerDevices["iPhone 11 Pro Max"],
  },
  "apple-iPad-pro-13-landscape": {
    imageUri: "assets/Apple iPad Pro 13 Silver - Landscape.png",
    puppeteerDevice: puppeteerDevices["iPad Pro landscape"],
  },
  "apple-macbook": {
    imageUri: "assets/Apple-Macbook-Space-Grey.png",
    puppeteerDevice: {
      name: "apple-macbook",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15",
      viewport: {
        width: Math.round(2.08 * 554),
        height: Math.round(2.1 * 346),
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: false,
        isLandscape: false,
      },
    },
  },
});

export default devices;
