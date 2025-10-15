#!/bin/bash

echo "🎭 Setting up Multilingual Emotion Detection Voice Assistant"
echo "============================================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version
python_version=$(python3 -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
echo "✅ Python version: $python_version"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv emotion_voice_env
source emotion_voice_env/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install FFmpeg (required for audio processing)
echo "🎵 Checking FFmpeg installation..."
if ! command -v ffmpeg &> /dev/null; then
    echo "📥 FFmpeg not found. Please install it:"
    echo "   - Ubuntu/Debian: sudo apt update && sudo apt install ffmpeg"
    echo "   - macOS: brew install ffmpeg"
    echo "   - Windows: Download from https://ffmpeg.org/download.html"
    echo "   - Continue after installing FFmpeg..."
    read -p "Press Enter when FFmpeg is installed..."
fi

# Install Python requirements
echo "📚 Installing Python packages..."
pip install -r requirements.txt

# Download NLTK data for TextBlob
echo "📊 Downloading NLTK data..."
python3 -c "
import nltk
try:
    nltk.download('punkt', quiet=True)
    nltk.download('brown', quiet=True)
    print('✅ NLTK data downloaded successfully')
except Exception as e:
    print(f'⚠️  NLTK download warning: {e}')
"

# Test Whisper model download
echo "🤖 Testing Whisper model..."
python3 -c "
import whisper
try:
    model = whisper.load_model('medium')
    print('✅ Whisper medium model loaded successfully')
except Exception as e:
    print(f'❌ Whisper model error: {e}')
"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p templates
mkdir -p static
mkdir -p logs

# Copy the HTML template to the templates directory
echo "📄 Setting up templates..."
cat > templates/index.html << 'EOF'
<!-- The HTML content from the artifact will be copied here -->
<!-- You'll need to copy the HTML from the emotion_voice_assistant artifact -->
EOF

echo "✅ Setup complete!"
echo ""
echo "🚀 To run the application:"
echo "   1. Activate the virtual environment: source emotion_voice_env/bin/activate"
echo "   2. Copy the HTML content from the artifact to templates/index.html"
echo "   3. Run the Flask app: python app.py"
echo "   4. Open your browser to: http://localhost:5000"
echo ""
echo "📋 Supported features:"
echo "   🗣️  Speech-to-text in English, Hindi, and Kashmiri"
echo "   😊 Emotion detection (7 emotions: happy, sad, angry, fear, surprise, disgust, neutral)"
echo "   🔧 Auto-correction for common speech recognition errors"
echo "   🎵 Audio feature analysis for enhanced emotion detection"
echo ""
echo "🎯 Tips for best results:"
echo "   - Speak clearly and at moderate pace"
echo "   - Use a good quality microphone"
echo "   - Reduce background noise"
echo "   - For Kashmiri, the system uses Urdu script recognition"