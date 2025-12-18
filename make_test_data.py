import csv
import random

def generate_realistic_data(rows_per_file):
    # Configuration
    headers = ['ID', 'TransactionDate', 'CustomerName', 'Amount', 'Status', 'Region']
    names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Davis', 'Elena Rodriguez', 'Sam Wilson']
    statuses = ['Completed', 'Pending', 'Cancelled']
    regions = ['North', 'South', 'East', 'West']

    # 1. Create a pool of IDs to ensure some overlap
    # We'll make about 60% of the IDs overlap between the two files
    total_unique_ids = int(rows_per_file * 1.4) 
    all_ids = [f"TXN-{i:06d}" for i in range(1, total_unique_ids)]
    
    # Shuffle and split into two overlapping sets
    random.shuffle(all_ids)
    file_a_ids = all_ids[:rows_per_file]
    file_b_ids = all_ids[int(rows_per_file * 0.4) : int(rows_per_file * 0.4) + rows_per_file]

    def write_file(filename, id_list):
        with open(filename, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            for txn_id in id_list:
                # Add slight data variations (different status or amount for same ID)
                writer.writerow([
                    txn_id,
                    f"2024-12-{random.randint(1, 31):02d}",
                    random.choice(names),
                    round(random.uniform(10.0, 500.0), 2),
                    random.choice(statuses),
                    random.choice(regions)
                ])
        print(f"Created {filename} with {len(id_list)} rows.")

    write_file('sales_data_alpha.csv', file_a_ids)
    write_file('sales_data_beta.csv', file_b_ids)

# Generate 150k rows each with roughly 60% overlap
generate_realistic_data(150000)