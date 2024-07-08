# Define allowed extensions for image files
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

RIPENESS_TOMATO_DETECTOR_MODEL = "Backend\models\\tomato_detection_yolov8n.pt"

TOMATO_DEFECTS_DETECTOR_MODEL = "Backend\models\quality_check_yolov8n.pt"

RIPENESS_LEVEL_CLASS_NAMES = ["fully_ripened", "half_ripened", "green" ]

TOMATO_DEFECTS_CLASS_NAMES = ["at risk", "rotten", "fresh"]