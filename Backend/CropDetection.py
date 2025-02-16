import math
import json
from typing import Union, List
from ultralytics import YOLO
from PIL import Image

class TomatoDetection:
    def __init__(self, model_path):
        self.model = YOLO(model_path)

    def GetPredictions(self, img: Union[List[Image.Image], Image.Image], project="Backend/runs/TonatoDetection", save=False):
        predictions = []

        results = self.model.predict(img, conf=0.5, project=project, save=save)

        for result in results:
            predictions.append(json.loads(result.tojson()))

        return predictions

    def CountTomatoTypes(self, predictions:list, class_names:str):
        # Dictionary to hold counts of each type dynamically
        tomato_types = {}

        for class_name in class_names:
            tomato_types[class_name] = 0
        for prediction in predictions:
            # Count each type of object
            for detection in prediction:
                name = detection['name']
                if name in tomato_types:
                    tomato_types[name] += 1
                else:
                    tomato_types[name] = 1

        return tomato_types
    
class RipenessTomatoDetection(TomatoDetection):
    def __init__(self, model_path):
        super().__init__(model_path)

    def Calculate_Position_Score(self, box, image_height):
        """Calculate a score based on how close the box's bottom left corner is to the image's bottom left corner."""
        # Using the bottom left corner of the box for this calculation
        return box['x1']**2 + (image_height - box['y2'])**2

    def Calculate_Isolation_Score(self, box, other_boxes):
        """Calculate a score based on how isolated the box is from other boxes
        (the greater the distance, the lower the score).
        """
        if not other_boxes:
            # Return a very high isolation score if no other boxes are present
            return float('inf')

        box_center_x = (box['x1'] + box['x2']) / 2
        box_center_y = (box['y1'] + box['y2']) / 2

        distances = []
        for other in other_boxes:
            other_center_x = (other['x1'] + other['x2']) / 2
            other_center_y = (other['y1'] + other['y2']) / 2
            distance = math.sqrt((box_center_x - other_center_x)
                                 ** 2 + (box_center_y - other_center_y)**2)
            distances.append(distance)
        min_distance = min(distances)

        return min_distance

    def GetPickOrder(self, predictions: list, image_height:int, retrieve_all=False):
        remaining_detections = predictions

        # List to store the order of processed detections
        predictions = []
        # Iterate and plot each box as it is processed
        while remaining_detections:

            # Calculate scores
            scores = []
            for i, detection in enumerate(remaining_detections):
                box = detection['box']
                position_score = self.Calculate_Position_Score(box, image_height)

                other_boxes = []
                for j, detect in enumerate(remaining_detections):
                    if j != i:
                        other_boxes.append(detect["box"])
                isolation_score = self.Calculate_Isolation_Score(box, other_boxes)
                # Combine the scores (main score minus secondary score)
                combined_score = position_score - isolation_score
                detection["id"] = i
                scores.append((combined_score, detection))

            # Select the best box and plot it
            best_score, best_detection = sorted(scores)[0]
            remaining_detections.pop(best_detection["id"])
            best_detection["id"] = len(predictions)
            predictions.append(best_detection)

            if not retrieve_all:
                break
            
        return predictions

    def FilterRipeTomatoes(self, predictions):
        ripe_tomatoes_predictions = []

        for detection in predictions[0]:
            if detection["name"] == "fully_ripened":
                ripe_tomatoes_predictions.append(detection)

        return ripe_tomatoes_predictions

class TomatoDefectsDetection(TomatoDetection):
    def __init__(self, model_path: str):
        super().__init__(model_path)

    def CheckTomatoQuality(self, predictions: list):
        for prediction in predictions:
            for detection in prediction:
                if detection["name"] != "fresh":
                    print(detection["name"])
                    return False
        return True