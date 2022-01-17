import StatusCode from "status-code-enum";
import sharp from "sharp";
import puppeteer from "puppeteer";

import ClientFacingError from "./ClientFacingError";
import devices from "./data/devices";
import Device from "./models/Device";
import path from "path";

/**
 * Check if string is valid url, does not check for inclusion of 'http/https'.
 * @param string String to check.
 * @returns boolean
 */
function isValidUrl(string: string) {
  var res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

/**
 * Prepends 'http' to string if it is not included.
 * @param url - string to check and mutate.
 * @returns string
 */
const withHttp = (url: string) =>
  !/^https?:\/\//i.test(url) ? `http://${url}` : url;

export interface DevicerParams {
  url: string;
  deviceID: keyof typeof devices;
}

class Devicer {
  device: Device;
  url: string;

  constructor(params: DevicerParams) {
    let device = devices[params.deviceID];

    /* Check if device exists. */
    if (device === undefined) {
      throw new ClientFacingError(
        StatusCode.ClientErrorNotAcceptable,
        `Invalid device ID, valid device IDs include: ${Object.keys(
          devices
        ).slice(0, 6)}...`
      );
    }

    /* Check if url is valid */
    if (!isValidUrl(params.url)) {
      throw new ClientFacingError(
        StatusCode.ClientErrorNotAcceptable,
        `Invalid url "${params.url}" supplied.`
      );
    }

    this.device = device;
    this.url = params.url;
  }

  /**
   * Generates the device frame image by compositing the device frame image and
   * screenshot from the provided url.
   * @returns A buffer of device frame image data.
   */
  async generate() {
    try {
      const deviceImage = this.getDeviceImage(this.device.imageUri);
      const screenShotBuffer = await this.getUrlScreenshot(
        this.url,
        this.device
      );
      /* Underlays the screenshot with the device image. */
      return deviceImage
        .composite([{ input: screenShotBuffer, blend: "dest-over" }])
        .png()
        .toBuffer();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   *
   * @param url - URL to be accessed to obtain screenshot.
   * @param device - Device object used for specifying format of screenshot.
   * @returns A buffer of screenshot image.
   */
  async getUrlScreenshot(url: string, device: Device) {
    let browser = null;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      /* Emulate device. */
      await page.emulate(device.puppeteerDevice);

      try {
        /* Go to url, wait until network is idle. */
        await page.goto(withHttp(url), { waitUntil: "networkidle0" });
      } catch (error) {
        throw new ClientFacingError(StatusCode.ServerErrorBadGateway, error);
      }
      /* Take screenshot */
      return await page.screenshot();
    } catch (error) {
      throw error;
    } finally {
      if (browser !== null) await browser.close();
    }
  }

  /**
   * Loads device image using Sharp library.
   * @param uri - Image URI, relative to root directory of project.
   * @returns - Sharp object.
   */
  getDeviceImage(uri: string) {
    return sharp(path.join(process.cwd(), uri));
  }
}

export default Devicer;
