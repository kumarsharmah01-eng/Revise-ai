import "dotenv/config";
import generateQuiz from "./src/utils/aiGenerator.js";

const test = async () => {
  try {
    const quiz = await generateQuiz(
      `
      DBMS is a software system used to manage databases.
      A database is an organized collection of data.
      Normalization is used to reduce data redundancy and improve data integrity.
      The first normal form requires atomic values.
      `,
      3,
    );

    console.log(JSON.stringify(quiz, null, 2));
  } catch (error) {
    console.error(error);
  }
};

test();
