import React, {useState, useEffect, useRef, useCallback} from "react";
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
  const [isListening, setIsListening] = useState(false);
  const audioStreamRef = useRef(null);
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

   await navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioStreamRef.current = stream;
        stopListening()
      })
      .catch(err => {
        alert(err)
        console.error("Error getting audio stream:", err);
      });
  };

  function onModelReady() {
    console.log("Model is ready");
    setIsLoading(false)
  }


  useEffect(() => {
    classifySound().then(()=>{}).catch((e)=>console.log(e))
  }, []);


  const startListening = useCallback(() => {
    setLabel('')
    if (classifierRef.current && audioStreamRef.current) {
      classifierRef.current.classify(audioStreamRef.current,(err, results) => {
        if (err) {
          console.error(err);
          return;
        }
        if (results[0].confidence >= 0.95 && results[0].label !=='Background Noise' ) {
          const findTranslation = sounds.find((f)=>f.label === results[0].label)
          if (findTranslation)
          {
            setLabel(findTranslation.translation);
            stopListening()
          }
        }
      });

      setIsListening(true);
    }
  },[classifierRef,audioStreamRef])

  const stopListening = () => {
    if (audioStreamRef.current) {
      const tracks = audioStreamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      classifierRef?.current?.model?.model?.stopListening()
      setIsListening(false);
    }
  };

  
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
         <button style={{
           width:200,
           height:200,
           background:'#d84343',
           color:'white',
           border:'4px solid white',
           borderRadius:100,
           cursor:'pointer',
           fontSize:20
         }}  onClick={isListening ? stopListening : startListening}>        {isListening ? "Παύση" : "Εκκίνηση"}
         </button>
        <h6 style={{marginBottom:-10}}>Μετάφραση:</h6>
        <p style={{height:30}}>{label}</p>
          <p style={{fontSize:12}}>v 0.2</p>
        </>
      }
        
      </header>
    </div>
  );
}

export default App;
