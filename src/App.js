import React, { useState, useEffect, useRef } from "react";
import * as ml5 from "ml5";

import "./App.css";
const sounds = [
  {label:'Heey',translation:'Που είσαι χαμένος;'},
  {label:'come_here',translation:'Έλα να σου πω.'},
  {label:'Hey_Whistle',translation:'Που είσαι χαμένος;'},
  {label:'Come_her_whistle',translation:'Έλα να σου πω.'},
]

function App() {
  const [label, setLabel] = useState("");
  const [isLoading,setIsLoading] = useState(true)
  const classifierRef = useRef(null);

  const classifySound = async () => {
    const options = {
      probabilityThreshold: 0.65,
      // audioContext: p.getAudioContext(),
    };
    classifierRef.current = await ml5.soundClassifier(
      `https://storage.googleapis.com/tm-model/JD8fWwrxe/model.json`,
      options,
      onModelReady
    );

   
  };

  function onModelReady() {
    console.log("Model is ready");
    setIsLoading(false)
    classifierRef.current.classify(onResult);
  }

  function onResult(error, results) {
    if (error) {
      console.error(error);
      return;
    }
    if (results[0].confidence >= 0.95 && results[0].label !=='Background Noise' ) {
      const findTranslation = sounds.find((f)=>f.label === results[0].label)
      if (findTranslation)
      {
        setLabel(findTranslation.translation);
    }
    }
  }

  useEffect(() => {
    classifySound().then(()=>{}).catch((e)=>console.log(e))
  }, []);

  
  return (
    <div className="App">
      <header className="App-header">
        {isLoading?
        <>
          <h1>Φορτώνει...</h1>
        </>  
        :
        <>
        <h1>Μεταφραστής Λέρικων σφυριγμάτων</h1>
        <h6>Μετάφραση:</h6>
        <p>{label}</p>
        </>
      }
        
      </header>
    </div>
  );
}

export default App;
