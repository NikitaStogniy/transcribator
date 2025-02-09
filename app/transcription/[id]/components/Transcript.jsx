import { forwardRef } from "react";

const Transcript = forwardRef(({ words }, ref) => {
  if (!words?.length) {
    return <div>Транскрипция не доступна</div>;
  }

  let currentSpeaker = null;
  return (
    <div ref={ref} className="transcript">
      {words.map((word, index) => {
        const speakerChange = word.speaker !== currentSpeaker;
        currentSpeaker = word.speaker;

        return (
          <span key={index}>
            {speakerChange && word.speaker && (
              <div className="speaker-label">Говорящий {word.speaker}</div>
            )}
            <span className="word" data-start={word.start}>
              {word.text}{" "}
            </span>
          </span>
        );
      })}
    </div>
  );
});

Transcript.displayName = "Transcript";

export default Transcript;
