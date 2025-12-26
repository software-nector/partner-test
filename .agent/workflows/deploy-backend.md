---
description: How to deploy the FastAPI backend to a VPS server
---

// turbo-all

1. Update system packages
```bash
sudo apt update && sudo apt upgrade -y
```

2. Install dependencies
```bash
sudo apt install python3-pip python3-venv nginx git -y
```

3. Clone the project (if not already done)
```bash
git clone https://github.com/software-nector/partner-project.git
cd partner-project/server
```

4. Setup Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

5. Setup Environment Variables
> [!NOTE]
> Copy your local .env contents to the server
```bash
nano .env
```

6. Start the server with PM2
```bash
sudo npm install -g pm2
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name purna-backend
```

7. Setup Nginx (Optional)
```bash
sudo nano /etc/nginx/sites-available/purna
# Add reverse proxy config here
```
