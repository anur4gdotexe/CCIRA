const fs = require("fs/promises");
const path = require("path");

const AI_API_URL = process.env.AI_API_URL || "http://127.0.0.1:8000";
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 12000);

const buildAnalyzeForm = async (text, imagePath) => {
 const form = new FormData();
 form.append("text", text || "");

 if (imagePath) {
    const isRemoteUrl = /^https?:\/\//i.test(imagePath);

    if (isRemoteUrl) {
     const imageResponse = await fetch(imagePath);

     if (!imageResponse.ok) {
        throw new Error(`Could not download image from URL: ${imageResponse.status}`);
     }

     const fileBuffer = Buffer.from(await imageResponse.arrayBuffer());
     const urlPathname = new URL(imagePath).pathname;
     const fileNameFromUrl = path.basename(urlPathname) || "complaint-image.jpg";
     form.append("image", new Blob([fileBuffer]), fileNameFromUrl);
    } else {
     const fileBuffer = await fs.readFile(imagePath);
     const fileName = path.basename(imagePath);
     form.append("image", new Blob([fileBuffer]), fileName);
    }
 }

 return form;
};

exports.classifyComplaint = async ({ text, imagePath }) => {
 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

 try {
  const form = await buildAnalyzeForm(text, imagePath);

  const response = await fetch(`${AI_API_URL}/analyze`, {
   method: "POST",
   body: form,
   signal: controller.signal
  });

  if (!response.ok) {
   throw new Error(`AI API error: ${response.status}`);
  }

  const payload = await response.json();
  const analysis = payload?.analysis;

  if (!analysis?.category || !analysis?.department) {
   throw new Error("Invalid AI response schema");
  }

  return {
   category: analysis.category,
   department: analysis.department,
   source: analysis.source || "ai",
   urgency: analysis.urgency,
   priorityScore: analysis.priority_score,
   confidence: analysis.confidence,
   keywords: analysis.keywords || []
  };
 } catch (error) {
    console.error("AI integration failed:", {
    message: error.message,
    imagePath: imagePath || null
   });

   if (error.name === "AbortError") {
    throw new Error(`AI request timed out after ${AI_TIMEOUT_MS}ms`);
   }

   throw error;
 } finally {
  clearTimeout(timeout);
 }
};