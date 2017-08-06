const BasicCard = require("./BasicCard");
const ClozeCard = require("./ClozeCard");
const inquirer = require("inquirer");
const fs = require("fs");
var correct = 0;
var wrong = 0;
var cardArray = [];
// ********************************* Main Process *************************************

const flashcards = () => {

        inquirer.prompt([{

                type: 'list',
                name: 'userType',
                message: 'What would you like to do?',
                choices: ['  Create Basic Cards', '  Create-Cloze-cards', '  Basic Quiz', '  Cloze Quiz', 'QUIT']
            }

        ]).then(function(choice) {

            if (choice.userType === '  Create Basic Cards') {
                readCards('log.txt');
                createCards(basicPrompt, 'log.txt');
            } else if (choice.userType === '  Create-Cloze-cards') {
                readCards('cloze-log.txt');
                createCards(clozePrompt, 'cloze-log.txt');
            } else if (choice.userType === '  Basic Quiz') {
                quiz('log.txt', 0);
            } else if (choice.userType === '  Cloze Quiz') {
                quiz('cloze-log.txt', 0);
            } else if (choice.userType === 'QUIT') {
                console.log('Ok Hombres, thanks for playing! Catch you later');
            }
        });
    }
    //***************************************** Functions *********************************

const readCards = (logFile) => {
    cardArray = [];
    //This grabs any previously created cards and saves them to a new array...
    fs.readFile(logFile, "utf8", function(error, data) {

        var jsonContent = JSON.parse(data);

        for (let i = 0; i < jsonContent.length; i++) {
            cardArray.push(jsonContent[i]);
        }
    });
};

const createCards = (promptType, logFile) => {

    inquirer.prompt(promptType).then(function(answers) {

        cardArray.push(answers);

        if (answers.makeMore) {

            createCards(promptType, logFile);
        } else {

            writeToLog(logFile, JSON.stringify(cardArray));
            flashcards();
        }
    });
};

const quiz = (logFile, x) => {

    fs.readFile(logFile, "utf8", function(error, data) {

        var jsonContent = JSON.parse(data);

        if (x < jsonContent.length) {

            if (jsonContent[x].hasOwnProperty("front")) {

                var gameCard = new BasicCard(jsonContent[x].front, jsonContent[x].back);
                var gameQuestion = gameCard.front;
                var gameAnswer = gameCard.back.toLowerCase();
            } else {
                var gameCard = new ClozeCard(jsonContent[x].text, jsonContent[x].cloze);
                var gameQuestion = gameCard.message;
                var gameAnswer = gameCard.cloze.toLowerCase();
            }

            inquirer.prompt([{
                name: "question",
                message: gameQuestion,
                validate: function(value) {

                    if (value.length > 0) {
                        return true;
                    }
                    return 'REALLY?!!?  At least take a guess pardner...';
                }

            }]).then(function(answers) {

                if (answers.question.toLowerCase().indexOf(gameAnswer) > -1) {
                    console.log('Correct!');
                    correct++;
                    x++;
                    quiz(logFile, x);
                } else {
                    gameCard.printAnswer();
                    wrong++;
                    x++;
                    quiz(logFile, x);
                }

            })

        } else {
            console.log('Here\'s how you did: ');
            console.log('CORRECT GUESSES: ' + correct);
            console.log('WRONG GUESSES: ' + wrong);
            correct = 0;
            wrong = 0;
            flashcards();
        }
    });
};

const writeToLog = (logFile, info) => {

    fs.writeFile(logFile, info, function(err) {
        if (err)
            console.error(err);
    });
}

const basicPrompt = [{
    name: "front",
    message: "Enter Front of Card: "
}, {
    name: "back",
    message: "Enter Back of Card: "

}, {
    type: 'confirm',
    name: 'makeMore',
    message: 'Create another card (hit enter for YES)?',
    default: true
}]

const clozePrompt = [{
    name: "text",
    message: "Type a full sentence and put the word you want guessed in parentheses, i.e: 'The color of a cherry is (red)'",
    validate: function(value) {
        var parentheses = /\(\w.+\)/;
        if (value.search(parentheses) > -1) {
            return true;
        }
        return 'You forgot to put parentheses around a word in your sentence'
    }
}, {
    type: 'confirm',
    name: 'makeMore',
    message: 'Create another card (hit enter for YES)?',
    default: true
}]

const makeMore = {
    //Prompt to find out if user wants to make more cards (default is yes)
    type: 'confirm',
    name: 'makeMore',
    message: 'Create another card (hit enter for YES)?',
    default: true
}

flashcards();
