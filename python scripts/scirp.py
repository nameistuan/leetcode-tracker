import json

def generate_json_from_txt(txt_file_path, output_json_file):
    # Read the problems from the .txt file
    with open(txt_file_path, 'r') as file:
        problems = [line.strip() for line in file.readlines()]
    
    # Ensure that the number of problems is divisible by 2
    if len(problems) % 2 != 0:
        problems.append("")  # Add an empty problem to make the count even
    
    # Generate the list of day-problem pairs
    day_problem_list = []
    for i in range(0, len(problems), 2):
        day_problem_list.append({
            "day": (i // 2) + 1,
            "problems": problems[i:i+2]
        })
    
    # Write the result to a JSON file
    with open(output_json_file, 'w') as json_file:
        json.dump(day_problem_list, json_file, indent=2)

# Example usage
generate_json_from_txt(r'C:\Users\Tuan Le\OneDrive\Desktop\code projects\leetcode-tracker\newprob.txt', r'C:\Users\Tuan Le\OneDrive\Desktop\code projects\leetcode-tracker\daily2.json')
