import axios from "axios";
import XLSX from "xlsx";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

if (process.argv.length != 3) {
  console.log(
    "Upload a Kahoot! from an Excel file.\nFile must be based on the standard Kahoot! template.\nThe title of the Kahoot! will be the same as the filename (without .xlsx)"
  );
  console.log("Usage: node upload.js <XLSX file path>");
  process.exit();
}

const filename = process.argv[2];

const endpoint = "https://create.kahoot.it/rest";

function authenticate(username, password) {
  return axios.post(`${endpoint}/authenticate`, {
    grant_type: "password",
    username,
    password
  });
}

function uploadKahoot(quiz) {
  return axios.post(`${endpoint}/kahoots`, quiz);
}

let jsonQuiz = fs.readFileSync("./KahootQuizTemplate.json");
let quiz = JSON.parse(jsonQuiz);

let wb = XLSX.readFile(filename);
let jsSheet = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

// Convert sheet JSON to correct JSON format for Kahoot
let rownum = 6;
let path = filename.split(".");
path.pop();
quiz.title = path.join("").split("/").pop();
quiz.questions = [];

while (jsSheet[rownum].__EMPTY_7) {
  // while the current question has answers
  let row = jsSheet[rownum++];
  let question = {
    type: "quiz",
    layout:
      row.__EMPTY_2 == "True" || row.__EMPTY_2 == "False"
        ? "TRUE_FALSE"
        : "CLASSIC",
    question: row.__EMPTY_1,
    time: 1000 * row.__EMPTY_6
  };
  let answers = [];
  for (let i = 2; i < 6; i++) {
    let answer = row[`__EMPTY_${i}`];
    let correct = row.__EMPTY_7.indexOf(i - 1) != -1;
    if (answer) answers.push({ answer, correct });
  }
  question["choices"] = answers;
  // console.log(question)
  quiz.questions.push(question);
  // console.log(quiz); process.exit();
}

// res.data.questions.forEach((q, i) => {
//   let obj = {
//     __EMPTY: i + 1,
//     __EMPTY_1: q.question
//   };
//   let correct = [];
//   q.choices.forEach((choice, i) => {
//     obj[`__EMPTY_${i + 2}`] = choice.answer;
//     if (choice.correct) correct.push(i + 1);
//   });
//   obj["__EMPTY_6"] = Math.floor(q.time / 1000);
//   obj["__EMPTY_7"] = correct.join(",");
//   jsSheet[i + 6] = obj;
// });
// wb.Sheets[wb.SheetNames[0]] = XLSX.utils.json_to_sheet(jsSheet);
// fs.writeFileSync(`./kahoots/${res.data.title}.json`, JSON.stringify(res.data))
// XLSX.writeFile(wb, `./kahoots/${res.data.title}.xlsx`);

authenticate(process.env.KAHOOT_EMAIL, process.env.KAHOOT_PASSWORD)
  .then(res => {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${res.data.access_token}`;
    // getKahoot("8062ad52-49af-485d-93fc-5534925b087f")
    // getKahoot(process.argv[2])
    uploadKahoot(quiz)
      .then(res => {
        console.log(res.data);
      })
      .catch(err => console.error(err));
  })
  .catch(err => console.error(err));
