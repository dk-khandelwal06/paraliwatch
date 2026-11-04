# PARALIWATCH (PROJECT 007)

> **Tagline:** A Self-Updating Satellite Fire Tracker for Punjab's Paddy-Residue Burning Season.  
> **Domain:** Environmental Intelligence | Remote Sensing | Applied Machine Learning | Atmospheric Science  
> **Primary Deployment:** Vercel (Next.js App Router)  
> **Automated Pipeline:** GitHub Actions (Daily 02:37 UTC)

---

## 1. Executive Summary

ParaliWatch is an environmental intelligence platform that monitors, visualizes, and models agricultural crop-residue (paddy stubble) burning across the state of Punjab, India. 

Rather than presenting static infographics or simulated data, ParaliWatch couples:
- **NASA FIRMS Near-Real-Time (NRT) 375m VIIRS S-NPP** thermal anomaly detections.
- **Open-Meteo Historical Weather API** meteorological observations across 5 key monitoring hubs (Amritsar, Ludhiana, Patiala, Sangrur, Bathinda).
- **Ridge Regression Forecasting** formulated on $\log(1 + \text{Count})$ to estimate next-day fire activity.
- **Transparent Baseline Benchmarking** against Persistence ($\hat{y}_{t+1} = y_t$) and 7-Day Moving Averages.
- **Automated Daily Ingestion** using GitHub Actions with idempotent, uncorrupted data updates.
- **A 3-Theme Environmental Interface** (Light Ivory, Dark Forest, Dusk Sage) built with Next.js App Router, Tailwind CSS, Leaflet, and Recharts.

---

## 2. System Architecture

```
[NASA FIRMS VIIRS 375m]       [Open-Meteo Weather API]
          \                          /
           \                        /
      [src/fetch_fires.py]    [src/fetch_weather.py]
            \                      /
             v                    v
          [src/build_features.py (Zero Lookahead)]
                      |
                      v
          [src/train.py (Ridge α=1.5, Test: Season 2025)]
                      |
                      v
          [src/predict.py (Next-Day Forecast & Prospective Scorecard)]
                      |
                      v
          [src/update_data.py -> public/data/*.json]
                      |
                      v
          [Next.js App Router on Vercel]
```

---

## 3. Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+ (tested on Node v20/v26)
- npm or pnpm

### 1. Clone & Configure Environment
```bash
git clone https://github.com/your-username/paraliwatch.git
cd paraliwatch

# Copy example environment configuration
cp .env.example .env
```
Edit `.env` and supply your NASA FIRMS map key:
```ini
FIRMS_MAP_KEY=your_firms_map_key_here
```

### 2. Run the Python Pipeline
```bash
# Install Python requirements
pip install -r requirements.txt

# Run unit tests
python -m unittest discover tests

# Execute the automated satellite ingestion & ML pipeline
python -u src/update_data.py
```
This updates `public/data/` with the latest satellite detections, weather covariates, Ridge model artifacts, and prospective forecast scorecards.

### 3. Run the Next.js Frontend
```bash
# Install npm dependencies
npm install

# Build for production
npm run build

# Start production server locally
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 4. GitHub Actions Daily Automation Setup

The workflow at `.github/workflows/daily_update.yml` runs daily at **02:37 UTC** (08:07 AM IST):
1. In your GitHub repository, navigate to **Settings > Secrets and variables > Actions**.
2. Click **New repository secret**.
3. Name: `FIRMS_MAP_KEY`
4. Value: Paste your NASA FIRMS API key.
5. Save. Under **Actions > General > Workflow permissions**, ensure **Read and write permissions** are granted so the workflow can commit updated JSON artifacts to `public/data/`.

---

## 5. Deploying to Vercel

ParaliWatch is designed for zero-config Vercel deployment:
1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Select your GitHub repository.
4. Framework Preset: **Next.js** (detected automatically).
5. Root Directory: `./` (leave default).
6. Environment Variables (Optional):
   - `NEXT_PUBLIC_DATA_BASE_URL`: Leave empty to read directly from local bundled `public/data/`, or specify your repository's raw GitHub URL if decoupling frontend deployments.
7. Click **Deploy**.

---

## 6. Scientific Honesty & Observational Limitations

1. **Physical Sensor Constraints:** Suomi-NPP VIIRS passes over Punjab ~13:30 local time (daytime) and ~01:30 local time (nighttime). Fires extinguished before overpass or ignited between orbits evade satellite observation.
2. **Cloud & Smoke Attenuation:** Heavy cloud cover and thick surface smoke plumes attenuate 4µm thermal emission, potentially depressing detected Fire Radiative Power (FRP).
3. **No Legal Attribution:** A thermal anomaly indicates an active surface heat emitter. It is not legal proof of crop-residue incineration on a specific land parcel and does not identify individual landowners.
4. **Air Quality Non-Linearity:** Stubble burning contributes particulate matter to the regional airshed, but urban air quality indices (e.g. Delhi NCR AQI) are strongly dictated by boundary layer height, temperature inversions, wind stagnation, and baseline vehicular/industrial emissions.
5. **Model Evaluation Integrity:** Ridge Regression is benchmarked against Persistence (tomorrow equals today). When seasonal dynamics make persistence superior, ParaliWatch reports this result honestly without retrospective revision.

---

## 7. License & Attribution

- **Active Fire Data:** NASA FIRMS / MODAPS (Suomi-NPP VIIRS 375m).
- **Meteorological Data:** Open-Meteo Historical Weather API (CC BY 4.0).
- **Code:** Open-source under MIT License.

