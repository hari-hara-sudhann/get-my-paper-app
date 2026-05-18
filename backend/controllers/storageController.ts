import type { Router, Request, Response } from "express";
import express from "express";
import { getDocument, saveDocument } from "../services/storageService.js";
import type { Code, Document } from "../types/responseTypes.js";

const router: Router = express.Router();

router.post("/upload", async (req: Request, res: Response) => {
  try {
    const documentBody =
      typeof req.body?.body === "string" ? req.body.body.trim() : "";

    if (!documentBody) {
      res.status(400).json({ error: "A PDF payload is required." });
      return;
    }

    const code: string = await saveDocument(documentBody);
    const response: Code = {
      code,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Unable to store the document right now." });
  }
});

router.post("/download", async (req: Request, res: Response) => {
  try {
    const code = String(req.body?.code ?? "").trim();

    if (!/^\d{4}$/.test(code)) {
      res.status(400).json({ error: "A valid 4-digit code is required." });
      return;
    }

    const document = await getDocument(code);

    if (document === null) {
      res.status(404).json({ error: "No document was found for that code." });
      return;
    }

    const response: Document = {
      body: document,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Download failed:", error);
    res
      .status(500)
      .json({ error: "Unable to retrieve the document right now." });
  }
});

export default router;
