/*****************************************************
 * QGib™ License and agreement:
 * QGib™ developed by CUCUMBER an OrSN Company ("Cucumber") is an open-source web-browser extension that manipulates text, per the
 * user request. The software is provided as-is and shall not be copied to other projects without Cucumber's written consent,
 * nor redistributed by any other party.
 *
 * By using the software, you release Cucumber, its employees and its affiliates from any claim and/or demand and/or complaint.
 * You will not seek any damages nor compensation as a result of using this software.
 *
 * By contributing code/content/ideas to this project you agree that:
 * 1. Your submissions and their contents can be used by Cucumber and its affiliates without any compensation to you.
 * 2. Cucumber may use or redistribute the submissions and their contents for any purpose and in any way.
 * 3. You will not contribute code to this project that contains malicious software/scripts/viruses or
 * any other code that might harm others.
 * 4. There is no obligation for Cucumber to review the submissions or to keep them confidential.
 *
 * Cucumber reserves its rights to change this agreement at anytime, without a prior notice and to cease distributing this
 * project as an open-source as a whole or parts of it, at present or at the future.
 *
 * Please feel free to contact Cucumber with any question that you may have at:
 * HelpDeskCucumber@Yahoo.Com
 *******************************************************/

// The selected text which we'll manipulate
var selectedText;

// All text in the component from which the reader selected text
var allText;

// The type of the text component: TextContent/Value/Something else
var textType;

// Contains the foreign dictionaries
var foreignToEnglishDictionaries = [
    arabicToEnglishDict,
    hebrewToEnglishDict
];

LoadForeignLanguagePreference()
{
    foreignLanguagePreference = LoadForeignLanguagePreference();
}

async function Main()
{
    foreignLanguagePreference = LoadForeignLanguagePreference();

    //todo: Once distributed to other products i.e. Doc, header etc, rethink the product variable!
    let product = "Update";
    //const isTextNotEmpty = await GetTextFromComponent(product)
    await GetTextFromComponent(product);
}

// Getting the selected text and the entire text.
// product: The content in which the app is currently running (Update/Doc etc)
async function GetTextFromComponent(product)
{
    allText = "";
    selectedText = "";
    //console.log(selectedText.length);

    monday.listen("context", (res) => {
        allText = res.data.input;
        if(allText.toString().trim())
        {
            MainLogic(product);
            return true;
        }
        else
        {
            NoTextHandler();
        }
    });
}

// The main logic of the app. Running fully after allText received its data.
async function MainLogic(product) {

    document.getElementById('QGibConfirmBtn').style.visibility= 'block';
    document.getElementById('alSafaConfirmBtn').style.visibility= 'block';

    if(selectedText.length > 0)
    {
        return;
    }

    // todo: Update is currently not supporting text selection.
    //  Keep an eye on that, and change accordingly once this feature is supported!
    if(product === "Update")
    {
        selectedText = allText;
    }

    let convertedText = ConvertText();
    //console.log(textToConvert);

    ShowPreviewOfToChangedText(convertedText);
    await ShowQAIPreviewOfToChangedText(convertedText);
}

// Handling the event where there is no text.
function NoTextHandler()
{
    ShowPreviewOfToChangedText("You can type, That's okay!")
    document.getElementById('QGibConfirmBtn').style.visibility= 'hidden';

    ShowQAIPreviewOfToChangedText("You can type, That's okay!")
    document.getElementById('alSafaConfirmBtn').style.visibility= 'hidden';
}

// Converting the text from one language to another.
function ConvertText()
{
    let arrayOfWords = TextParser(selectedText.toString().trim());

    arrayOfWords = ConvertingWords(arrayOfWords);

    arrayOfWords = BasicTextCorrecting(arrayOfWords);

    return ArrayToStringConverter(arrayOfWords);
}

// Parsing the text to an array of words.
// If we're before converting, then we only want to parse by whitespaces. In that case, wasProcessed = false.
// After converting, we want to apply basic writing rules. Therefore we will call the function with wasProcessed = true.
function TextParser(text, wasProcessed = false)
{
    let output = [];

    // The text was processed, hence it is safe to separate punctuation
    // from the words and prepare them for post-processing
    if(wasProcessed)
    {
        output = text.split(/([ !?,.]+)/).filter(Boolean);
    }
    // The punctuation might be part of the word that needs to be converted.
    else
    {
        output = text.split(/(?<=\w)([ ]+)/);
    }

    return output;
}

// Getting an array of words, and converting each word
function ConvertingWords(arrayOfWords)
{
    let output = "";

    for(let index = 0; index < arrayOfWords.length; index++)
    {
        output += WordConverter(word = arrayOfWords[index],
            classification = WordClassifier(arrayOfWords[index]));
    }

    return TextParser(text = output, wasProcessed = true);
}

// Performing basic text correcting such as removing redundant spaces, or adding a space after a comma/period etc
function BasicTextCorrecting(arrayOfWords)
{
    // For list of checks, please refer to BasicTextChecker.js
    for(let index = 0; index < arrayOfWords.length; index++)
    {
        arrayOfWords[index] = BasicCorrecter(arrayOfWords[index]);
    }

    //alert(arrayOfWords);
    return arrayOfWords;
}

// Converting an array of words to a string.
function ArrayToStringConverter(arrayOfWords)
{
    let output = "";

    for(let index = 0; index < arrayOfWords.length; index++)
    {
        output += arrayOfWords[index];
    }

    return output;
}

// Showing a preview of the result text
function ShowPreviewOfToChangedText(inputText)
{
    document.getElementById("QGibPreviewBox").innerText = inputText;
}

// Showing preview of the result text with QAI Al-Safa
async function ShowQAIPreviewOfToChangedText(inputText)
{
    try
    {
        let output = await RunGrammarCorrection(inputText);
        document.getElementById("alSafaPreviewBox").innerText = output.toString().trim();

    }
    catch (error)
    {
        console.log(error);

        document.getElementById("alSafaPreviewBox").innerText =
            "We encountered a problem while applying QAI Al-Safa to your text. " +
            "We are sorry for any inconvenience this may cause."

        document.getElementById('alSafaConfirmBtn').style.visibility= 'hidden';


    }

}

// Replacing the text once the customer confirmed the proposed change.
function ReplaceText()
{
    monday.execute("updatePostContentAction", {
        suggestedRephrase: document.getElementById("QGibPreviewBox").innerHTML});
    monday.execute("closeDialog");
}

function ReplaceTextWithAlSafa()
{
    monday.execute("updatePostContentAction", {
        suggestedRephrase: document.getElementById("alSafaPreviewBox").innerHTML});
    monday.execute("closeDialog");
}

// Return the start position of the selected text
function GetStart()
{
    let textArea = document.activeElement;

    if(textType === "textContent")
    {
        return window.getSelection().anchorOffset;
    }

    return textArea.selectionStart;
}

// Return the end position of the selected text
function GetFinish()
{
    let textArea = document.activeElement;

    if(textType === "textContent")
    {
        return window.getSelection().focusOffset;
    }

    return textArea.selectionEnd;
}