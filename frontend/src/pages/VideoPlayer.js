import React from "react";

function VideoPlayer() {
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
      <div className="ratio ratio-16x9" style={{ width: "100%" }}>
        <video controls style={{ width: "100%", height: "100%" }}>
          <source src="http://localhost:4452/video" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default VideoPlayer;
