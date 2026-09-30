import os
import sys
import json
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path('.env.local')
if not env_path.exists():
    env_path = Path('.env')
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
    sys.exit(1)

# Do NOT print the secret key
# print(f"Using Supabase URL: {SUPABASE_URL}")

def import_members(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print("Failed to read dataset. Ensure the path is correct and it is a valid JSON.")
        sys.exit(1)

    print(f"Loaded {len(data)} records from dataset.")

    success_count = 0
    skip_count = 0
    fail_count = 0
    duplicate_count = 0

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates" # Upsert behavior
    }

    endpoint = f"{SUPABASE_URL}/rest/v1/members"

    # Batching to avoid huge payloads, though 1000 records is small enough for one request
    batch_size = 100
    for i in range(0, len(data), batch_size):
        batch = data[i:i + batch_size]
        
        # Clean and validate records
        cleaned_batch = []
        for record in batch:
            # Basic validation
            if not record.get("id") or not record.get("name"):
                print("Skipping record due to missing id or name.")
                skip_count += 1
                continue
            
            # Clean formatting (e.g., stripping whitespace)
            cleaned_record = {
                "id": record.get("id").strip(),
                "name": record.get("name").strip() if record.get("name") else None,
                "role": record.get("role").strip() if record.get("role") else None,
                "batch": str(record.get("batch")).strip() if record.get("batch") else None,
                "status": record.get("status").strip() if record.get("status") else None,
                "skills": [s.strip() for s in record.get("skills", [])] if record.get("skills") else [],
                "avatar_url": record.get("avatar_url"),
                "github_url": record.get("github_url"),
                "github_handle": record.get("github_handle"),
                "linkedin_url": record.get("linkedin_url"),
                "bio": record.get("bio"),
                "created_at": record.get("created_at"),
                "updated_at": record.get("updated_at"),
                "image_url": record.get("image_url"),
                # email is not present in dataset, so it remains omitted here. It will be NULL in DB.
            }
            cleaned_batch.append(cleaned_record)

        if not cleaned_batch:
            continue

        try:
            # Using POST with Prefer: resolution=merge-duplicates acts as an UPSERT on Primary Key (id)
            response = requests.post(endpoint, headers=headers, json=cleaned_batch)
            if response.status_code in (200, 201):
                success_count += len(cleaned_batch)
                # Note: merge-duplicates will update existing records, we count them as success.
                # If we wanted to strictly skip them, we could use Prefer: resolution=ignore-duplicates
            else:
                print(f"Failed to import batch. Status code: {response.status_code}")
                # Do NOT expose secrets in error messages
                # print(response.text) # Uncomment for local debugging only, but don't commit
                fail_count += len(cleaned_batch)
        except Exception as e:
            print("Exception occurred during import request.")
            fail_count += len(cleaned_batch)

    print("\n--- Import Summary ---")
    print(f"Successfully processed/upserted: {success_count}")
    print(f"Skipped (invalid data): {skip_count}")
    print(f"Failed: {fail_count}")
    print("----------------------")

if __name__ == "__main__":
    dataset_path = "/home/srishan-bangera/Downloads/xlpro-members-export/members.json"
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}")
        sys.exit(1)
    
    import_members(dataset_path)
