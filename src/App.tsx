import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

import questionsJson from "./assets/parsed-questions.json";

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

  const [showAnswers, setShowAnswers] = useState(false);

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const currentQuestion = useMemo<Question | undefined>(() => {
    if (currentQuestionIndex == undefined) return;

    return questions[currentQuestionIndex];
  }, [currentQuestionIndex]);

  const score = useMemo(() => {
    return Object.entries(answers).reduce((acc, [index, answer]) => {
      if (questions[Number(index)].correctAnswer === answer) {
        acc++;
      }

      return acc;
    }, 0);
  }, [answers, questions]);

  const [passCriteria, setPassCriteria] = useState(
    Number(localStorage.getItem("GERA_O_SIMULADO_PRO_PAI_PASS_CRITERIA")) || 0
  );

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
        "GERA_O_SIMULADO_PRO_PAI_ANSWERS",
        JSON.stringify(newAnswers)
      );
    },
    [answers, currentQuestionIndex]
  );

  const handleReset = useCallback(() => {
    setAnswers({});
    setCurrentQuestionIndex(-1);

    localStorage.removeItem("GERA_O_SIMULADO_PRO_PAI_ANSWERS");
  }, []);

  const handlePassCriteriaChange = useCallback(() => {
    let newCriteria = prompt(
      `How much to pass?\n(Current is ${passCriteria * 100}%, I recommend 85%)`,
      String(passCriteria * 100)
    )?.trim();

    if (!newCriteria) {
      return;
    }

    if (newCriteria?.includes("%")) {
      newCriteria = newCriteria.replace("%", "").trim();
    }

    if (isNaN(Number(newCriteria))) {
      alert("You kidding, right?");
      handlePassCriteriaChange();
      return;
    }

    localStorage.setItem(
      "GERA_O_SIMULADO_PRO_PAI_PASS_CRITERIA",
      String(Number(newCriteria) / 100)
    );
    setPassCriteria(Number(newCriteria) / 100);
  }, [passCriteria]);

  useEffect(() => {
    const existingAnswers = JSON.parse(
      localStorage.getItem("GERA_O_SIMULADO_PRO_PAI_ANSWERS") || "{}"
    );

    if (Object.keys(existingAnswers).length > 0) {
      setAnswers(existingAnswers);
      setCurrentQuestionIndex(Number(Object.keys(existingAnswers)[0]));
    }

    if (!localStorage.getItem("GERA_O_SIMULADO_PRO_PAI_PASS_CRITERIA")) {
      localStorage.setItem("GERA_O_SIMULADO_PRO_PAI_PASS_CRITERIA", "0.8");
      setPassCriteria(0.8);
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
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {showAnswers ? (
              <div>
                <div>
                  <span>You got </span>
                  <strong
                    style={{
                      fontSize: 24,
                      padding: 4,
                      borderBottom: "solid 1px",
                      cursor: "pointer",
                      color:
                        score / questions.length >= passCriteria
                          ? "#98e667"
                          : "#dd5353",
                    }}
                    onClick={handlePassCriteriaChange}
                    title={`You need ${passCriteria * 100}% to pass`}
                  >
                    {(score / questions.length).toFixed(2)}
                  </strong>
                  <span>%</span>
                </div>
                <span
                  style={{
                    display: "block",
                    marginTop: 4,
                    color: "#757575",
                    fontSize: 14,
                  }}
                >
                  ({score} out of {questions.length})
                </span>
              </div>
            ) : (
              <div />
            )}

            <div
              style={{
                display: "flex",
                gap: "1rem",
              }}
            >
              <button onClick={handleReset}>Reset</button>
              <button onClick={() => setShowAnswers(!showAnswers)}>
                {showAnswers ? "Hide answers" : "Show answers"}
              </button>
            </div>
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
                        ...(showAnswers &&
                        p.value === currentQuestion.correctAnswer
                          ? {
                              background: "#98e667",
                              borderRadius: 4,
                              color: "#000",
                              fontWeight: "bold",
                            }
                          : {}),
                        ...(showAnswers &&
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

                  {showAnswers && (
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
                    ...(showAnswers && {
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
