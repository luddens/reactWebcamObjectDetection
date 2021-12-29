import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { drawRect } from "./utilities";

function App() {
	const [playing, setPlaying] = useState(false);

	const HEIGHT = 500;
	const WIDTH = 500;
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);
  

	const runCoco = async () => {
		// 3. TODO - Load network 
		const net = await cocossd.load();
		
		//  Loop and detect hands
			startVideo(net);
	};

	const startVideo =  (net) => {
		setPlaying(true);

		//https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia 	 //migrate from this to 
		//https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia //this
		navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.msGetUserMedia );
		
		const errorHandler = (e)=>{console.log("error"); console.log(e)};
		const streamHandler = (s)=>{console.log(s)};
		
		if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
			navigator.getUserMedia({
				audio: true
			}, streamHandler, errorHandler);
		} else {
			navigator.mediaDevices.getUserMedia({
				audio: true
			}).then(streamHandler).catch(errorHandler);
		}
		
		navigator.getUserMedia( { video: true },
			(stream) => {
				let video = document.getElementsByClassName('app__videoFeed')[0];

				video.addEventListener('loadeddata', (event) => {
					console.log('Yay! The readyState just increased to  ' +
					'HAVE_CURRENT_DATA or greater for the first time.');

					const videoWidth = WIDTH;
					const videoHeight = HEIGHT;
			  
					canvasRef.current.width = WIDTH;
					canvasRef.current.height = HEIGHT;
			  
					setInterval(async () => {
						const obj = await net.detect(video);
						console.log(obj);
			  
						const ctx = canvasRef.current.getContext("2d");

						console.log(video);
						
						drawRect(obj, ctx);
					}, 10);
				});
				
				if (video) {
					video.srcObject = stream;
				}
			},
			(err) => console.error(err)
		);
	};

	const stopVideo = () => {
		setPlaying(false);
		let video = document.getElementsByClassName('app__videoFeed')[0];
		video.srcObject.getTracks()[0].stop();
	};

	return (
		<div className="app">
			<div className="app__container">
				<video
					height={HEIGHT}
					width={WIDTH}
					muted
					autoPlay
					className="app__videoFeed"
				></video>
								<canvas
				ref={canvasRef}
				style={{
					position: "absolute",
					marginLeft: "auto",
					marginRight: "auto",
					left: 0,
					right: 0,
					textAlign: "center",
					zindex: 8,
					width: 640,
					height: 480,
				}}
				/>
			</div>


			<div className="app__input">
				{playing ? (
					<button onClick={stopVideo}>Stop</button>
				) : (
					<button onClick={runCoco}>Start</button>
				)}
			</div>
		</div>
	);
}

export default App;
