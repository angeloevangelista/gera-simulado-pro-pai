import fs from 'fs';
import path from 'path';

const rawQuestions = fs
  .readFileSync("/Users/angelo/www/gera-simulado-pro-pai/src/assets/raw-questions.txt")
  .toString()
  .trim()
  .split("/ 80")
  .filter(p => !!p)
  ;

const questions = rawQuestions.map(rawQuestion => {
  const questionLines = rawQuestion.split("\n").filter(p => !!p);

  const indexOfFirstOption = questionLines.findIndex(p => p.at(1) === ")");

  const indexOfFirstCorrection = questionLines.findIndex((p, index) =>
    index > indexOfFirstOption &&
    p.startsWith(questionLines[indexOfFirstOption].substring(0, 3)),
  );

  const statement = questionLines.slice(0, indexOfFirstOption).join(" ");

  const options = questionLines
    .slice(indexOfFirstOption, indexOfFirstCorrection)
    .reduce(
      (acc, next) => {
        const [value, label] = next.split(") ");

        if (!label || value.length > 1) {
          acc[acc.length - 1].label += " " + next;

          return acc;
        }

        acc.push({
          value,
          label,
        })

        return acc;
      },
      []
    );

  const corrections = questionLines
    .slice(indexOfFirstCorrection)
    .reduce(
      (acc, next) => {
        const [value, explanationSegment] = next.split(") ");

        if (!explanationSegment || value.length > 1) {
          acc[acc.length - 1].explanation += " " + next;

          return acc;
        }

        const [status, ...explanation] = explanationSegment.split(". ")

        acc.push({
          value,
          correct: status === "Correct",
          explanation: explanation.join(""),
        })

        return acc;
      },
      []
    );

  options.forEach(option => {
    const correction = corrections.find(p => p.value === option.value);

    option.explanation = correction.explanation;
  })

  const correctOptionValue = corrections.find(p => p.correct).value;

  return {
    statement,
    options,
    correctAnswer: correctOptionValue,
  };
}).reduce(
  (acc, next) => {
    if (!acc.find(p => p.statement === next.statement)) {
      acc.push(next);
    }

    return acc;
  },
  [],
);

fs.writeFileSync(
  "/Users/angelo/www/gera-simulado-pro-pai/src/assets/parsed-questions.json",
  JSON.stringify(questions, null, 2),
)