import fs from "fs";
import { PDFParse } from "pdf-parse";

const extractTextFromPDF = async (filePath) => {
  try {
    console.log("PDF PATH:", filePath);

    const dataBuffer = fs.readFileSync(filePath);

    console.log("PDF SIZE:", dataBuffer.length);

    const parser = new PDFParse({
      data: dataBuffer,
    });

    const result = await parser.getText();

    console.log("PDF TEXT LENGTH:", result.text?.length);

    await parser.destroy();

    return result.text;
  } catch (error) {
    console.error("========== PDF EXTRACTION ERROR ==========");
    console.error(error);
    console.error("==========================================");

    throw new Error("Failed to extract text from PDF");
  }
};

export default extractTextFromPDF;
