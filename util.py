import json
import pickle
import numpy as np
import warnings
import os
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

locations = None
data_columns = None
model = None

def load_details():
    """Load model and column metadata."""
    global locations, data_columns, model
    try:
        columns_path = os.path.join(os.path.dirname(__file__), 'columns_new.json')
        model_path = os.path.join(os.path.dirname(__file__), 'home_prices_model_new.pickle')
        with open(columns_path, 'r') as f:
            data_columns = json.load(f)['data_columns']
            locations = data_columns[3:]  # Exclude total_sqft, bath, bed
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print("Model and columns loaded successfully!")
        return {"status": "success", "message": "Model and columns loaded successfully!"}
    except FileNotFoundError as e:
        missing_file = os.path.basename(str(e.filename)) if e.filename else "unknown file"
        print(f"Error: File not found - {missing_file}")
        return {"status": "error", "message": f"File not found: {missing_file}"}
    except Exception as e:
        print(f"Error loading model/columns: {e}")
        return {"status": "error", "message": str(e)}

def get_location():
    """Return available locations."""
    if locations is None:
        raise ValueError("Locations not loaded. Call load_details() first.")
    return locations

def estimate_price(location, sqft, bath, bhk):
    """Predict house price given location, sqft, bath, and bhk."""
    try:
        loc_index = data_columns.index(location.lower()) if location.lower() in data_columns else -1
        x = np.zeros(len(data_columns))
        x[0] = sqft
        x[1] = bath
        x[2] = bhk
        if loc_index >= 0:
            x[loc_index] = 1
        prediction = model.predict([x])[0]
        return float(round(prediction, 2))  # Convert float32 to float
    except Exception as e:
        print(f"Prediction error for {location}, {sqft}, {bath}, {bhk}: {e}")
        return None