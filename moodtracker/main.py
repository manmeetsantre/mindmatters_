from flask import Flask, render_template, request
from tensorflow.keras.models import load_model
import numpy as np
import os
import base64
import cv2

# Initialize Flask app
app = Flask(__name__)
app.template_folder = '.'

# Load the trained model
model = load_model('basic_model.h5')

# Define class names
class_names = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

# Upload folder
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize face cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Emotion detection function with face detection
def detect_emotion(img_path):
    # Read the image
    img = cv2.imread(img_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    
    if len(faces) > 0:
        # Use the first detected face
        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        img_for_prediction = cv2.resize(face_roi, (48, 48))
    else:
        # Use entire image if no face detected
        img_for_prediction = cv2.resize(gray, (48, 48))
    
    # Prepare image for prediction
    img_array = img_for_prediction.astype('float32') / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    img_array = np.expand_dims(img_array, axis=-1)
    
    # Make prediction
    prediction = model.predict(img_array)
    predicted_index = np.argmax(prediction)
    predicted_class = class_names[predicted_index]
    confidence = round(prediction[0][predicted_index] * 100, 2)
    
    return predicted_class, confidence

# Home route
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        captured_image = request.form.get('captured_image')
        if captured_image:
            # Decode base64
            header, encoded = captured_image.split(',', 1)
            image_bytes = base64.b64decode(encoded)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'captured.png')
            with open(file_path, 'wb') as f:
                f.write(image_bytes)
        elif 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return 'No file selected!'
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)
        else:
            return 'No file uploaded!'
        
        # Detect emotion
        emotion, confidence = detect_emotion(file_path)
        
        return render_template('index.html', image_path=file_path, emotion=emotion, confidence=confidence)
    
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5002)
