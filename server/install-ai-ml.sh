#!/bin/bash

# MAITRI Space Station Crew Mental Health Monitoring System
# Installation Script for AI/ML Components

echo "🚀 Installing MAITRI Space Station AI/ML System..."

# Check if Python 3.8+ is installed
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3.8+ is required but not installed"
    exit 1
fi

# Check if Node.js 18+ is installed
node --version
if [ $? -ne 0 ]; then
    echo "❌ Node.js 18+ is required but not installed"
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p models
mkdir -p uploads
mkdir -p alerts
mkdir -p data
mkdir -p logs

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip3 install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create model directories
echo "🧠 Setting up AI models..."
mkdir -p models/facial_emotion
mkdir -p models/voice_emotion
mkdir -p models/multimodal

# Download pre-trained models (if available)
echo "📥 Downloading pre-trained models..."
# Note: In production, these would be downloaded from a secure repository
# For now, we'll create placeholder model files

# Create dummy models for development
python3 -c "
import tensorflow as tf
import numpy as np

# Create dummy facial emotion model
facial_model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu', input_shape=(48, 48, 1)),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(7, activation='softmax')
])
facial_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
facial_model.save('models/facial_emotion_model.h5')

# Create dummy voice emotion model
voice_model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu', input_shape=(26,)),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(7, activation='softmax')
])
voice_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
voice_model.save('models/voice_emotion_model.h5')

print('✅ Dummy models created successfully')
"

# Set up database
echo "🗄️ Setting up database..."
npm run build
node dist/index.js &
SERVER_PID=$!
sleep 5
kill $SERVER_PID

# Create systemd service file (for Linux)
if [ -f /etc/systemd/system/maitri-ai.service ]; then
    echo "⚠️ Service file already exists"
else
    echo "📝 Creating systemd service file..."
    cat > /etc/systemd/system/maitri-ai.service << EOF
[Unit]
Description=MAITRI Space Station AI/ML System
After=network.target

[Service]
Type=simple
User=maitri
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=4000

[Install]
WantedBy=multi-user.target
EOF
fi

# Create startup script
echo "📝 Creating startup script..."
cat > start-maitri.sh << 'EOF'
#!/bin/bash

# MAITRI Space Station AI/ML System Startup Script

echo "🚀 Starting MAITRI Space Station AI/ML System..."

# Check if system is already running
if pgrep -f "node dist/index.js" > /dev/null; then
    echo "⚠️ System is already running"
    exit 1
fi

# Start the main server
echo "🌐 Starting main server..."
npm start &

# Start the offline system
echo "🤖 Starting offline AI system..."
python3 src/standalone/offline-system.py start 1 &

# Start monitoring processes
echo "📊 Starting monitoring processes..."
python3 src/ai/emotion-detector.py &

echo "✅ MAITRI Space Station AI/ML System started successfully"
echo "🌐 Main server: http://localhost:4000"
echo "📊 Monitoring dashboard: http://localhost:4000/ground-control/dashboard"
echo "🤖 AI companion: http://localhost:4000/crew-monitoring/ai-companion"

# Keep the script running
wait
EOF

chmod +x start-maitri.sh

# Create health check script
echo "📝 Creating health check script..."
cat > health-check.sh << 'EOF'
#!/bin/bash

# MAITRI Space Station AI/ML System Health Check

echo "🔍 Checking MAITRI Space Station AI/ML System health..."

# Check if main server is running
if curl -s http://localhost:4000/health > /dev/null; then
    echo "✅ Main server is healthy"
else
    echo "❌ Main server is not responding"
    exit 1
fi

# Check if database is accessible
if [ -f "data.sqlite" ]; then
    echo "✅ Database is accessible"
else
    echo "❌ Database not found"
    exit 1
fi

# Check if models are available
if [ -f "models/facial_emotion_model.h5" ] && [ -f "models/voice_emotion_model.h5" ]; then
    echo "✅ AI models are available"
else
    echo "❌ AI models not found"
    exit 1
fi

# Check Python dependencies
python3 -c "import tensorflow, cv2, librosa, numpy" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Python dependencies are available"
else
    echo "❌ Python dependencies missing"
    exit 1
fi

echo "🎉 All health checks passed!"
EOF

chmod +x health-check.sh

# Create configuration file
echo "📝 Creating configuration file..."
cat > config.json << 'EOF'
{
  "server": {
    "port": 4000,
    "host": "localhost",
    "environment": "production"
  },
  "database": {
    "path": "./data.sqlite",
    "backup_interval": 3600,
    "retention_days": 30
  },
  "ai": {
    "models_path": "./models",
    "confidence_threshold": 0.7,
    "critical_thresholds": {
      "stress": 0.7,
      "depression": 0.6,
      "anxiety": 0.8,
      "isolation": 0.5
    }
  },
  "monitoring": {
    "check_interval": 60,
    "alert_threshold": 0.8,
    "offline_mode": true
  },
  "crew": {
    "max_concurrent_monitoring": 10,
    "analysis_interval": 300,
    "retention_hours": 24
  }
}
EOF

# Create log rotation configuration
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/maitri-ai << 'EOF'
/var/log/maitri-ai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 maitri maitri
    postrotate
        systemctl reload maitri-ai
    endscript
}
EOF

# Set up permissions
echo "🔐 Setting up permissions..."
chmod 755 models
chmod 755 uploads
chmod 755 alerts
chmod 755 data
chmod 755 logs

# Create user for the service
if ! id "maitri" &>/dev/null; then
    echo "👤 Creating maitri user..."
    useradd -r -s /bin/false maitri
fi

# Set ownership
chown -R maitri:maitri .

# Run health check
echo "🔍 Running health check..."
./health-check.sh

if [ $? -eq 0 ]; then
    echo "🎉 MAITRI Space Station AI/ML System installed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Start the system: ./start-maitri.sh"
    echo "2. Check health: ./health-check.sh"
    echo "3. Access dashboard: http://localhost:4000/ground-control/dashboard"
    echo "4. Test AI companion: http://localhost:4000/crew-monitoring/ai-companion"
    echo ""
    echo "📚 Documentation: README-AI-ML.md"
    echo "🔧 Configuration: config.json"
    echo "📊 Logs: logs/"
else
    echo "❌ Installation failed. Please check the errors above."
    exit 1
fi
