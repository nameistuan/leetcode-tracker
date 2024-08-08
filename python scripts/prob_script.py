import json

# Path to the JSON file containing problem names
json_file_path = r'C:\Users\Tuan Le\OneDrive\Desktop\code projects\leetcode-tracker\public\data.json'

# Path to the text file with problem names to check
txt_file_path = r'C:\Users\Tuan Le\OneDrive\Desktop\code projects\leetcode-tracker\newprob.txt'

# # Read the JSON data from the file
# with open(json_file_path, 'r') as file:
#     problems = json.load(file)

# # Extract the names of all problems from JSON
# problem_names = [problem["name"] for problem in problems]

# # Read the problem names from the text file
# with open(txt_file_path, 'r') as file:
#     problems_to_check = [line.strip() for line in file]

# # Find and print the problem names that are not in the JSON list
# missing_problems = [name for name in problems_to_check if name not in problem_names]

# if missing_problems:
#     print("Problems not found in the JSON list:")
#     for name in missing_problems:
#         print(name)
# else:
#     print("All problems from the text file are in the JSON list.")


# #Read the JSON data from the file
# with open(json_file_path, 'r') as file:
#     problems = json.load(file)

# # Extract the names of all problems from JSON
# problem_names = [problem["name"] for problem in problems]

# # Read the problem names from the text file
# with open(txt_file_path, 'r') as file:
#     problems_to_check = [line.strip() for line in file]

# # Find and print the problem names that are in the JSON list but not in the text file
# missing_in_txt = [name for name in problem_names if name not in problems_to_check]

# if missing_in_txt:
#     print("Problems in the JSON file but not in the text file:")
#     for name in missing_in_txt:
#         print(name)
# else:
#     print("All problems from the JSON file are in the text file.")

# Read the JSON data from the file
with open(json_file_path, 'r') as file:
    problems = json.load(file)

# Extract the names of all problems from JSON
problem_names_in_json = [problem["name"] for problem in problems]

# Read the problem names from the text file
with open(txt_file_path, 'r') as file:
    problems_to_keep = [line.strip() for line in file]

# Track problems found and those to be removed
problems_found = []
problems_to_remove = []

# Search for problems from the text file in the JSON data
for problem_name in problems_to_keep:
    if problem_name in problem_names_in_json:
        problems_found.append(problem_name)
    else:
        print(f"Problem '{problem_name}' not found in data.json")

# Identify problems in the JSON that are not in the text file
for problem in problems:
    if problem["name"] not in problems_to_keep:
        print(f"Removing extra problem '{problem['name']}' from data.json")
        problems_to_remove.append(problem)

# Remove the extra problems from the JSON data
for problem in problems_to_remove:
    problems.remove(problem)

# Save the updated JSON data back to the file
with open(json_file_path, 'w') as file:
    json.dump(problems, file, indent=4)

print("Updated data.json saved.")
