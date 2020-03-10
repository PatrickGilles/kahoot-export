import axios from "axios";
import XLSX from "xlsx";
import dotenv from "dotenv";
import fs from "fs"
import { URL } from "url";

dotenv.config();

if (process.argv.length < 3) {
  console.log(
    "Export a Kahoot! with a given title.\nCreates an .xlsx file with the same name as the Kahoot! title in ./kahoots/"
  );
    console.log("Example Usage: npm start My Kahoot Title");
    process.exit()
}

const endpoint = "https://create.kahoot.it/rest";

function authenticate(username, password) {
  return axios.post(`${endpoint}/authenticate`, {
    grant_type: "password",
    username,
    password
  });
}

function getKahoot(uuid) {
  return axios.get(`${endpoint}/kahoots?cursor=30&query=Janel_Instructor`) ///${uuid}`);
}

function getKahootByName(name) {
  return axios.get(`${endpoint}/kahoots/browse/private?limit=1&query=${name}`);
}

let wb = XLSX.readFile("./KahootQuizTemplate.xlsx");
let jsSheet = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

authenticate(process.env.KAHOOT_EMAIL, process.env.KAHOOT_PASSWORD)
  .then(res => {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${res.data.access_token}`;
    // getKahootByName('API Test Kahoot').then(res => console.log(res.data.entities))
    // getKahoot("8062ad52-49af-485d-93fc-5534925b087f")
    const title = process.argv.slice(2).join(" ")
    getKahoot(0).then(res => console.log(res.data))
    getKahootByName(title)
      .then(res => {
        const quiz = res.data.entities[0]
        quiz.questions.forEach((q, i) => {
          let obj = {
            __EMPTY: i + 1,
            __EMPTY_1: q.question
          };
          let correct = [];
          q.choices.forEach((choice, i) => {
            obj[`__EMPTY_${i + 2}`] = choice.answer;
            if (choice.correct) correct.push(i + 1);
          });
          obj["__EMPTY_6"] = Math.floor(q.time / 1000);
          obj["__EMPTY_7"] = correct.join(",");
          jsSheet[i + 6] = obj;
        });
        wb.Sheets[wb.SheetNames[0]] = XLSX.utils.json_to_sheet(jsSheet);
        fs.writeFileSync(`./kahoots/${title}.json`, JSON.stringify(quiz))
        XLSX.writeFile(wb, `./kahoots/${title}.xlsx`);
      })
      .catch(err => console.error(err));
  })
  .catch(err => console.error(err));
