import { Device as PuppeteerDevice } from "puppeteer";

export default interface Device {
  id: string;
  imageUri: string;
  puppeteerDevice: PuppeteerDevice;
}
