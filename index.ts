import express, { Request, ErrorRequestHandler } from "express";
import { StatusCode } from "status-code-enum";

import ClientFacingError from "./ClientFacingError";
import devices from "./data/devices";
import Devicer, { DevicerParams } from "./Devicer";

const app = express();

/**
 * Check the validity of, and then extract query parameters from
 * Express request.
 */
function extractDevicerParameters(req: Request): DevicerParams {
  const { query } = req;
  const exampleParamsTemplate =
    "Query parameters should be supplied in the form: { url: 'string', deviceID: 'string' }.";

  if (!query || Object.keys(query).length === 0) {
    throw new ClientFacingError(
      StatusCode.ClientErrorBadRequest,
      `No query parameters supplied. ${exampleParamsTemplate}`
    );
  }
  if (typeof query.url !== "string" || typeof query.device !== "string") {
    throw new ClientFacingError(
      StatusCode.ClientErrorBadRequest,
      `Query parameters incorrect. ${exampleParamsTemplate}`
    );
  }
  return {
    url: query.url,
    deviceID: query.device,
  };
}

app.get("/", async (req, res, next) => {
  try {
    const params = extractDevicerParameters(req);
    const devicer = new Devicer(params);
    const deviceImage = await devicer.generate();
    res.contentType("image/png").status(StatusCode.SuccessOK).end(deviceImage);
  } catch (err) {
    return next(err);
  }
});

app.get("/devices", async (req, res) => {
  res.send(Object.keys(devices));
});

/**
 * Middleware for handling errors that are thrown.
 * Express middleware documentation - https://expressjs.com/en/guide/using-middleware.html
 */
export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  /* If a client facing error, send error as a reponse */
  if (err instanceof ClientFacingError) {
    res.status(err.statusCode).send(err.body);
  } else {
    /* Send generic error. */
    res.sendStatus(StatusCode.ServerErrorInternal);
  }
};

app.use("/", errorMiddleware);

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
