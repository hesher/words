import words from "./Words.js";
import "./App.css";
import { useState, useEffect, useRef } from "react";

// const easyWords = [
//   "yehonatan",
//   "zohar",
//   "ben",
//   "tamar",
//   "bella",
//   "kieran",
//   "dog",
//   "cat",
//   "mom",
//   "dad",
//   "france",
//   "london",
//   "house",
//   "bottle",
// ];

const EXACT_BONUS = 2;
const NEW_WORD_MULTIPLIER = 2;

function App() {
  const { arr: chars, replace: replaceChars, setArr: setChars } = useArr();
  const { arr: tools, setArr: setTools } = useArr();
  const [score, setScore] = useState(0);
  const [word, setWord] = useState();

  const restart = () => {
    const daWord = words[
      Math.floor(Math.random() * words.length)
    ].toUpperCase();
    setWord(daWord);
    const arr = new Array(daWord.length)
      .fill(null)
      .map((_, ind) =>
        Math.random() > Math.max(0.2 + score / 300, 0.2) ||
        !isLetter(daWord[ind])
          ? daWord[ind]
          : null
      );

    setChars(arr);
    setScore(
      arr.filter((x) => x === null).length * NEW_WORD_MULTIPLIER + score
    );
    setTools([]);
  };

  useEffect(() => {
    if (score > 5 && tools.length === 0) {
      setTools([...tools, "CHAR_HINT"]);
    }

    if (score > 20 && tools.length === 1) {
      setTools([...tools, "CHAR_HINT"]);
    }
  }, [score]);

  useEffect(() => {
    if (chars.length === 0) {
      restart();
    } else if (chars?.filter((x) => x == null).length === 0 ?? false) {
      setTimeout(restart, 1000);
    }
  }, [chars]);

  return chars != null ? (
    <span className="app-container">
      <Score score={score} />
      <span className="word-container">
        {chars.map((c, index) =>
          c === null ? (
            <HiddenChar
              focused={chars.findIndex((x) => x == null) === index}
              key={index}
              onAttempt={(val) => {
                if (val.toLowerCase() === word[index].toLowerCase()) {
                  replaceChars(word[index], index);
                  setScore(score + EXACT_BONUS);
                } else if (
                  [...word].filter(
                    (curr) => curr.toLowerCase() === val.toLowerCase()
                  ).length >
                  chars.filter(
                    (curr) =>
                      curr !== null && curr.toLowerCase() === val.toLowerCase()
                  ).length
                ) {
                  [...word].forEach((c, ind) => {
                    if (
                      c.toLowerCase() === val.toLowerCase() &&
                      chars[ind] == null
                    ) {
                      replaceChars(c, ind);
                    }
                  });
                } else {
                  setScore(score - 3);
                }
              }}
            />
          ) : (
            <Char key={index} character={c} />
          )
        )}
      </span>
      <ToolContainer tools={tools} word={word} chars={chars} />
    </span>
  ) : (
    <div>Loading</div>
  );
}

const ToolContainer = ({ tools, word, chars }) => {
  return (
    <span className="tool-container">
      {tools.length === 0 ? (
        <span>Get a Hint When you reach 5</span>
      ) : (
        tools.map((tool) =>
          tool === "CHAR_HINT" ? <Hint word={word} chars={chars} /> : null
        )
      )}
    </span>
  );
};

const Hint = ({ word, chars }) => {
  const [dachar, setDachar] = useState();
  useEffect(() => {
    if (word != null) {
      const missing = chars
        .map((c, i) => (c == null ? word[i] : null))
        .filter((x) => x != null);
      const hintChar = missing[Math.floor(Math.random() * missing.length)];
      setDachar(hintChar);
    }
  }, [word]);
  return dachar != null ? <Char character={dachar} /> : null;
};

const HiddenChar = ({ onAttempt, focused }) => {
  const ref = useRef();
  const [val, setVal] = useState("");
  useEffect(() => {
    if (focused && ref.current != null) {
      ref.current.focus();
    }
  }, [focused]);
  return (
    <span className="character-container">
      <input
        onKeyDown={(e) => {
          if (e.code.startsWith("Key")) {
            onAttempt(e.key);
            setVal(e.key);
          }
        }}
        defaultValue={val}
        maxLength="1"
        ref={ref}
      />
    </span>
  );
};

const Score = ({ score }) => {
  const [isBig, setBig] = useState(false);
  useEffect(() => {
    setBig(true);
    setTimeout(() => {
      setBig(false);
    }, 200);
  }, [score]);
  return (
    <span className={`score-container ${isBig ? "big" : ""}`}>{score}</span>
  );
};

const Char = ({ character }) => (
  <span className="character-container good">{character}</span>
);

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

const useArr = (initial = []) => {
  const [arr, setArr] = useState(initial);

  const replace = (val, index) => {
    const newArr = [...arr];
    newArr.splice(index, 1, val);
    setArr(newArr);
  };

  return { arr, replace, setArr };
};

export default App;
