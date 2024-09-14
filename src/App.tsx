import { useCallback, useEffect, useMemo, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import questionsJson from "./assets/questions.json";

type Question = {
  statement: string;
  correctAnswer: string;
  options: QuestionOption[];
};

type QuestionOption = {
  label: string;
  value: string;
  explanation: string;
};

function App() {
  const [questions, _] = useState<Question[]>(questionsJson);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | undefined
  >();

  const [showAnswer, setShowAnswer] = useState(false);

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const currentQuestion = useMemo<Question | undefined>(() => {
    if (currentQuestionIndex == undefined) return;

    return questions[currentQuestionIndex];
  }, [currentQuestionIndex]);

  const handleStart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
  }, []);

  const handleUpdateAnswer = useCallback(
    (answerValue: string) => {
      const newAnswers = {
        ...answers,
        [currentQuestionIndex!]: answerValue,
      };

      setAnswers(newAnswers);

      localStorage.setItem(
        "FAZ_O_SIMULADO_PRO_PAI_ANSWERS",
        JSON.stringify(newAnswers)
      );
    },
    [answers, currentQuestionIndex]
  );

  const handleReset = useCallback(() => {
    setAnswers({});
    setCurrentQuestionIndex(-1);

    localStorage.removeItem("FAZ_O_SIMULADO_PRO_PAI_ANSWERS");
  }, []);

  useEffect(() => {
    const existingAnswers = JSON.parse(
      localStorage.getItem("FAZ_O_SIMULADO_PRO_PAI_ANSWERS") || "{}"
    );

    if (Object.keys(existingAnswers).length > 0) {
      setAnswers(existingAnswers);
      setCurrentQuestionIndex(Number(Object.keys(existingAnswers)[0]));
    }
  }, [setAnswers]);

  return (
    <div style={{ padding: "4rem", height: "100%" }}>
      {!currentQuestion && <button onClick={handleStart}>Start</button>}

      {currentQuestion && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <button onClick={handleReset}>Reset</button>
            <button onClick={() => setShowAnswer(!showAnswer)}>
              {showAnswer ? "Hide answers" : "Show answers"}
            </button>
          </div>

          <div>
            <h3 style={{ display: "block", textAlign: "left" }}>
              {currentQuestionIndex! + 1}. {currentQuestion.statement}
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "2rem",
              }}
            >
              {currentQuestion.options.map((p) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "center",
                    gap: "1rem",
                    flexDirection: "column",
                    textAlign: "justify",
                    padding: 4,
                  }}
                  key={p.value}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="radio"
                      id={p.label}
                      name="answer"
                      value={p.value}
                      checked={answers[currentQuestionIndex!] === p.value}
                      onChange={() => handleUpdateAnswer(p.value)}
                    />
                    <label
                      htmlFor={p.label}
                      style={{
                        padding: 4,
                        ...(showAnswer &&
                        p.value === currentQuestion.correctAnswer
                          ? {
                              background: "#98e667",
                              borderRadius: 4,
                              color: "#000",
                              fontWeight: "bold",
                            }
                          : {}),
                        ...(showAnswer &&
                        answers[currentQuestionIndex!] !== undefined &&
                        answers[currentQuestionIndex!] !==
                          currentQuestion.correctAnswer &&
                        answers[currentQuestionIndex!] === p.value
                          ? {
                              background: "#dd5353",
                              borderRadius: 4,
                              fontWeight: "bold",
                            }
                          : {}),
                      }}
                    >
                      {p.label}
                    </label>
                  </div>

                  {showAnswer && (
                    <span style={{ marginLeft: "2rem", color: "#757575" }}>
                      {p.explanation}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                disabled={currentQuestionIndex! === 0}
                onClick={() =>
                  setCurrentQuestionIndex(currentQuestionIndex! - 1)
                }
              >
                Previous
              </button>
              <button onClick={() => setCurrentQuestionIndex(0)} style={{}}>
                {"<<"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  style={{
                    padding: "0.4rem",
                    width: "2rem",
                    height: "2rem",
                    ...(currentQuestionIndex === index && {
                      background: "#444",
                      border: "solid 1px #fff",
                    }),
                    ...(answers[index] && {
                      opacity: 0.25,
                    }),
                    ...(showAnswer && {
                      background:
                        answers[index] !== questions[index].correctAnswer
                          ? "#dd5353"
                          : "#98e667",
                    }),
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                disabled={currentQuestionIndex! === questions.length - 1}
                onClick={() =>
                  setCurrentQuestionIndex(currentQuestionIndex! + 1)
                }
              >
                Next
              </button>
              <button
                onClick={() => setCurrentQuestionIndex(questions.length - 1)}
                style={{}}
              >
                {">>"}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentQuestion && currentQuestionIndex! >= questions.length && (
        <h1>See results</h1>
      )}
    </div>
  );
}

export default App;
