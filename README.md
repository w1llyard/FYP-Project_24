# FYP-Project_24: Agricultural Robot System (AgriBot)

An integrated agricultural robotics system designed for automated crop monitoring, detection, and precision farming operations. This Final Year Project combines computer vision, hardware robotics, and cloud services to create an autonomous agricultural assistant.

## 🌾 Project Overview

AgriBot is a comprehensive solution for modern agriculture that leverages:
- **AI-powered crop detection** for real-time plant health monitoring
- **Robotic manipulation** with a 5-DOF robotic arm for precise agricultural tasks
- **Web-based interface** for remote monitoring and control
- **Cloud integration** for data persistence and analysis

## 📁 Project Structure

```
FYP-Project_24/
├── AgriBot/                    # Frontend web application
│   ├── src/                    # React/Vue source files
│   ├── public/                 # Static assets
│   ├── package.json            # Node.js dependencies
│   └── vite.config.js          # Build configuration
├── Backend/                    # Python ML/Detection services
│   ├── server.py               # Flask/FastAPI server
│   ├── CropDetection.py        # Computer vision models
│   ├── FirebaseHandler.py      # Cloud database integration
│   ├── models/                 # Pre-trained ML models
│   └── img/                    # Sample images and datasets
├── Robot/                      # Robotic control systems
│   ├── robot.py                # Main robot orchestration
│   ├── RoboticArm.py           # AL5D arm control
│   ├── cameraMove.py           # Pan-tilt camera control
│   ├── realtimedb.py           # Real-time database sync
│   ├── AL5D/                   # Arm-specific modules
│   └── main/                   # Entry point scripts
└── start_mjpg_streamer.sh      # Video streaming initialization
```

## 🛠️ Technology Stack

| Component | Technology | Percentage |
|-----------|-----------|-----------|
| Frontend | JavaScript | 48.1% |
| Backend | Python | 37.3% |
| Hardware Control | C++ | 10.1% |
| Styling | CSS | 4% |
| Other | Various | 0.5% |

### Key Technologies:
- **Frontend**: JavaScript (Vite, React/Vue)
- **Backend**: Python (computer vision, ML models, Flask/FastAPI)
- **Hardware**: C++ (robotic arm kinematics, sensor integration)
- **Cloud**: Firebase (real-time database, authentication)
- **Vision**: OpenCV, YOLO, or similar detection frameworks
- **Robotics**: AL5D 5-DOF robotic arm control

## 🎯 Core Features

### 1. **Crop Detection & Analysis** (`Backend/CropDetection.py`)
- Real-time image processing for crop health assessment
- Plant disease detection
- Yield prediction
- Weed identification

### 2. **Robotic Manipulation** (`Robot/`)
- 5-DOF AL5D robotic arm for precision tasks
- Pan-tilt camera system for autonomous scanning
- Coordinated movement and automation
- Real-time feedback from sensors

### 3. **Web Interface** (`AgriBot/`)
- Real-time video streaming (MJPG)
- Remote robot control dashboard
- Crop analysis visualization
- Historical data tracking

### 4. **Cloud Integration** (`Backend/FirebaseHandler.py`)
- Cloud-based data storage and retrieval
- Real-time synchronization
- Multi-device support

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+ (for frontend)
- Arduino IDE or similar (for robotic arm)
- Firebase account

### Backend Setup

```bash
cd Backend
pip install -r requirements.txt
python server.py
```

### Frontend Setup

```bash
cd AgriBot
npm install
npm run dev
```

### Robot Setup

```bash
cd Robot
python robot.py
```

### Start Video Streaming

```bash
chmod +x start_mjpg_streamer.sh
./start_mjpg_streamer.sh
```

## 📊 System Architecture

```
┌─────────────────┐
│  Web Interface  │  (JavaScript/HTML/CSS)
│   (AgriBot/)    │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Backend   │  (Python)
    │ Services  │
    └────┬──────┘
    ┌────┴──────┐
    │            │
┌───▼──┐    ┌──▼──────┐
│Robot │    │ Firebase │
│(C++/ │    │Database  │
│Python)    └──────────┘
└────────┘
```

## 🤖 Robot Components

### Robotic Arm (AL5D)
- 5 degrees of freedom
- Precision manipulation
- Integrated servo control

### Camera System
- Pan-tilt mount for autonomous scanning
- Real-time video streaming
- Multiple resolution support

### Sensors
- Visual sensors (RGB camera)
- Environmental monitoring
- Position feedback

## 🎨 Frontend Features
- Responsive web dashboard
- Real-time video feed with controls
- Robot telemetry display
- Crop analysis reports
- Historical analytics

## 📊 Backend Services
- Crop detection and classification
- Firebase CRUD operations
- API endpoints for frontend communication
- Model inference and predictions
- Database synchronization

## 🔧 Configuration

Edit `Backend/constant.py` for:
- API endpoints
- Firebase credentials
- Model parameters
- Camera settings

## 📝 Usage Example

```python
# Robot control
from Robot.robot import Robot
robot = Robot()
robot.initialize()
robot.capture_crop_image()
robot.analyze_crop()
robot.move_arm(x, y, z)
```

## 📦 Dependencies

### Python
- Firebase Admin SDK
- OpenCV
- NumPy, TensorFlow/PyTorch
- Flask or FastAPI
- Pillow

### JavaScript
- React/Vue
- Axios
- Bootstrap/Tailwind CSS

## 🔐 Security & Credentials

The project uses Firebase for authentication:
- Service account key stored in `Robot/serviceAccountKey.json`
- Environment-based configuration
- **Note**: Never commit credentials to version control

## 🗓️ Project Timeline

- **Created**: July 8, 2024
- **Last Updated**: February 16, 2025

## 👤 Author

**@w1llyard** - Final Year Project

## 📄 License

This project is currently unlicensed. See repository for details.

## 🤝 Contributing

This is an academic project. For inquiries or collaborations, contact the repository owner.

## 🐛 Known Issues & Roadmap

- [ ] Optimize crop detection model inference
- [ ] Improve robotic arm precision calibration
- [ ] Expand crop type database
- [ ] Add mobile app support
- [ ] Implement multi-robot coordination

## 📞 Support & Documentation

For issues or questions:
1. Check existing GitHub issues
2. Review inline code documentation
3. Contact the project maintainer

<img width="1280" height="2274" alt="image" src="https://github.com/user-attachments/assets/0a3dd1a0-4ffc-439f-8795-bfedb79ab736" />

<img width="1842" height="821" alt="image" src="https://github.com/user-attachments/assets/7f0aac19-9a73-4c10-a4ac-0ecd4386f1b2" />

<img width="1669" height="755" alt="image" src="https://github.com/user-attachments/assets/a6401528-98f7-40b9-ae0a-6bdfcdbc5f4a" />

<img width="2048" height="976" alt="image" src="https://github.com/user-attachments/assets/6b8ac539-d5f2-4cb6-8109-02aaaabd6c81" />

---

**Note**: This is a comprehensive agricultural automation system integrating multiple technologies. Ensure proper setup of all three components (Frontend, Backend, Robot) for full functionality.
