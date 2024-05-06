let selectedMovie,movies=[],today=new Date,dayOfYearToday=Math.floor((today-new Date(today.getFullYear(),0,0))/1e3/60/60/24);const soundCorrect=new Audio("sounds/correct.mp3"),soundPartial=new Audio("sounds/partial.mp3"),soundWrong=new Audio("sounds/wrong.mp3"),soundVictory=new Audio("sounds/victory.mp3");function playSound(e){"true"===getCookie("soundEnabled")&&e.play()}const COLOR_CORRECT="rgba(0, 173, 43, 1)",COLOR_PARTIAL="rgba(243, 156, 18, 1)",COLOR_WRONG="rgba(63, 71, 82, 1)";let isCustomGame=!1,alreadyLost=!1;function loadMovies(){fetch("/api/movies").then((e=>e.json())).then((e=>{movies=e.movies,checkForCustomGame(),isCustomGame||(console.log("isCustomGame is false"),selectedMovie=e.selectedMovie),document.getElementById("devSelectedMovie").textContent=selectedMovie?`Dev: ${selectedMovie["Movie Title"]}`:"No movie selected"})).catch((e=>{console.error("Error fetching movies:",e),document.getElementById("devSelectedMovie").textContent="Failed to load movies"}))}function checkIfAlreadyWonToday(){let e=parseInt(getCookie("lastVictoryDay"))||-1;console.log("Last Victory Day:",e,"Day of Year Today:",dayOfYearToday),e===dayOfYearToday?(console.log("User has already won today."),gameOver(),disableGuessing(),updateGameMessage("You've already won today! Come back tomorrow and play again!")):console.log("No win recorded today. Last win was on day:",e)}function checkIfAlreadyLostToday(){let e=parseInt(getCookie("lastLoseDay"))||-1;console.log("Last Lose Day:",e,"Day of Year Today:",dayOfYearToday),e===dayOfYearToday?(console.log("User has already lost today."),alreadyLost=!0,updateGameMessage("You've already played today! Come back tomorrow and play again!")):console.log("No lose recorded today. Last lose was on day:",e)}function updateGuessCountDisplay(){let e=parseInt(getCookie("guesses"))||1;document.getElementById("guessCount").textContent=`Guess: ${e}/10`}function storeGuessHistory(e){let t=JSON.parse(localStorage.getItem("guessHistory")||"[]");t.unshift({title:e["Movie Title"],feedback:{year:document.getElementById("yearFeedback").textContent,genre:document.getElementById("genreFeedback").innerHTML,director:document.getElementById("directorFeedback").textContent,certificate:document.getElementById("certificateFeedback").textContent,duration:document.getElementById("durationFeedback").textContent},colors:{year:document.getElementById("yearFeedback").style.backgroundColor,genre:document.getElementById("genreFeedback").style.backgroundColor,director:document.getElementById("directorFeedback").style.backgroundColor,certificate:document.getElementById("certificateFeedback").style.backgroundColor,duration:document.getElementById("durationFeedback").style.backgroundColor}}),localStorage.setItem("guessHistory",JSON.stringify(t)),console.log("Stored guess history:",t)}function displayGuessHistory(){const e=document.getElementById("guessHistoryContainer");let t=JSON.parse(localStorage.getItem("guessHistory")||"[]");t=t.slice(-10),e.classList.add("fade-out"),setTimeout((()=>{e.innerHTML="",e.classList.remove("fade-out"),t.forEach((t=>{const o=document.createElement("div");o.className="guess-history-entry",o.innerHTML=`\n                <h4>${t.title}</h4>\n                <p style="background-color:${t.colors.year}">${t.feedback.year}</p>\n                <p style="background-color:${t.colors.genre}">${t.feedback.genre}</p>\n                <p style="background-color:${t.colors.director}">${t.feedback.director}</p>\n                <p style="background-color:${t.colors.certificate}">${t.feedback.certificate}</p>\n                <p style="background-color:${t.colors.duration}">${t.feedback.duration}</p>\n            `,e.appendChild(o)}))}),250)}function hideSuggestions(){const e=document.getElementById("suggestions");e.innerHTML="",e.style.display="none"}function checkGuess(e){const t=movies.find((t=>t.title.toLowerCase()===e.toLowerCase()));t?updateFeedback(t):document.getElementById("gameMessage").textContent="Invalid Movie Title!"}function checkGuessLimit(){let e=isCustomGame?"customGame_guesses":"guesses",t=parseInt(getCookie(e))||1;return console.log("Guess amount: "+t),t>10||alreadyLost&&!isCustomGame?(updateGameMessage("Game Over! You have reached your guessing limit for today."),disableGuessing(),!1):(t++,setCookie(e,t,1),document.getElementById("guessCount").textContent=`Guess: ${t}/10`,console.log("Guess amount: "+t),!0)}function checkGuessLimitOnLoad(){let e=parseInt(getCookie(isCustomGame?"customGame_guesses":"guesses"))||1;if(!isCustomGame&&e>10||alreadyLost&&!isCustomGame)return updateGameMessage("Game Over! You have reached your guessing limit for today. Come back tomorrow and play again!"),disableGuessing(),document.getElementById("guessCount").textContent=`Guess: ${e}/10`,!1;console.log("Guess amount: "+e)}function disableGuessing(){document.getElementById("guessInput").disabled=!0,document.getElementById("guessButton").disabled=!0}function recordVictory(){confetti({particleCount:200,startVelocity:50,spread:270,shapes:["square","square","star"]}),isCustomGame||(incrementVictories(),setCookie("lastVictoryDay",dayOfYearToday,1)),updateVictoryCountDisplay(),disableGuessing(),updateGameMessage(`Nice! You've correctly guessed the movie: ${selectedMovie["Movie Title"]}.\nCome back tomorrow and play again!`),document.getElementById("victoryMovieTitle").textContent=selectedMovie["Movie Title"],document.getElementById("victoryContainer").style.display="block",showVictoryModal(selectedMovie["Movie Title"]);const e=document.getElementById("victoryContainer");e.style.display="block",e.style.opacity="1",e.style.animation="slideUpFadeIn 2.0s ease-out forwards"}function recordLose(){isCustomGame||setCookie("lastLoseDay",dayOfYearToday,1)}function closeVictoryModal(){document.getElementById("victoryContainer").style.display="none"}function checkVictory(){let e=parseInt(getCookie("victories"))||0;document.getElementById("victoryCount").textContent=`Victories: ${e}`,e>0&&disableGuessing()}function displaySuggestions(e){const t=document.getElementById("suggestions");if(t.innerHTML="",t.style.display="none",e.length>=2){const o=movies.filter((t=>t["Movie Title"].toLowerCase().includes(e.toLowerCase())));console.log("Filtered movies:",o),o.length>0&&(o.slice(0,5).forEach((e=>{const o=document.createElement("div");o.textContent=e["Movie Title"],o.onclick=()=>{document.getElementById("guessInput").value=e["Movie Title"],t.style.display="none"},t.appendChild(o)})),t.style.display="block")}}function displayMovieDetails(e){document.getElementById("yearFeedback").textContent=`Year: ${e["Year of Release"]}`,document.getElementById("genreFeedback").textContent=`Genre: ${e.Genre}`,document.getElementById("directorFeedback").textContent=`Director: ${e.Director}`,document.getElementById("certificateFeedback").textContent=`Age Rating: ${e.Certificate}`,document.getElementById("durationFeedback").textContent=`Duration: ${e.Duration} min`}function updateFeedback(e){const t=selectedMovie["Year of Release"]-e["Year of Release"],o=selectedMovie.Duration-e.Duration;document.getElementById("yearFeedback").style.backgroundColor=0===t?COLOR_CORRECT:Math.abs(t)<=5?COLOR_PARTIAL:COLOR_WRONG;let n=0===t?2:Math.abs(t)<=5?1:0;document.getElementById("yearFeedback").textContent=`Year: ${e["Year of Release"]} ${0===t?"":t>0?"↑":"↓"}`,document.getElementById("durationFeedback").style.backgroundColor=0===o?COLOR_CORRECT:Math.abs(o)<=15?COLOR_PARTIAL:COLOR_WRONG;let s=0===o?2:Math.abs(o)<=15?1:0;document.getElementById("durationFeedback").textContent=`Duration: ${e.Duration} min ${0===o?"":o>0?"↑":"↓"}`;const a=selectedMovie.Genre.split(",").map((e=>e.trim().toLowerCase())),i=e.Genre.split(",").map((e=>e.trim().toLowerCase()));let d="Genre: ",c=0;i.forEach(((t,o)=>{const n=e.Genre.split(",")[o].trim();a.includes(t)?(d+=`<span style="background-color:${COLOR_CORRECT};">${n}</span>`,c++):d+=n,o<i.length-1&&(d+=", ")})),document.getElementById("genreFeedback").innerHTML=d,c===i.length?document.getElementById("genreFeedback").style.backgroundColor=COLOR_CORRECT:document.getElementById("genreFeedback").style.backgroundColor=c>0?COLOR_PARTIAL:COLOR_WRONG,document.getElementById("directorFeedback").style.backgroundColor=selectedMovie.Director===e.Director?COLOR_CORRECT:COLOR_WRONG;let l=selectedMovie.Director===e.Director?1:0;document.getElementById("certificateFeedback").style.backgroundColor=selectedMovie.Certificate===e.Certificate?COLOR_CORRECT:COLOR_WRONG;let r=selectedMovie.Certificate===e.Certificate?1:0;2==n||2==s||c>=2||1==l||1==r?(playSound(soundCorrect),console.log("Sound correct")):1==n||1==s||c>0?(playSound(soundPartial),console.log("Sound partial")):(playSound(soundWrong),console.log("Sound wrong"))}function gameOver(){selectedMovie&&selectedMovie["Movie Title"]?document.getElementById("gameMessage").textContent="Game Over! You've already won today. The movie was "+selectedMovie["Movie Title"]:document.getElementById("gameMessage").textContent="Game Over! You've already won today! Come back tomorrow and play again!",disableGuessing()}function updateVictoryCountDisplay(){let e=parseInt(getCookie("victories"))||0;document.getElementById("victoryCount").textContent=`Victories: ${e}`}function checkAndClearData(){clearLocalStorageExceptLastResetTime();const e=["guesses","lastVictoryDay","lastLoseDay"];document.cookie.split(";").forEach((t=>{let[o,n]=t.split("=");o=o.trim(),e.includes(o)&&(document.cookie=`${o}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`)}))}function setupGameWithCustomMovie(e){const t=movies.find((t=>t["Movie Title"].toLowerCase()===e.toLowerCase()));t?(selectedMovie=t,console.log("Custom game setup with movie:",t["Movie Title"]),isCustomGame=!0):console.error("Movie not found:",e)}function clearLocalStorageExceptLastResetTime(){const e=localStorage.getItem("lastResetTime");for(let e=0;e<localStorage.length;e++){const t=localStorage.key(e);"lastResetTime"!==t&&localStorage.removeItem(t)}e&&localStorage.setItem("lastResetTime",e)}document.getElementById("guessButton").addEventListener("click",(function(){if(isCustomGameCreationMode)return void share_custom_game();document.getElementById("gameMessage").textContent="";const e=document.getElementById("guessInput").value.trim().toLowerCase(),t=movies.find((t=>t["Movie Title"].toLowerCase()===e));if(t){if(!checkGuessLimit())return;if(displayMovieDetails(t),updateFeedback(t),storeGuessHistory(t),displayGuessHistory(),t["Movie Title"].toLowerCase()===selectedMovie["Movie Title"].toLowerCase())document.getElementById("gameMessage").textContent=`You got it! ${t["Movie Title"]}.`,recordVictory(),playSound(soundVictory);else{(parseInt(getCookie("guesses"))||1)>10&&(updateGameMessage("Game Over! The movie was "+selectedMovie["Movie Title"]+". Come back tomorrow and try again!"),disableGuessing(),recordLose())}}else document.getElementById("gameMessage").textContent="Invalid Movie Title!";document.getElementById("guessInput").value="",hideSuggestions()})),document.getElementById("guessInput").addEventListener("input",(function(){const e=this.value;console.log("Input received:",e),displaySuggestions(e)})),window.onload=function(){console.log("Window loaded successfully."),fetch("/api/last-reset-time").then((e=>(console.log("Response received"),e.json()))).then((e=>{console.log("Data parsed",e);const t=new Date(e.lastReset),o=new Date(localStorage.getItem("lastResetTime"));console.log("Server reset time:",t),console.log("Last client reset time:",o),(!o||t>o)&&(console.log("Clearing data due to reset."),checkAndClearData(),localStorage.setItem("lastResetTime",t.toISOString())),loadMovies(),checkIfAlreadyLostToday(),displayGuessHistory(),checkGuessLimitOnLoad(),updateGuessCountDisplay(),updateVictoryCountDisplay(),checkIfAlreadyWonToday(),updateShareLinks()})).catch((e=>{console.error("Error fetching last reset time:",e)}))};