import express from "express";
import axios from "axios";
import { decodeHTML } from "entities";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static("public"));

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

let correctAns;

// Route for displaying a trivia question
app.get("/", async (req, res) => {
    try {
        let dayOrNight;
        const nHour = new Date().getHours();
        if (nHour < 6) {
            dayOrNight = "Night";
        } else if (nHour < 18) {
            dayOrNight = "Day";
        } else {
            dayOrNight = "Night";
        }

        // Fetch a random trivia question from the Open Trivia Database API
        const result = await axios.get("https://opentdb.com/api.php?amount=1");
        let dObj = result.data.results[0];
        const category = dObj.category;
        let difficulty = dObj.difficulty;
        difficulty = difficulty[0].toUpperCase() + difficulty.slice(1);
        const question = decodeHTML(dObj.question);
        correctAns = decodeHTML(dObj.correct_answer);

        let answers = [];
        if (dObj.type === "boolean") {
            answers = ["True", "False"];
        } else {
            answers = dObj.incorrect_answers;
            const insInd = Math.floor(Math.random() * 3);
            answers.splice(insInd, 0, correctAns);
        }

        answers = decodeHTML(answers.join("===")).split("===");
        const params = {
            dayOrNight: dayOrNight,
            category: category,
            difficulty: difficulty,
            question: question,
            answers: answers,
        };

        console.log(params);
        // Render the "index.ejs" template with question data
        res.render("index.ejs", params);
    } catch (error) {
        console.error("Error fetching question:", error.message);
        res.status(500).send("Error fetching question");
    }
});

// Route for submitting an answer
app.post("/submit", async (req, res) => {
    try {
        const selectedOpt = req.body.ansOpt;
        console.log(correctAns);
        console.log(selectedOpt);
        
        if (correctAns === selectedOpt) {
            // Fetch a joke from the JokeAPI if the answer is correct
            const result = await axios.get("https://v2.jokeapi.dev/joke/Any?type=single");
            const jokeContent = result.data.joke;
            console.log(jokeContent);
            res.render("submit.ejs", { verdict: true, jokeContent: jokeContent });
        } else {
            res.render("submit.ejs", { verdict: false });
        }
    } catch (error) {
        console.error("Error processing answer:", error.message);
        res.status(500).send("Error processing answer");
    }
});

// Start the server
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
