import React, { useState, useRef, useEffect } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { FileUpload } from "primereact/fileupload";
import { Dropdown } from "primereact/dropdown";

function Model() {
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detectionType, setDetectionType] = useState("ripeness"); // Default type
  const [pickOrder, setPickOrder] = useState("none"); // Default pick order
  const canvasRef = useRef(null);

  const detectionOptions = [
    { label: "Ripeness", value: "ripeness" },
    { label: "Defect", value: "defect" },
  ];

  const pickOrderOptions = [
    { label: "None", value: "none" },
    { label: "Best", value: "best" },
    { label: "All", value: "all" },
  ];

  // Helper function to convert index to ordinal string
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const onFileSelect = (e) => {
    const file = e.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setPredictions([]); // Clear previous predictions
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredict = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const requestBody = { image: image, type: detectionType };
      if (detectionType === "ripeness" && pickOrder !== "none") {
        requestBody.pickorder = pickOrder;
      }

      const response = await fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setPredictions(data); // Set all predictions data returned from the server
      console.log(data);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get filtered predictions based on user choice
  const getFilteredPredictions = () => {
    if (pickOrder === "none" || detectionType == "defect") {
      return predictions.predictions ? predictions.predictions[0] : []; // Access nested array
    } else if (pickOrder === "best") {
      return predictions.pick_order_best || [];
    } else if (pickOrder === "all") {
      return predictions.pick_order_all || [];
    }
    return [];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const padding = 50;

    if (image) {
      const img = new Image();
      img.src = image;

      img.onload = () => {
        const scaleFactor = Math.min(600 / img.width, 1);
        canvas.width = img.width * scaleFactor + padding * 2;
        canvas.height = img.height * scaleFactor + padding * 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          padding,
          padding,
          img.width * scaleFactor,
          img.height * scaleFactor
        );

        const filteredPredictions = getFilteredPredictions();

        filteredPredictions.forEach((prediction, index) => {
          const { x1, y1, x2, y2 } = prediction.box || {};
          const width = (x2 - x1) * scaleFactor;
          const height = (y2 - y1) * scaleFactor;

          context.strokeStyle = "cyan";
          context.lineWidth = 2 * scaleFactor;
          context.strokeRect(
            x1 * scaleFactor + padding,
            y1 * scaleFactor + padding,
            width,
            height
          );

          // Add ordinal label to the prediction name
          const ordinalLabel = getOrdinal(index + 1);
          context.fillStyle = "cyan";
          context.font = `${28 * scaleFactor}px Arial`;
          context.fillText(
            `${
              pickOrder !== "none" && detectionType == "ripeness"
                ? ordinalLabel + " - "
                : ""
            }${prediction.name} (${(prediction.confidence * 100).toFixed(1)}%)`,
            x1 * scaleFactor + padding,
            y1 * scaleFactor + padding > 10
              ? y1 * scaleFactor + padding - 5
              : y1 * scaleFactor + padding + 15
          );
        });
      };
    }
  }, [image, predictions, pickOrder, detectionType]);

  return (
    <div
      style={{
        display: "flex",
        textAlign: "center",
        padding: "20px",
        color: "white",
        borderRadius: "10px",
        justifyContent: "space-around",
        alignItems: "center",
        margin: "auto",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <h2 style={{ color: "#00aaff" }}>Upload Image for Object Detection</h2>
        <label htmlFor="" style={{ color: "black" }}>
          Detection Type:
        </label>
        <Dropdown
          value={detectionType}
          options={detectionOptions}
          onChange={(e) => setDetectionType(e.value)}
          placeholder="Select Detection Type"
          style={{ width: "80%", margin: "10px auto" }}
        />

        <br />

        {detectionType === "ripeness" && (
          <>
            <label htmlFor="" style={{ color: "black" }}>
              Pick Order Sequence:
            </label>
            <br />
            <Dropdown
              value={pickOrder}
              options={pickOrderOptions}
              onChange={(e) => setPickOrder(e.value)}
              placeholder="Select Pick Order"
              style={{ width: "80%", margin: "10px auto" }}
            />
          </>
        )}

        <FileUpload
          name="demo[]"
          accept="image/*"
          customUpload
          auto={false}
          onSelect={onFileSelect}
          uploadHandler={handlePredict}
          chooseLabel="Select File"
          uploadLabel="Detect"
          style={{
            width: "80%",
            borderRadius: "10px",
          }}
        />
      </div>

      {loading && (
        <ProgressSpinner style={{ marginTop: "20px", color: "#00aaff" }} />
      )}

      <div style={{ marginTop: "20px", position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            border: "2px solid #000000",
            borderRadius: "10px",
            maxWidth: "600px",
            width: "100%",
            marginTop: "20px",
            backgroundColor: "white",
          }}
        />
      </div>
    </div>
  );
}

export default Model;
