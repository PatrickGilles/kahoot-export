import axios from "axios";
import XLSX from "xlsx";
import dotenv from "dotenv";

dotenv.config();

if (process.argv.length != 3) {
  console.log(
    "Export a Kahoot! with a given UUID.\nCreates an .xlsx file with the same name as the Kahoot! title in ./kahoots/"
  );
    console.log("Usage: npm start <Kahoot UUID>");
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
  return axios.get(`${endpoint}/kahoots/${uuid}`);
}

let wb = XLSX.readFile("./KahootQuizTemplate.xlsx");
let jsSheet = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

authenticate(process.env.KAHOOT_EMAIL, process.env.KAHOOT_PASSWORD)
  .then(res => {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${res.data.access_token}`;
    // getKahoot("8062ad52-49af-485d-93fc-5534925b087f")
    getKahoot(process.argv[2])
      .then(res => {
        res.data.questions.forEach((q, i) => {
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
        XLSX.writeFile(wb, `./kahoots/${res.data.title}.xlsx`);
      })
      .catch(err => console.error(err));
  })
  .catch(err => console.error(err));
