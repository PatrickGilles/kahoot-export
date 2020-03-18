import XLSX from "xlsx";
import dotenv from "dotenv";
import fs from "fs";
import kahoot from "./kahoot-api.js";
import inquirer from "inquirer";
import { userInfo } from "os";

function help(message) {
  if (message) {
    console.log("-".repeat(message.length));
    console.log(message);
    console.log("-".repeat(message.length));
  }
  console.log(`
A utility to upload/download Kahoot! quizzes to/from www.kahoot.it.
Kahoots are stored locally as .xlsx Excel files.

usage: kahoot-util <action> [args...]

Actions:
    help          Output usage information
    get <uuid>    Download a specific Kahoot to an Excel file
    get-all       Download all Kahoots owned by this user to Excel files
    put <path>    Upload Kahoot from Excel file at <path>
    put-all       Upload all Kahoots in current folder

NB: put and put-all will replace any/all existing Kahoots with
the same title(s) in your www.kahoot.it account!

You will be prompted for your Kahoot email and password.
You can avoid entering your email every time by setting
an environment variable called KAHOOT_EMAIL. For security
reasons, you will have to enter your password every time.

Examples:
    $ kahoot-util get 8062ad52-49af-485d-93fc-5534925b087f
    $ kahoot-util get-all
    $ kahoot-util put "./My New Kahoot.xlsx"
    $ kahoot-util put-all

`);
  process.exit();
}

async function getKahootUser() {
  let user = process.env.KAHOOT_USER;
  let answers;
  if (user) {
    console.log("Logging in as " + user);
  } else {
    answers = await inquirer.prompt([
      { type: "input", name: "username", message: "Kahoot Email:" }
    ]);
    user = answers.username;
  }
  answers = await inquirer.prompt([
    { type: "password", name: "password", message: "Password:" }
  ]);
  const password = answers.password;
  return { user, password };
}

function parse_action(args) {
  switch (args[0]) {
    case "get":
      if (args.length != 2) help("Action 'get' requires a Kahoot UUID");
      console.log("Action: get");
      break;
    case "get-all":
      console.log("Action: get-all");
      break;
    case "put":
      if (args.length != 2)
        help("Action 'put' requires a path to a .xlsx file");
      console.log("Action: put");
      break;
    case "put-all":
      console.log("Action: put-all");
      break;
    default:
      help(`Invalid action: ${args[0]}`);
  }
}

dotenv.config();
process.argv.shift();
let args = process.argv.filter(x => !x.includes("kahoot-util"));

getKahootUser()
  .then(details => kahoot.authenticate(details.user, details.password))
  .then(parse_action(args))
  // .then(() => kahoot.get("z8062ad52-49af-485d-93fc-5534925b087f"))
  // .then(res => {
  //   console.log(res.data);
  //   process.exit();
  // })
  .catch(err =>
    console.error(
      "Login failed! Please check Kahoot username (email) and password."
    )
  );

// switch (args[0]) {
//   case "get":
//     if (args.length != 2) help("Action 'get' requires a Kahoot UUID");
//     console.log("Action: get");
//     break;
//   case "get-all":
//     console.log("Action: get-all");
//     break;
//   case "put":
//     if (args.length != 2) help("Action 'put' requires a path to a .xlsx file");
//     console.log("Action: put");
//     break;
//   case "put-all":
//     console.log("Action: put-all");
//     break;
//   default:
//     help(`Invalid action: ${args[0]}`);
// }

// process.exit();

// let wb = XLSX.readFile("./KahootQuizTemplate.xlsx");
// let jsSheet = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
// let title = process.argv.slice(2).join(" ");

// kahoot
//   .authenticate(process.env.KAHOOT_EMAIL, process.env.KAHOOT_PASSWORD)
//   .then(res => {
//     kahoot.get("8062ad52-49af-485d-93fc-5534925b087f").then(res => {
//       console.log(res.data);
//       process.exit();
//     });
//     kahoot
//       .find(title)
//       .then(res => {
//         const quiz = res.data.entities[0];
//         quiz.questions.forEach((q, i) => {
//           let obj = {
//             __EMPTY: i + 1,
//             __EMPTY_1: q.question
//           };
//           let correct = [];
//           q.choices.forEach((choice, i) => {
//             obj[`__EMPTY_${i + 2}`] = choice.answer;
//             if (choice.correct) correct.push(i + 1);
//           });
//           obj["__EMPTY_6"] = Math.floor(q.time / 1000);
//           obj["__EMPTY_7"] = correct.join(",");
//           jsSheet[i + 6] = obj;
//         });
//         wb.Sheets[wb.SheetNames[0]] = XLSX.utils.json_to_sheet(jsSheet);
//         // fs.writeFileSync(`./kahoots/${title}.json`, JSON.stringify(quiz));
//         XLSX.writeFile(wb, `./kahoots/${title}.xlsx`);
//       })
//       .catch(err => console.error(err));
//   })
//   .catch(err => console.error(err));
