import fs from "fs";
import pdf from "pdf-parse";

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.log("PDF extraxtion error :", error);
    throw new Error("failed to extract text from PDF");
  }
};

export default extractTextFromPDF;
